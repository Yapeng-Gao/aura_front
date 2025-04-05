import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService, { OfflineApiService } from './api';

// 在apiService中声明offline属性
declare module './api' {
  interface ApiService {
    offline: typeof offlineApiService;
  }
}

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

// 简单的网络连接检查函数
const checkNetworkConnection = async (): Promise<boolean> => {
  try {
    // 发送一个简单的GET请求到API服务器检查连接
    await fetch(`${apiService.api.defaults.baseURL}/ping`, { 
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      // 短超时，避免长时间等待
      signal: AbortSignal.timeout(3000)
    });
    return true;
  } catch (error) {
    console.log('Network connection check failed:', error);
    return false;
  }
};

// 同步提供者函数组件
export function SyncProvider({ children }: { children: ReactNode }) {
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
  
  // 周期性检查网络状态
  useEffect(() => {
    const checkNetwork = async () => {
      const online = await checkNetworkConnection();
      setIsOnline(online);
      
      // 当网络恢复时，尝试同步
      if (online && !isSyncing && queue.length > 0) {
        syncNow();
      }
    };
    
    // 初始检查
    checkNetwork();
    
    // 设置定期检查
    const intervalId = setInterval(checkNetwork, 30000); // 每30秒检查一次
    
    // 在用户回到应用时检查
    const handleAppStateChange = () => {
      checkNetwork();
    };
    
    // 注册事件监听
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleAppStateChange);
    }
    
    return () => {
      clearInterval(intervalId);
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleAppStateChange);
      }
    };
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
      // 再次检查网络连接
      const online = await checkNetworkConnection();
      if (!online) {
        setIsOnline(false);
        return;
      }
      
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
        } catch (error: any) { // 显式类型标注为any
          console.error(`Failed to sync item ${item.id}:`, error);
          // 检查是否为网络错误
          const isNetworkError = 
            (typeof navigator !== 'undefined' && !navigator.onLine) || 
            (error.message && typeof error.message === 'string' && error.message.includes('network'));
          
          if (isNetworkError) {
            setIsOnline(false);
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
  
  // 返回SyncContext.Provider，确保使用JSX原生语法，而不是条件判断
  return {
    type: SyncContext.Provider,
    props: {
      value: contextValue,
      children: children
    }
  };
}

// 使用同步上下文的钩子
export const useSync = (): SyncContextType => {
  const context = useContext(SyncContext);
  if (context === undefined) {
    throw new Error('useSync must be used within a SyncProvider');
  }
  return context;
};

// 离线API模块 - 使用统一的apiService
export const offlineApiService: OfflineApiService = {
  // 使用方法：offlineApiService.get('/endpoint', { offlineEnabled: true })
  get: async <T>(endpoint: string, options?: { offlineEnabled?: boolean }): Promise<T | undefined> => {
    const { isOnline, addToQueue } = useSync();
    
    if (isOnline) {
      return apiService.custom.get<T>(endpoint);
    } else if (options?.offlineEnabled) {
      await addToQueue(endpoint, 'GET');
      throw new Error('操作已加入离线队列，将在网络恢复后执行');
    } else {
      throw new Error('网络连接不可用');
    }
  },
  
  post: async <T>(endpoint: string, data?: any, options?: { offlineEnabled?: boolean }): Promise<T | undefined> => {
    const { isOnline, addToQueue } = useSync();
    
    if (isOnline) {
      return apiService.custom.post<T>(endpoint, data);
    } else if (options?.offlineEnabled) {
      await addToQueue(endpoint, 'POST', data);
      throw new Error('操作已加入离线队列，将在网络恢复后执行');
    } else {
      throw new Error('网络连接不可用');
    }
  },
  
  put: async <T>(endpoint: string, data?: any, options?: { offlineEnabled?: boolean }): Promise<T | undefined> => {
    const { isOnline, addToQueue } = useSync();
    
    if (isOnline) {
      return apiService.custom.put<T>(endpoint, data);
    } else if (options?.offlineEnabled) {
      await addToQueue(endpoint, 'PUT', data);
      throw new Error('操作已加入离线队列，将在网络恢复后执行');
    } else {
      throw new Error('网络连接不可用');
    }
  },
  
  delete: async <T>(endpoint: string, options?: { offlineEnabled?: boolean }): Promise<T | undefined> => {
    const { isOnline, addToQueue } = useSync();
    
    if (isOnline) {
      return apiService.custom.delete<T>(endpoint);
    } else if (options?.offlineEnabled) {
      await addToQueue(endpoint, 'DELETE');
      throw new Error('操作已加入离线队列，将在网络恢复后执行');
    } else {
      throw new Error('网络连接不可用');
    }
  }
};

// 将离线API功能添加到apiService
apiService.offline = offlineApiService;

export default apiService;
