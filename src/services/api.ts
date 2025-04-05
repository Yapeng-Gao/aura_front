import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { store } from '../store';
import { logout } from '../store/slices/authSlice';
import { API_BASE_URL } from '@env';

// Keys for storing tokens in AsyncStorage
export const AUTH_TOKEN_KEY = 'aura_auth_token';
export const REFRESH_TOKEN_KEY = 'aura_refresh_token';

// 定义offlineApiService的类型，稍后会在sync.ts中实现
export interface OfflineApiService {
  get<T>(endpoint: string, options?: { offlineEnabled?: boolean }): Promise<T | undefined>;
  post<T>(endpoint: string, data?: any, options?: { offlineEnabled?: boolean }): Promise<T | undefined>;
  put<T>(endpoint: string, data?: any, options?: { offlineEnabled?: boolean }): Promise<T | undefined>;
  delete<T>(endpoint: string, options?: { offlineEnabled?: boolean }): Promise<T | undefined>;
}

// 创建axios实例
const api = axios.create({
  baseURL: API_BASE_URL || 'http://localhost:8000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
  async (config) => {
    try {
      // 首先尝试从AsyncStorage获取token
      let token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      
      // 如果AsyncStorage中没有，则从Redux store获取
      if (!token) {
        const state = store.getState();
        token = state.auth.token;
      }
      
      // 如果有token，添加到请求头
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      return config;
    } catch (e) {
      console.error('Error reading auth token:', e);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // 处理401错误（未授权）并尝试刷新token
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && originalRequest.url !== '/auth/refresh-token') {
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);

        if (refreshToken) {
          console.log('Attempting to refresh token...');
          // 使用单独的axios调用以避免拦截器循环
          const refreshResponse = await axios.post(
            `${API_BASE_URL}/auth/refresh-token`,
            { refreshToken: refreshToken }
          );

          const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data.data;

          // 存储新token
          await AsyncStorage.setItem(AUTH_TOKEN_KEY, accessToken);
          if (newRefreshToken) {
            await AsyncStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
          }

          console.log('Token refreshed successfully. Retrying original request...');

          // 更新原始请求的header
          if (originalRequest.headers) {
            originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
          } else {
            originalRequest.headers = { 'Authorization': `Bearer ${accessToken}` };
          }

          // 使用新token重试原始请求
          return api(originalRequest);
        } else {
          console.log('No refresh token found, cannot refresh.');
          await handleLogout();
          return Promise.reject(error);
        }
      } catch (refreshError: any) {
        console.error('Unable to refresh token:', refreshError.response?.data || refreshError.message);
        await handleLogout();
        return Promise.reject(refreshError);
      }
    }
    
    // 处理网络错误
    if (!error.response) {
      console.error('网络错误，请检查您的网络连接');
    }
    
    return Promise.reject(error);
  }
);

// 注销处理函数
async function handleLogout() {
  console.log('Handling logout due to auth failure...');
  try {
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
    // 触发Redux的注销操作
    store.dispatch(logout());
    console.log('Tokens removed. User logged out.');
  } catch (e) {
    console.error('Error during logout handling:', e);
  }
}

// 定义API响应类型
interface ApiResponse<T> {
  status: 'success' | 'error';
  code: number;
  data?: T;
  message?: string;
  errors?: Array<{ code: string; field?: string; message: string }>;
}

// 通用API请求方法
export const apiClient = {
  // GET请求
  get: <T>(url: string, config?: AxiosRequestConfig): Promise<T | undefined> => {
    return api.get<ApiResponse<T>>(url, config)
      .then((response: AxiosResponse<ApiResponse<T>>) => response.data.data);
  },

  // POST请求
  post: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T | undefined> => {
    return api.post<ApiResponse<T>>(url, data, config)
      .then((response: AxiosResponse<ApiResponse<T>>) => response.data.data);
  },

  // PUT请求
  put: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T | undefined> => {
    return api.put<ApiResponse<T>>(url, data, config)
      .then((response: AxiosResponse<ApiResponse<T>>) => response.data.data);
  },

  // PATCH请求
  patch: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T | undefined> => {
    return api.patch<ApiResponse<T>>(url, data, config)
      .then((response: AxiosResponse<ApiResponse<T>>) => response.data.data);
  },

  // DELETE请求
  delete: <T = void>(url: string, config?: AxiosRequestConfig): Promise<T | undefined> => {
    return api.delete<ApiResponse<T>>(url, config)
      .then((response: AxiosResponse<ApiResponse<T>>) => response.data.data);
  },
};

