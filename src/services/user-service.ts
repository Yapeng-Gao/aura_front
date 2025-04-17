import {apiClient, AUTH_TOKEN_KEY} from './api';
import AsyncStorage from "@react-native-async-storage/async-storage";

// 用户相关接口
interface User {
    user_id: string;
    email: string;
    name: string;
    phone_number: string;
    profile_image_url: string;
    status: string;
    created_at: string;
    preferences?: Record<string, any>;
    settings?: Record<string, any>;
}

interface UserActivity {
    id: string;
    userId: string;
    type: string;
    title: string;
    description?: string;
    timestamp: string;
    metadata?: Record<string, any>;
}

interface UserStats {
    assistantUsage: {
        totalConversations: number;
        totalMessages: number;
        favoriteAssistants: Array<{ id: string; name: string; count: number }>;
    };
    schedulerUsage: {
        totalEvents: number;
        totalTasks: number;
        completedTasks: number;
    };
    productivityUsage: {
        totalNotes: number;
        totalMeetings: number;
    };
    iotUsage: {
        totalDevices: number;
        totalScenes: number;
        mostUsedDevices: Array<{ id: string; name: string; count: number }>;
    };
    creativeUsage: {
        totalContent: number;
        totalGenerated: number;
    };
}

interface NotificationSettings {
    email: boolean;
    push: boolean;
    inApp: boolean;
    categories: {
        assistant: boolean;
        scheduler: boolean;
        productivity: boolean;
        iot: boolean;
        creative: boolean;
        system: boolean;
    };
}

interface AppearanceSettings {
    theme: 'light' | 'dark' | 'system';
    fontSize: 'small' | 'medium' | 'large';
    fontFamily?: string;
    highContrast: boolean;
}

interface PrivacySettings {
    dataCollection: boolean;
    usageAnalytics: boolean;
    contentSharing: boolean;
    crashReporting: boolean;
}

interface NotificationPreview {
    id: string;
    userId: string;
    type: string;
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
    actionUrl?: string;
    metadata?: Record<string, any>;
}

/**
 * 用户服务
 * 处理用户资料、偏好设置、统计信息等功能
 */
const userService = {
    /**
     * 获取用户资料
     */
    getProfile: async (): Promise<User | null> => {
        try {
            const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
            if (!token) {
                throw new Error('未找到认证令牌');
            }
            
            const response = await apiClient.get<User>('/users/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response || null;
        } catch (error) {
            console.error('获取用户资料失败:', error);
            return null;
        }
    },

    /**
     * 获取用户活动历史
     * @param limit 限制返回的记录数
     * @param offset 分页偏移量
     */
    getUserActivities: async (limit: number = 20, offset: number = 0): Promise<UserActivity[]> => {
        try {
            const response = await apiClient.get<UserActivity[]>(`/users/activities?limit=${limit}&offset=${offset}`);
            return response || [];
        } catch (error) {
            console.error('获取用户活动历史失败:', error);
            return [];
        }
    },

    /**
     * 获取用户使用统计信息
     */
    getUserStats: async (): Promise<UserStats | null> => {
        try {
            const response = await apiClient.get<UserStats>('/users/stats');
            return response || null;
        } catch (error) {
            console.error('获取用户统计信息失败:', error);
            return null;
        }
    },

    /**
     * 获取用户通知设置
     */
    getNotificationSettings: async (): Promise<NotificationSettings | null> => {
        try {
            const response = await apiClient.get<NotificationSettings>('/users/settings/notifications');
            return response || null;
        } catch (error) {
            console.error('获取通知设置失败:', error);
            return null;
        }
    },

    /**
     * 更新用户通知设置
     * @param settings 通知设置
     */
    updateNotificationSettings: async (settings: NotificationSettings): Promise<boolean> => {
        try {
            await apiClient.put('/users/settings/notifications', settings);
            return true;
        } catch (error) {
            console.error('更新通知设置失败:', error);
            return false;
        }
    },

    /**
     * 获取用户外观设置
     */
    getAppearanceSettings: async (): Promise<AppearanceSettings | null> => {
        try {
            const response = await apiClient.get<AppearanceSettings>('/users/settings/appearance');
            return response || null;
        } catch (error) {
            console.error('获取外观设置失败:', error);
            return null;
        }
    },

    /**
     * 更新用户外观设置
     * @param settings 外观设置
     */
    updateAppearanceSettings: async (settings: AppearanceSettings): Promise<boolean> => {
        try {
            await apiClient.put('/users/settings/appearance', settings);
            return true;
        } catch (error) {
            console.error('更新外观设置失败:', error);
            return false;
        }
    },

    /**
     * 获取用户隐私设置
     */
    getPrivacySettings: async (): Promise<PrivacySettings | null> => {
        try {
            const response = await apiClient.get<PrivacySettings>('/users/settings/privacy');
            return response || null;
        } catch (error) {
            console.error('获取隐私设置失败:', error);
            return null;
        }
    },

    /**
     * 更新用户隐私设置
     * @param settings 隐私设置
     */
    updatePrivacySettings: async (settings: PrivacySettings): Promise<boolean> => {
        try {
            await apiClient.put('/users/settings/privacy', settings);
            return true;
        } catch (error) {
            console.error('更新隐私设置失败:', error);
            return false;
        }
    },

    /**
     * 获取用户通知列表
     * @param limit 限制返回的记录数
     * @param offset 分页偏移量
     * @param unreadOnly 是否只返回未读通知
     */
    getNotifications: async (limit: number = 20, offset: number = 0, unreadOnly: boolean = false): Promise<NotificationPreview[]> => {
        try {
            const response = await apiClient.get<NotificationPreview[]>(
                `/users/notifications?limit=${limit}&offset=${offset}${unreadOnly ? '&unreadOnly=true' : ''}`
            );
            return response || [];
        } catch (error) {
            console.error('获取通知列表失败:', error);
            return [];
        }
    },

    /**
     * 标记通知为已读
     * @param notificationId 通知ID
     */
    markNotificationAsRead: async (notificationId: string): Promise<boolean> => {
        try {
            await apiClient.put(`/users/notifications/${notificationId}/read`);
            return true;
        } catch (error) {
            console.error('标记通知为已读失败:', error);
            return false;
        }
    },

    /**
     * 标记所有通知为已读
     */
    markAllNotificationsAsRead: async (): Promise<boolean> => {
        try {
            await apiClient.put('/users/notifications/read-all');
            return true;
        } catch (error) {
            console.error('标记所有通知为已读失败:', error);
            return false;
        }
    },

    /**
     * 删除单条通知
     * @param notificationId 通知ID
     */
    deleteNotification: async (notificationId: string): Promise<boolean> => {
        try {
            await apiClient.delete(`/users/notifications/${notificationId}`);
            return true;
        } catch (error) {
            console.error('删除通知失败:', error);
            return false;
        }
    },

    /**
     * 清空所有通知
     */
    clearAllNotifications: async (): Promise<boolean> => {
        try {
            await apiClient.delete('/users/notifications/clear-all');
            return true;
        } catch (error) {
            console.error('清空所有通知失败:', error);
            return false;
        }
    },

    /**
     * 获取未读通知数量
     */
    getUnreadNotificationCount: async (): Promise<number> => {
        try {
            const response = await apiClient.get<{ count: number }>('/users/notifications/unread-count');
            return response?.count || 0;
        } catch (error) {
            console.error('获取未读通知数量失败:', error);
            return 0;
        }
    }
};

export default userService; 