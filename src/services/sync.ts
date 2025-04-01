import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from './api';

// 定义离线队列项类型
interface QueueItem {
  id: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
  timestamp: number;
}

// 定义同步上下文类型
interface SyncContextType {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  pendingActions: number;
  syncNow: () => Promise<void>;
  addToQueue: (endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE', data?: any) => Promise<string>;
  removeFromQueue: (id: string) => Promise<void>;
}

// 创建同步上下文
const SyncContext = createContext<SyncContextType | undefined>(undefined);

// 同步提供者组件
export const SyncProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  
  // 初始化时从AsyncStorage加载队列
  useEffect(() => {
    const loadQueue = async () => {
      try {
        const storedQueue = await AsyncStorage.getItem('offlineQueue');
        if (storedQueue) {
          setQueue(JSON.parse(storedQueue));
        }
      } catch (error) {
        console.error('Failed to load offline queue:', error);
      }
    };
    
    loadQueue();
  }, []);
  
  // 监听网络状态变化
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const online = state.isConnected ?? false;
      setIsOnline(online);
      
      // 当网络恢复时，尝试同步
      if (online && !isSyncing && queue.length > 0) {
        syncNow();
      }
    });
    
    return () => unsubscribe();
  }, [queue, isSyncing]);
  
  // 保存队列到AsyncStorage
  const saveQueue = async (newQueue: QueueItem[]) => {
    try {
      await AsyncStorage.setItem('offlineQueue', JSON.stringify(newQueue));
    } catch (error) {
      console.error('Failed to save offline queue:', error);
    }
  };
  
  // 添加操作到队列
  const addToQueue = async (
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    data?: any
  ): Promise<string> => {
    const id = Date.now().toString();
    const newItem: QueueItem = {
      id,
      endpoint,
      method,
      data,
      timestamp: Date.now(),
    };
    
    const newQueue = [...queue, newItem];
    setQueue(newQueue);
    await saveQueue(newQueue);
    
    return id;
  };
  
  // 从队列中移除操作
  const removeFromQueue = async (id: string): Promise<void> => {
    const newQueue = queue.filter(item => item.id !== id);
    setQueue(newQueue);
    await saveQueue(newQueue);
  };
  
  // 执行同步
  const syncNow = async (): Promise<void> => {
    if (!isOnline || isSyncing || queue.length === 0) {
      return;
    }
    
    setIsSyncing(true);
    
    try {
      // 按时间戳排序队列
      const sortedQueue = [...queue].sort((a, b) => a.timestamp - b.timestamp);
      
      for (const item of sortedQueue) {
        try {
          // 根据方法类型执行相应的API调用
          switch (item.method) {
            case 'GET':
              await apiService.custom.get(item.endpoint);
              break;
            case 'POST':
              await apiService.custom.post(item.endpoint, item.data);
              break;
            case 'PUT':
              await apiService.custom.put(item.endpoint, item.data);
              break;
            case 'DELETE':
              await apiService.custom.delete(item.endpoint);
              break;
          }
          
          // 成功后从队列中移除
          await removeFromQueue(item.id);
        } catch (error) {
          console.error(`Failed to sync item ${item.id}:`, error);
          // 如果是网络错误，停止同步
          if (!navigator.onLine) {
            break;
          }
          // 其他错误继续处理下一个
        }
      }
      
      // 更新最后同步时间
      const now = new Date();
      setLastSyncTime(now);
      await AsyncStorage.setItem('lastSyncTime', now.toISOString());
    } finally {
      setIsSyncing(false);
    }
  };
  
  // 提供上下文值
  const contextValue: SyncContextType = {
    isOnline,
    isSyncing,
    lastSyncTime,
    pendingActions: queue.length,
    syncNow,
    addToQueue,
    removeFromQueue,
  };
  
  return (
    <SyncContext.Provider value={contextValue}>
      {children}
    </SyncContext.Provider>
  );
};

// 使用同步上下文的钩子
export const useSync = (): SyncContextType => {
  const context = useContext(SyncContext);
  if (context === undefined) {
    throw new Error('useSync must be used within a SyncProvider');
  }
  return context;
};

// 扩展API服务以支持离线操作
const apiService = {
  // 原始API服务
  ...apiService,
  
  // 自定义方法，用于直接访问API
  custom: {
    get: (endpoint: string) => apiService.api.get(endpoint),
    post: (endpoint: string, data?: any) => apiService.api.post(endpoint, data),
    put: (endpoint: string, data?: any) => apiService.api.put(endpoint, data),
    delete: (endpoint: string) => apiService.api.delete(endpoint),
  },
  
  // 离线支持的API方法
  offline: {
    // 使用方法：apiService.offline.post('/endpoint', data, { offlineEnabled: true })
    get: async (endpoint: string, options?: { offlineEnabled?: boolean }) => {
      const { useSync } = require('./sync');
      const { isOnline, addToQueue } = useSync();
      
      if (isOnline) {
        return apiService.custom.get(endpoint);
      } else if (options?.offlineEnabled) {
        await addToQueue(endpoint, 'GET');
        throw new Error('操作已加入离线队列，将在网络恢复后执行');
      } else {
        throw new Error('网络连接不可用');
      }
    },
    
    post: async (endpoint: string, data?: any, options?: { offlineEnabled?: boolean }) => {
      const { useSync } = require('./sync');
      const { isOnline, addToQueue } = useSync();
      
      if (isOnline) {
        return apiService.custom.post(endpoint, data);
      } else if (options?.offlineEnabled) {
        await addToQueue(endpoint, 'POST', data);
        throw new Error('操作已加入离线队列，将在网络恢复后执行');
      } else {
        throw new Error('网络连接不可用');
      }
    },
    
    put: async (endpoint: string, data?: any, options?: { offlineEnabled?: boolean }) => {
      const { useSync } = require('./sync');
      const { isOnline, addToQueue } = useSync();
      
      if (isOnline) {
        return apiService.custom.put(endpoint, data);
      } else if (options?.offlineEnabled) {
        await addToQueue(endpoint, 'PUT', data);
        throw new Error('操作已加入离线队列，将在网络恢复后执行');
      } else {
        throw new Error('网络连接不可用');
      }
    },
    
    delete: async (endpoint: string, options?: { offlineEnabled?: boolean }) => {
      const { useSync } = require('./sync');
      const { isOnline, addToQueue } = useSync();
      
      if (isOnline) {
        return apiService.custom.delete(endpoint);
      } else if (options?.offlineEnabled) {
        await addToQueue(endpoint, 'DELETE');
        throw new Error('操作已加入离线队列，将在网络恢复后执行');
      } else {
        throw new Error('网络连接不可用');
      }
    },
  },
};

export default apiService;