// 定义API服务接口，包含offline
export interface ApiService {
  client: typeof apiClient;
  api: typeof api;
  auth: {
    login: (credentials: any) => Promise<any | undefined>;
    register: (userData: any) => Promise<any | undefined>;
    forgotPassword: (email: string) => Promise<any | undefined>;
    resetPassword: (token: string, newPassword: string) => Promise<any | undefined>;
    refreshToken: (refreshToken: string) => Promise<any | undefined>;
  };
  user: {
    getProfile: () => Promise<any | undefined>;
    updateProfile: (userData: any) => Promise<any | undefined>;
    updatePreferences: (preferences: any) => Promise<any | undefined>;
    uploadAvatar: (formData: FormData) => Promise<any | undefined>;
  };
  assistant: {
    sendMessage: (message: any) => Promise<any | undefined>;
    getConversation: (conversationId: string) => Promise<any | undefined>;
    getConversations: () => Promise<any | undefined>;
    deleteConversation: (conversationId: string) => Promise<any | undefined>;
    updateAssistantSettings: (settings: any) => Promise<any | undefined>;
    uploadAttachment: (formData: FormData, conversationId: string) => Promise<any | undefined>;
  };
  scheduler: {
    getEvents: (startDate: string, endDate: string) => Promise<any | undefined>;
    getEvent: (eventId: string) => Promise<any | undefined>;
    createEvent: (eventData: any) => Promise<any | undefined>;
    updateEvent: (eventId: string, eventData: any) => Promise<any | undefined>;
    deleteEvent: (eventId: string) => Promise<any | undefined>;
    getTasks: (status?: string) => Promise<any | undefined>;
    getTask: (taskId: string) => Promise<any | undefined>;
    createTask: (taskData: any) => Promise<any | undefined>;
    updateTask: (taskId: string, taskData: any) => Promise<any | undefined>;
    deleteTask: (taskId: string) => Promise<any | undefined>;
    getReminders: () => Promise<any | undefined>;
    createReminder: (reminderData: any) => Promise<any | undefined>;
    updateReminder: (reminderId: string, reminderData: any) => Promise<any | undefined>;
    deleteReminder: (reminderId: string) => Promise<any | undefined>;
  };
  productivity: {
    getNotes: () => Promise<any | undefined>;
    getNote: (noteId: string) => Promise<any | undefined>;
    createNote: (noteData: any) => Promise<any | undefined>;
    updateNote: (noteId: string, noteData: any) => Promise<any | undefined>;
    deleteNote: (noteId: string) => Promise<any | undefined>;
    processDocument: (formData: FormData) => Promise<any | undefined>;
    startMeeting: (meetingData: any) => Promise<any | undefined>;
    endMeeting: (meetingId: string) => Promise<any | undefined>;
    getMeetingSummary: (meetingId: string) => Promise<any | undefined>;
    getMeetings: () => Promise<any | undefined>;
  };
  iot: {
    getDevices: () => Promise<any | undefined>;
    getDevice: (deviceId: string) => Promise<any | undefined>;
    updateDeviceStatus: (deviceId: string, status: any) => Promise<any | undefined>;
    addDevice: (deviceData: any) => Promise<any | undefined>;
    removeDevice: (deviceId: string) => Promise<any | undefined>;
    getScenes: () => Promise<any | undefined>;
    getScene: (sceneId: string) => Promise<any | undefined>;
    activateScene: (sceneId: string) => Promise<any | undefined>;
    createScene: (sceneData: any) => Promise<any | undefined>;
    updateScene: (sceneId: string, sceneData: any) => Promise<any | undefined>;
    deleteScene: (sceneId: string) => Promise<any | undefined>;
  };
  creative: {
    generateText: (prompt: string) => Promise<any | undefined>;
    generateImage: (prompt: string, style: string) => Promise<any | undefined>;
    generateMusic: (prompt: string, duration: number) => Promise<any | undefined>;
    getProjects: () => Promise<any | undefined>;
    getProject: (projectId: string) => Promise<any | undefined>;
    createProject: (projectData: any) => Promise<any | undefined>;
    updateProject: (projectId: string, projectData: any) => Promise<any | undefined>;
    deleteProject: (projectId: string) => Promise<any | undefined>;
    getRecommendations: (category: string) => Promise<any | undefined>;
    getARContent: () => Promise<any | undefined>;
    getARContentItem: (contentId: string) => Promise<any | undefined>;
  };
  notification: {
    getNotifications: () => Promise<any | undefined>;
    markAsRead: (notificationId: string) => Promise<any | undefined>;
    markAllAsRead: () => Promise<any | undefined>;
    updateSettings: (settings: any) => Promise<any | undefined>;
  };
  analytics: {
    getUsageStats: (period: string) => Promise<any | undefined>;
    getProductivityStats: (period: string) => Promise<any | undefined>;
    getIoTStats: (period: string) => Promise<any | undefined>;
  };
  custom: {
    get: <T>(endpoint: string, config?: AxiosRequestConfig) => Promise<T | undefined>;
    post: <T>(endpoint: string, data?: any, config?: AxiosRequestConfig) => Promise<T | undefined>;
    put: <T>(endpoint: string, data?: any, config?: AxiosRequestConfig) => Promise<T | undefined>;
    patch: <T>(endpoint: string, data?: any, config?: AxiosRequestConfig) => Promise<T | undefined>;
    delete: <T>(endpoint: string, config?: AxiosRequestConfig) => Promise<T | undefined>;
  };
  offline: OfflineApiService;
}

