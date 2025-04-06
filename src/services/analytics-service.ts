import { apiClient } from './api';

/**
 * 分析服务
 * 处理用户行为分析、使用情况统计等功能
 */
const analyticsService = {
  /**
   * 获取用户活跃度分析
   * @param period 统计周期
   */
  getUserActivity: async (period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<{
    activities: Array<{
      date: string;
      count: number;
      category?: string;
    }>;
    totalCount: number;
    averagePerDay: number;
  } | null> => {
    try {
      const response = await apiClient.get<{
        activities: Array<{
          date: string;
          count: number;
          category?: string;
        }>;
        totalCount: number;
        averagePerDay: number;
      }>(`/analytics/user-activity?period=${period}`);
      
      return response || null;
    } catch (error) {
      console.error('获取用户活跃度分析失败:', error);
      return null;
    }
  },

  /**
   * 获取功能使用情况分析
   */
  getFeatureUsage: async (): Promise<{
    features: Array<{
      name: string;
      count: number;
      percentage: number;
    }>;
    totalCount: number;
  } | null> => {
    try {
      const response = await apiClient.get<{
        features: Array<{
          name: string;
          count: number;
          percentage: number;
        }>;
        totalCount: number;
      }>('/analytics/feature-usage');
      
      return response || null;
    } catch (error) {
      console.error('获取功能使用情况分析失败:', error);
      return null;
    }
  },

  /**
   * 获取AI助手使用情况
   */
  getAssistantUsage: async (): Promise<{
    conversations: number;
    messages: number;
    topTemplates: Array<{
      id: string;
      name: string;
      count: number;
    }>;
    averageResponseTime: number;
    responsesByDay: Array<{
      date: string;
      count: number;
    }>;
  } | null> => {
    try {
      const response = await apiClient.get<{
        conversations: number;
        messages: number;
        topTemplates: Array<{
          id: string;
          name: string;
          count: number;
        }>;
        averageResponseTime: number;
        responsesByDay: Array<{
          date: string;
          count: number;
        }>;
      }>('/analytics/assistant-usage');
      
      return response || null;
    } catch (error) {
      console.error('获取AI助手使用情况失败:', error);
      return null;
    }
  },

  /**
   * 获取用户生产力分析
   */
  getProductivityAnalytics: async (): Promise<{
    taskCompletion: {
      completed: number;
      total: number;
      completionRate: number;
    };
    tasksByCategory: Array<{
      category: string;
      count: number;
      percentage: number;
    }>;
    notesCreated: number;
    averageTaskCompletionTime: number;
  } | null> => {
    try {
      const response = await apiClient.get<{
        taskCompletion: {
          completed: number;
          total: number;
          completionRate: number;
        };
        tasksByCategory: Array<{
          category: string;
          count: number;
          percentage: number;
        }>;
        notesCreated: number;
        averageTaskCompletionTime: number;
      }>('/analytics/productivity');
      
      return response || null;
    } catch (error) {
      console.error('获取用户生产力分析失败:', error);
      return null;
    }
  },

  /**
   * 获取IoT设备使用情况
   */
  getIoTAnalytics: async (): Promise<{
    devicesCount: number;
    scenesCount: number;
    deviceUsage: Array<{
      deviceId: string;
      deviceName: string;
      usageTime: number;
      commandsCount: number;
    }>;
    mostUsedScenes: Array<{
      sceneId: string;
      sceneName: string;
      executionCount: number;
    }>;
    energySavings?: {
      value: number;
      unit: string;
      percentage: number;
    };
  } | null> => {
    try {
      const response = await apiClient.get<{
        devicesCount: number;
        scenesCount: number;
        deviceUsage: Array<{
          deviceId: string;
          deviceName: string;
          usageTime: number;
          commandsCount: number;
        }>;
        mostUsedScenes: Array<{
          sceneId: string;
          sceneName: string;
          executionCount: number;
        }>;
        energySavings?: {
          value: number;
          unit: string;
          percentage: number;
        };
      }>('/analytics/iot');
      
      return response || null;
    } catch (error) {
      console.error('获取IoT设备使用情况失败:', error);
      return null;
    }
  },

  /**
   * 获取创意内容生成分析
   */
  getCreativeAnalytics: async (): Promise<{
    contentCount: number;
    contentByType: Array<{
      type: string;
      count: number;
      percentage: number;
    }>;
    averageGenerationTime: number;
    popularStyles: Array<{
      style: string;
      count: number;
    }>;
  } | null> => {
    try {
      const response = await apiClient.get<{
        contentCount: number;
        contentByType: Array<{
          type: string;
          count: number;
          percentage: number;
        }>;
        averageGenerationTime: number;
        popularStyles: Array<{
          style: string;
          count: number;
        }>;
      }>('/analytics/creative');
      
      return response || null;
    } catch (error) {
      console.error('获取创意内容生成分析失败:', error);
      return null;
    }
  },

  /**
   * 记录分析事件
   * @param event 事件信息
   */
  trackEvent: async (event: {
    eventType: string;
    category: string;
    action: string;
    label?: string;
    value?: number;
    metadata?: Record<string, any>;
  }): Promise<boolean> => {
    try {
      await apiClient.post('/analytics/track-event', event);
      return true;
    } catch (error) {
      console.error('记录分析事件失败:', error);
      return false;
    }
  }
};

export default analyticsService; 