// API服务模块 - 不包含offline属性，会在sync.ts中添加
const apiService = {
  // 通用API客户端
  client: apiClient,
  
  // 原始axios实例，用于高级用例
  api,
  
  // 认证相关API
  auth: {
    login: (credentials: any) => apiClient.post('/auth/login', credentials),
    register: (userData: any) => apiClient.post('/auth/register', userData),
    forgotPassword: (email: string) => apiClient.post('/auth/forgot-password', { email }),
    resetPassword: (token: string, newPassword: string) => 
      apiClient.post('/auth/reset-password', { token, new_password: newPassword }),
    refreshToken: (refreshToken: string) => 
      apiClient.post('/auth/refresh-token', { refresh_token: refreshToken }),
  },
  
  // 用户相关API
  user: {
    getProfile: () => apiClient.get('/user/profile'),
    updateProfile: (userData: any) => apiClient.put('/user/profile', userData),
    updatePreferences: (preferences: any) => apiClient.put('/user/preferences', preferences),
    uploadAvatar: (formData: FormData) => apiClient.post('/user/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  },
  
  // AI助手相关API
  assistant: {
    sendMessage: (message: any) => apiClient.post('/assistant/message', message),
    getConversation: (conversationId: string) => apiClient.get(`/assistant/conversation/${conversationId}`),
    getConversations: () => apiClient.get('/assistant/conversations'),
    deleteConversation: (conversationId: string) => apiClient.delete(`/assistant/conversation/${conversationId}`),
    updateAssistantSettings: (settings: any) => apiClient.put('/assistant/settings', settings),
    uploadAttachment: (formData: FormData, conversationId: string) => 
      apiClient.post(`/assistant/attachment/${conversationId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }),
  },
  
  // 日程管理相关API
  scheduler: {
    getEvents: (startDate: string, endDate: string) => 
      apiClient.get('/scheduler/events', { params: { start_date: startDate, end_date: endDate } }),
    getEvent: (eventId: string) => apiClient.get(`/scheduler/event/${eventId}`),
    createEvent: (eventData: any) => apiClient.post('/scheduler/event', eventData),
    updateEvent: (eventId: string, eventData: any) => apiClient.put(`/scheduler/event/${eventId}`, eventData),
    deleteEvent: (eventId: string) => apiClient.delete(`/scheduler/event/${eventId}`),
    
    getTasks: (status?: string) => apiClient.get('/scheduler/tasks', { params: { status } }),
    getTask: (taskId: string) => apiClient.get(`/scheduler/task/${taskId}`),
    createTask: (taskData: any) => apiClient.post('/scheduler/task', taskData),
    updateTask: (taskId: string, taskData: any) => apiClient.put(`/scheduler/task/${taskId}`, taskData),
    deleteTask: (taskId: string) => apiClient.delete(`/scheduler/task/${taskId}`),
    
    getReminders: () => apiClient.get('/scheduler/reminders'),
    createReminder: (reminderData: any) => apiClient.post('/scheduler/reminder', reminderData),
    updateReminder: (reminderId: string, reminderData: any) => 
      apiClient.put(`/scheduler/reminder/${reminderId}`, reminderData),
    deleteReminder: (reminderId: string) => apiClient.delete(`/scheduler/reminder/${reminderId}`),
  },
  
  // 生产力工具相关API
  productivity: {
    getNotes: () => apiClient.get('/productivity/notes'),
    getNote: (noteId: string) => apiClient.get(`/productivity/note/${noteId}`),
    createNote: (noteData: any) => apiClient.post('/productivity/note', noteData),
    updateNote: (noteId: string, noteData: any) => apiClient.put(`/productivity/note/${noteId}`, noteData),
    deleteNote: (noteId: string) => apiClient.delete(`/productivity/note/${noteId}`),
    
    processDocument: (formData: FormData) => apiClient.post('/productivity/document/process', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
    
    startMeeting: (meetingData: any) => apiClient.post('/productivity/meeting/start', meetingData),
    endMeeting: (meetingId: string) => apiClient.post(`/productivity/meeting/${meetingId}/end`),
    getMeetingSummary: (meetingId: string) => apiClient.get(`/productivity/meeting/${meetingId}/summary`),
    getMeetings: () => apiClient.get('/productivity/meetings'),
  },
  
  // IoT智能家居相关API
  iot: {
    getDevices: () => apiClient.get('/iot/devices'),
    getDevice: (deviceId: string) => apiClient.get(`/iot/device/${deviceId}`),
    updateDeviceStatus: (deviceId: string, status: any) => 
      apiClient.put(`/iot/device/${deviceId}/status`, { status }),
    addDevice: (deviceData: any) => apiClient.post('/iot/device', deviceData),
    removeDevice: (deviceId: string) => apiClient.delete(`/iot/device/${deviceId}`),
    
    getScenes: () => apiClient.get('/iot/scenes'),
    getScene: (sceneId: string) => apiClient.get(`/iot/scene/${sceneId}`),
    activateScene: (sceneId: string) => apiClient.post(`/iot/scene/${sceneId}/activate`),
    createScene: (sceneData: any) => apiClient.post('/iot/scene', sceneData),
    updateScene: (sceneId: string, sceneData: any) => apiClient.put(`/iot/scene/${sceneId}`, sceneData),
    deleteScene: (sceneId: string) => apiClient.delete(`/iot/scene/${sceneId}`),
  },
  
  // 创意服务相关API
  creative: {
    generateText: (prompt: string) => apiClient.post('/creative/generate/text', { prompt }),
    generateImage: (prompt: string, style: string) => 
      apiClient.post('/creative/generate/image', { prompt, style }),
    generateMusic: (prompt: string, duration: number) => 
      apiClient.post('/creative/generate/music', { prompt, duration }),
    
    getProjects: () => apiClient.get('/creative/projects'),
    getProject: (projectId: string) => apiClient.get(`/creative/project/${projectId}`),
    createProject: (projectData: any) => apiClient.post('/creative/project', projectData),
    updateProject: (projectId: string, projectData: any) => 
      apiClient.put(`/creative/project/${projectId}`, projectData),
    deleteProject: (projectId: string) => apiClient.delete(`/creative/project/${projectId}`),
    
    getRecommendations: (category: string) => 
      apiClient.get('/creative/recommendations', { params: { category } }),
    
    getARContent: () => apiClient.get('/creative/ar/content'),
    getARContentItem: (contentId: string) => apiClient.get(`/creative/ar/content/${contentId}`),
  },
  
  // 通知相关API
  notification: {
    getNotifications: () => apiClient.get('/notification/all'),
    markAsRead: (notificationId: string) => apiClient.put(`/notification/${notificationId}/read`),
    markAllAsRead: () => apiClient.put('/notification/read-all'),
    updateSettings: (settings: any) => apiClient.put('/notification/settings', settings),
  },
  
  // 分析相关API
  analytics: {
    getUsageStats: (period: string) => apiClient.get('/analytics/usage', { params: { period } }),
    getProductivityStats: (period: string) => 
      apiClient.get('/analytics/productivity', { params: { period } }),
    getIoTStats: (period: string) => apiClient.get('/analytics/iot', { params: { period } }),
  },
  
  // 自定义API请求
  custom: {
    get: <T>(endpoint: string, config?: AxiosRequestConfig) => apiClient.get<T>(endpoint, config),
    post: <T>(endpoint: string, data?: any, config?: AxiosRequestConfig) => 
      apiClient.post<T>(endpoint, data, config),
    put: <T>(endpoint: string, data?: any, config?: AxiosRequestConfig) => 
      apiClient.put<T>(endpoint, data, config),
    patch: <T>(endpoint: string, data?: any, config?: AxiosRequestConfig) => 
      apiClient.patch<T>(endpoint, data, config),
    delete: <T>(endpoint: string, config?: AxiosRequestConfig) => 
      apiClient.delete<T>(endpoint, config),
  }
} as ApiService; // 使用类型断言

export default apiService;
