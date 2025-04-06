import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { store } from '../store';
import { logout } from '../store/slices/authSlice';
import { API_BASE_URL } from '@env';
import { Alert } from 'react-native';

// IoT模块相关类型导入
import {
  DeviceTypeResponse, DeviceResponse, DeviceCreate, DeviceUpdate,
  DeviceStateResponse, DeviceStateUpdate, DeviceCommandResponse,
  SceneResponse, SceneCreate, SceneUpdate, SceneExecutionResponse,
  DeviceSearchQuery, DeviceSearchResponse, DeviceBatchUpdate,
  DeviceBatchResponse, DeviceLogQuery, DeviceLogResponse,
  DeviceDiagnosticResponse, FirmwareUpdateResponse,
  RoomResponse, RoomCreate, RoomUpdate, RoomStats,
  DeviceGroupResponse, DeviceGroupDetailResponse, DeviceGroupCreate, DeviceGroupUpdate,
  DeviceSharingResponse, SharedDeviceResponse, MySharedDeviceResponse,
  DeviceShareCreate, DeviceSharePermissionsUpdate,
  DiscoveryParams, DiscoveredDeviceResponse, DiscoveredDeviceAdd,
  DeviceAuthRequest, DeviceAuthResponse,
  DeviceTokenRequest, DeviceTokenResponse, DeviceTokenInfo,
  SceneTemplateResponse, SceneTemplateCreate,
  DeviceUsageStats, SystemStats, SystemConfigUpdate
} from '../types/iot';

// Assistant相关类型导入
import { 
  SendMessageRequest, 
  SendMessageResponse, 
  GetConversationResponse, 
  GetConversationsResponse, 
  UpdateAssistantSettingsRequest, 
  UpdateAssistantSettingsResponse, 
  UploadAttachmentResponse,
  // 代码助手类型
  CodeGenerationRequest,
  CodeGenerationResponse,
  CodeOptimizationRequest,
  CodeTestRequest,
  CodeExplainRequest,
  LanguagesResponse,
  // 写作助手类型
  WritingTemplate,
  WriteGenerationRequest,
  WriteGenerationResponse,
  WritePolishRequest,
  WriteGrammarCheckRequest,
  WriteGrammarCheckResponse,
  // 图像助手类型
  ImageStyle,
  ImageGenerationRequest,
  ImageGenerationResponse,
  ImageEditRequest,
  ImageStyleTransferRequest,
  ImageRemoveBackgroundRequest,
  // 语音助手类型
  Voice,
  VoiceTranscriptionRequest,
  VoiceTranscriptionResponse,
  VoiceGenerationRequest,
  VoiceGenerationResponse,
  VoiceTranslateRequest,
  VoiceTranslateResponse,
  // 会议助手类型
  MeetingRequest,
  MeetingResponse,
  MeetingNotesRequest,
  MeetingNoteResponse,
  MeetingSummaryResponse
} from '../types/assistant';

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

// API服务模块 - 不包含offline属性，会在sync.ts中添加
const apiService: ApiService = {
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
    logout: () => apiClient.post('/auth/logout'),
  },
  
  // 用户相关API
  user: {
    getProfile: () => apiClient.get('/users/profile'),
    updateProfile: (userData: any) => apiClient.patch('/users/profile', userData),
    updatePreferences: (preferences: any) => apiClient.patch('/users/preferences', preferences),
    uploadAvatar: (formData: FormData) => apiClient.post('/users/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  },
  
  // AI助手相关API
  assistant: {
    // 对话助手API
    chat: {
      sendMessage: (conversationId: string, message: string, attachments?: AttachmentUpload[]) => 
        apiClient.post(`/assistant/chat/${conversationId}/message`, { message, attachments }),
      getConversation: (conversationId: string) => 
        apiClient.get(`/assistant/chat/${conversationId}`),
      createConversation: (title?: string) => 
        apiClient.post('/assistant/chat/conversation', { title }),
      listConversations: () => 
        apiClient.get('/assistant/chat/conversations'),
      deleteConversation: (conversationId: string) => 
        apiClient.delete(`/assistant/chat/${conversationId}`),
    },
    
    // 图像助手API
    image: {
      getStyles: () => apiClient.get('/assistant/image/styles'),
      generateImage: (request: { prompt: string, style: string, options?: any }) => 
        apiClient.post('/assistant/image/generate', request),
      editImage: (imageUri: string, prompt: string, editType: string) => {
        const formData = new FormData();
        // 从URI创建文件对象
        const filename = imageUri.split('/').pop() || 'image.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        
        formData.append('image_file', {
          uri: imageUri,
          name: filename,
          type
        } as any);
        formData.append('prompt', prompt);
        formData.append('edit_type', editType);
        
        return apiClient.post('/assistant/image/edit', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        });
      },
      transferStyle: (imageUri: string, style: string) => {
        const formData = new FormData();
        // 从URI创建文件对象
        const filename = imageUri.split('/').pop() || 'image.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        
        formData.append('image_file', {
          uri: imageUri,
          name: filename,
          type
        } as any);
        formData.append('style', style);
        
        return apiClient.post('/assistant/image/style-transfer', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        });
      },
      removeBackground: (imageUri: string) => {
        const formData = new FormData();
        // 从URI创建文件对象
        const filename = imageUri.split('/').pop() || 'image.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        
        formData.append('image_file', {
          uri: imageUri,
          name: filename,
          type
        } as any);
        
        return apiClient.post('/assistant/image/remove-background', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        });
      },
    },
    
    // 其他助手API... (可以根据需要添加)
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
    getMeeting: (meetingId: string) => apiClient.get(`/productivity/meeting/${meetingId}`),
  },
  
  // IoT智能家居相关API
  iot: {
    getDeviceTypes: () => apiClient.get<DeviceTypeResponse[]>('/iot/device-types'),
    getDeviceType: (typeId: string) => apiClient.get<DeviceTypeResponse>(`/iot/device-types/${typeId}`),
    getDevices: () => apiClient.get<DeviceResponse[]>('/iot/devices'),
    getDevice: (deviceId: string) => apiClient.get<DeviceResponse>(`/iot/devices/${deviceId}`),
    addDevice: (deviceData: DeviceCreate) => apiClient.post<DeviceResponse>('/iot/devices', deviceData),
    updateDevice: (deviceId: string, deviceData: DeviceUpdate) => apiClient.patch<DeviceResponse>(`/iot/devices/${deviceId}`, deviceData),
    deleteDevice: (deviceId: string) => apiClient.delete(`/iot/devices/${deviceId}`),
    getDeviceState: (deviceId: string) => apiClient.get<DeviceStateResponse>(`/iot/devices/${deviceId}/state`),
    updateDeviceState: (deviceId: string, stateData: DeviceStateUpdate) => apiClient.patch<DeviceStateResponse>(`/iot/devices/${deviceId}/state`, stateData),
    getDeviceCommandHistory: (deviceId: string, limit?: number) => 
      apiClient.get<DeviceCommandResponse[]>(`/iot/devices/${deviceId}/commands`, { params: { limit } }),
    getScenes: () => apiClient.get<SceneResponse[]>('/iot/scenes'),
    getScene: (sceneId: string) => apiClient.get<SceneResponse>(`/iot/scenes/${sceneId}`),
    createScene: (sceneData: SceneCreate) => apiClient.post<SceneResponse>('/iot/scenes', sceneData),
    updateScene: (sceneId: string, sceneData: SceneUpdate) => apiClient.patch<SceneResponse>(`/iot/scenes/${sceneId}`, sceneData),
    deleteScene: (sceneId: string) => apiClient.delete(`/iot/scenes/${sceneId}`),
    executeScene: (sceneId: string) => apiClient.post<SceneExecutionResponse>(`/iot/scenes/${sceneId}/execute`),
    getSceneExecutionHistory: (sceneId?: string, limit?: number) => 
      apiClient.get<SceneExecutionResponse[]>('/iot/scenes/executions', { params: { scene_id: sceneId, limit } }),
    searchDevices: (query: DeviceSearchQuery) => apiClient.post<DeviceSearchResponse>('/iot/devices/search', query),
    batchUpdateDevices: (updateData: DeviceBatchUpdate) => apiClient.post<DeviceBatchResponse>('/iot/devices/batch', updateData),
    getDeviceLogs: (deviceId: string, queryParams: DeviceLogQuery) => 
      apiClient.get<DeviceLogResponse[]>(`/iot/devices/${deviceId}/logs`, { params: queryParams }),
    runDeviceDiagnostic: (deviceId: string) => apiClient.post<DeviceDiagnosticResponse>(`/iot/devices/${deviceId}/diagnostic`),
    checkFirmwareUpdate: (deviceId: string) => apiClient.get<FirmwareUpdateResponse>(`/iot/devices/${deviceId}/firmware/check`),
    startFirmwareUpdate: (deviceId: string, updateId: string) => 
      apiClient.post<FirmwareUpdateResponse>(`/iot/devices/${deviceId}/firmware/update/${updateId}`),
    getRooms: () => apiClient.get<RoomResponse[]>('/iot/rooms'),
    getRoom: (roomId: string) => apiClient.get<RoomResponse>(`/iot/rooms/${roomId}`),
    createRoom: (roomData: RoomCreate) => apiClient.post<RoomResponse>('/iot/rooms', roomData),
    updateRoom: (roomId: string, roomData: RoomUpdate) => apiClient.put<RoomResponse>(`/iot/rooms/${roomId}`, roomData),
    deleteRoom: (roomId: string) => apiClient.delete(`/iot/rooms/${roomId}`),
    getRoomStats: (roomId: string) => apiClient.get<RoomStats>(`/iot/rooms/${roomId}/stats`),
    getDeviceGroups: () => apiClient.get<DeviceGroupResponse[]>('/iot/device-groups'),
    getDeviceGroup: (groupId: string) => apiClient.get<DeviceGroupDetailResponse>(`/iot/device-groups/${groupId}`),
    createDeviceGroup: (groupData: DeviceGroupCreate) => apiClient.post<DeviceGroupResponse>('/iot/device-groups', groupData),
    updateDeviceGroup: (groupId: string, groupData: DeviceGroupUpdate) => apiClient.put<DeviceGroupResponse>(`/iot/device-groups/${groupId}`, groupData),
    deleteDeviceGroup: (groupId: string) => apiClient.delete(`/iot/device-groups/${groupId}`),
    addDevicesToGroup: (groupId: string, deviceIds: string[]) => 
      apiClient.post<DeviceGroupResponse>(`/iot/device-groups/${groupId}/devices`, deviceIds),
    removeDeviceFromGroup: (groupId: string, deviceId: string) => 
      apiClient.delete(`/iot/device-groups/${groupId}/devices/${deviceId}`),
    shareDevice: (deviceId: string, shareData: DeviceShareCreate) => apiClient.post<DeviceSharingResponse>(`/iot/devices/${deviceId}/share`, shareData),
    getSharedWithMe: () => apiClient.get<SharedDeviceResponse[]>('/iot/shared-with-me'),
    getSharedByMe: () => apiClient.get<MySharedDeviceResponse[]>('/iot/shared-by-me'),
    acceptDeviceSharing: (shareId: string) => apiClient.post<SharedDeviceResponse>(`/iot/shared-with-me/${shareId}/accept`),
    rejectDeviceSharing: (shareId: string) => apiClient.post<void>(`/iot/shared-with-me/${shareId}/reject`),
    revokeDeviceSharing: (shareId: string) => apiClient.delete<void>(`/iot/shared-by-me/${shareId}`),
    updateSharePermissions: (shareId: string, permissionsData: DeviceSharePermissionsUpdate) => 
      apiClient.put<MySharedDeviceResponse>(`/iot/shared-by-me/${shareId}/permissions`, permissionsData),
    getDiscoveryProtocols: () => apiClient.get<string[]>('/iot/discovery/protocols'),
    discoverDevices: (discoveryParams: DiscoveryParams) => apiClient.post<DiscoveredDeviceResponse[]>('/iot/discovery/scan', discoveryParams),
    getDiscoveryHistory: (protocol?: string, limit?: number) => 
      apiClient.get<DiscoveredDeviceResponse[]>('/iot/discovery/history', { params: { protocol, limit } }),
    addDiscoveredDevice: (discoveryId: string, deviceData: DiscoveredDeviceAdd) => 
      apiClient.post<DeviceResponse>(`/iot/discovery/${discoveryId}/add`, deviceData),
    authenticateDevice: (deviceId: string, authData: DeviceAuthRequest) => 
      apiClient.post<DeviceAuthResponse>(`/iot/devices/${deviceId}/authenticate`, authData),
    generateDeviceToken: (deviceId: string, tokenData: DeviceTokenRequest) => 
      apiClient.post<DeviceTokenResponse>(`/iot/devices/${deviceId}/token`, tokenData),
    getDeviceTokens: (deviceId: string) => apiClient.get<DeviceTokenInfo[]>(`/iot/devices/${deviceId}/tokens`),
    revokeDeviceToken: (deviceId: string, tokenId: string) => 
      apiClient.delete<void>(`/iot/devices/${deviceId}/tokens/${tokenId}`),
    createSceneTemplate: (templateData: SceneTemplateCreate) => apiClient.post<SceneTemplateResponse>('/iot/scene-templates', templateData),
    getSceneTemplates: (category?: string) => 
      apiClient.get<SceneTemplateResponse[]>('/iot/scene-templates', { params: { category } }),
    getDeviceUsageStats: (deviceId: string) => apiClient.get<DeviceUsageStats>(`/iot/devices/${deviceId}/stats`),
    getSystemHealth: () => apiClient.get<any>('/iot/system/health'),
    getSystemMetrics: () => apiClient.get<any>('/iot/system/metrics'),
    getSystemStats: () => apiClient.get<SystemStats>('/iot/system/stats'),
    getSystemConfig: (key: string) => apiClient.get<any>(`/iot/system/config/${key}`),
    updateSystemConfig: (key: string, configData: SystemConfigUpdate) => apiClient.put<any>(`/iot/system/config/${key}`, configData),
  },
  
  // 创意服务相关API
  creative: {
    generateText: (prompt: string) => apiClient.post('/creative/generate/text', { prompt }),
    generateImage: (prompt: string, style: string) => 
      apiClient.post('/assistant/image/generate', { prompt, style }),
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
    recordActivity: (activityData: any) => apiClient.post('/analytics/activity', activityData),
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

// 获取认证头部
const getAuthHeader = async () => {
  const token = await AsyncStorage.getItem('token');
  return {
    Authorization: `Bearer ${token}`,
  };
};

// 处理API错误
const handleApiError = (error: any) => {
  console.error('API Error:', error.response?.data || error.message);
  
  if (error.response?.status === 401) {
    // 未授权错误
    Alert.alert('登录已过期', '请重新登录');
    // TODO: 重定向到登录页面
  } else if (error.response?.data?.detail) {
    Alert.alert('错误', error.response.data.detail);
  } else {
    Alert.alert('错误', '请求失败，请稍后重试');
  }
};

// API错误类
export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// 检查网络连接状态
const checkNetworkConnection = async (): Promise<boolean> => {
  try {
    // 简单ping请求检查网络连接
    await fetch('https://www.google.com', { method: 'HEAD', timeout: 5000 });
    return true;
  } catch (error) {
    console.warn('Network connection check failed:', error);
    return false;
  }
}

// 重试函数
const retryOperation = async <T>(
  operation: () => Promise<T>, 
  maxRetries: number = 3, 
  delay: number = 1000
): Promise<T> => {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // 检查网络连接
      const isConnected = await checkNetworkConnection();
      if (!isConnected && attempt < maxRetries) {
        console.warn(`Network connection issue detected, attempt ${attempt} of ${maxRetries}`);
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
        continue;
      }
      
      return await operation();
    } catch (error) {
      lastError = error;
      console.warn(`Operation failed (attempt ${attempt}/${maxRetries}):`, error);
      
      // 如果是网络错误或服务器错误，尝试重试
      if (
        error.name === 'NetworkError' || 
        error.message.includes('Network Error') ||
        (error.response && error.response.status >= 500)
      ) {
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      } else {
        // 其他错误（客户端错误等）直接抛出
        throw error;
      }
    }
  }
  
  // 所有重试都失败了
  throw lastError;
};

// 代码助手 API
export const codeAssistantApi = {
  generateCode: async (
    language: string,
    prompt: string
  ): Promise<CodeGenerationResponse> => {
    return retryOperation(async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        
        const response = await axios.post<CodeGenerationResponse>(
          `${API_BASE_URL}/assistant/code/generate`,
          { language, prompt },
          { headers }
        );
        
        return response.data;
      } catch (error) {
        if (error.response?.status >= 500) {
          throw new ApiError(500, '服务器处理请求时发生错误，请稍后再试', error.response.data);
        }
        
        handleApiError(error);
        throw error;
      }
    });
  },
  
  optimizeCode: async (
    language: string,
    code: string,
    goals: string[]
  ): Promise<CodeOptimizationResponse> => {
    return retryOperation(async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        
        const response = await axios.post<CodeOptimizationResponse>(
          `${API_BASE_URL}/assistant/code/optimize`,
          { language, code, goals },
          { headers }
        );
        
        return response.data;
      } catch (error) {
        if (error.response?.status >= 500) {
          throw new ApiError(500, '服务器处理请求时发生错误，请稍后再试', error.response.data);
        }
        
        handleApiError(error);
        throw error;
      }
    });
  },
  
  explainCode: async (
    language: string,
    code: string
  ): Promise<CodeExplanationResponse> => {
    return retryOperation(async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        
        const response = await axios.post<CodeExplanationResponse>(
          `${API_BASE_URL}/assistant/code/explain`,
          { language, code },
          { headers }
        );
        
        return response.data;
      } catch (error) {
        if (error.response?.status >= 500) {
          throw new ApiError(500, '服务器处理请求时发生错误，请稍后再试', error.response.data);
        }
        
        handleApiError(error);
        throw error;
      }
    });
  },
  
  generateTest: async (
    language: string,
    code: string,
    testFramework?: string
  ): Promise<TestCodeResponse> => {
    return retryOperation(async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        
        const response = await axios.post<TestCodeResponse>(
          `${API_BASE_URL}/assistant/code/test`,
          { language, code, test_framework: testFramework },
          { headers }
        );
        
        return response.data;
      } catch (error) {
        if (error.response?.status >= 500) {
          throw new ApiError(500, '服务器处理请求时发生错误，请稍后再试', error.response.data);
        }
        
        handleApiError(error);
        throw error;
      }
    });
  },

  getLanguages: async (): Promise<string[]> => {
    return retryOperation(async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        
        const response = await axios.get<{ languages: string[] }>(
          `${API_BASE_URL}/assistant/code/languages`,
          { headers }
        );
        
        return response.data.languages;
      } catch (error) {
        if (error.response?.status >= 500) {
          throw new ApiError(500, '服务器处理请求时发生错误，请稍后再试', error.response.data);
        }
        
        handleApiError(error);
        throw error;
      }
    });
  },

  getRecentLanguages: async (): Promise<string[]> => {
    return retryOperation(async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        
        const response = await axios.get<{ languages: string[] }>(
          `${API_BASE_URL}/assistant/code/languages/recent`,
          { headers }
        );
        
        return response.data.languages;
      } catch (error) {
        if (error.response?.status >= 500) {
          throw new ApiError(500, '服务器处理请求时发生错误，请稍后再试', error.response.data);
        }
        
        handleApiError(error);
        throw error;
      }
    });
  },

  updateRecentLanguage: async (language: string): Promise<string[]> => {
    return retryOperation(async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        
        const response = await axios.post<{ languages: string[] }>(
          `${API_BASE_URL}/assistant/code/languages/recent`,
          { language },
          { headers }
        );
        
        return response.data.languages;
      } catch (error) {
        if (error.response?.status >= 500) {
          throw new ApiError(500, '服务器处理请求时发生错误，请稍后再试', error.response.data);
        }
        
        handleApiError(error);
        throw error;
      }
    });
  },

  getFavoriteLanguages: async (): Promise<string[]> => {
    return retryOperation(async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        
        const response = await axios.get<{ languages: string[] }>(
          `${API_BASE_URL}/assistant/code/languages/favorite`,
          { headers }
        );
        
        return response.data.languages;
      } catch (error) {
        if (error.response?.status >= 500) {
          throw new ApiError(500, '服务器处理请求时发生错误，请稍后再试', error.response.data);
        }
        
        handleApiError(error);
        throw error;
      }
    });
  },

  updateFavoriteLanguage: async (language: string, action: 'add' | 'remove'): Promise<string[]> => {
    return retryOperation(async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        
        const response = await axios.post<{ languages: string[] }>(
          `${API_BASE_URL}/assistant/code/languages/favorite`,
          { language, action },
          { headers }
        );
        
        return response.data.languages;
      } catch (error) {
        if (error.response?.status >= 500) {
          throw new ApiError(500, '服务器处理请求时发生错误，请稍后再试', error.response.data);
        }
        
        handleApiError(error);
        throw error;
      }
    });
  }
};

// 语音助手 API
export const voiceAssistantApi = {
  getVoices: async (): Promise<Voice[]> => {
    return retryOperation(async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        
        const response = await axios.get<{ voices: Voice[] }>(
          `${API_BASE_URL}/assistant/voice/available`,
          { headers }
        );
        
        return response.data.voices;
      } catch (error) {
        if (error.response?.status >= 500) {
          throw new ApiError(500, '服务器处理请求时发生错误，请稍后再试', error.response.data);
        }
        
        handleApiError(error);
        throw error;
      }
    });
  },
  
  transcribeAudio: async (
    audioFile: any,
    options?: { language?: string }
  ): Promise<VoiceTranscriptionResponse> => {
    return retryOperation(async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const headers = { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        };
        
        const formData = new FormData();
        formData.append('audio_file', audioFile);
        
        if (options?.language) {
          formData.append('options', JSON.stringify({ language: options.language }));
        }
        
        const response = await axios.post<VoiceTranscriptionResponse>(
          `${API_BASE_URL}/assistant/voice/transcribe`,
          formData,
          { headers }
        );
        
        return response.data;
      } catch (error) {
        if (error.response?.status >= 500) {
          throw new ApiError(500, '服务器处理请求时发生错误，请稍后再试', error.response.data);
        }
        
        handleApiError(error);
        throw error;
      }
    });
  },
  
  generateSpeech: async (
    text: string,
    voiceId: string,
    speed: number = 1.0,
    options?: { format?: 'mp3' | 'wav' | 'ogg' }
  ): Promise<VoiceGenerationResponse> => {
    return retryOperation(async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        
        const response = await axios.post<VoiceGenerationResponse>(
          `${API_BASE_URL}/assistant/voice/generate`,
          { 
            text, 
            voice_id: voiceId, 
            speed,
            options
          },
          { headers }
        );
        
        return response.data;
      } catch (error) {
        if (error.response?.status >= 500) {
          throw new ApiError(500, '服务器处理请求时发生错误，请稍后再试', error.response.data);
        }
        
        handleApiError(error);
        throw error;
      }
    });
  },
  
  translateAudio: async (
    audioFile: any,
    targetLanguage: string,
    options?: { voiceId?: string }
  ): Promise<VoiceTranslateResponse> => {
    return retryOperation(async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const headers = { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        };
        
        const formData = new FormData();
        formData.append('audio_file', audioFile);
        formData.append('target_language', targetLanguage);
        
        if (options?.voiceId) {
          formData.append('options', JSON.stringify({ voice_id: options.voiceId }));
        }
        
        const response = await axios.post<VoiceTranslateResponse>(
          `${API_BASE_URL}/assistant/voice/translate`,
          formData,
          { headers }
        );
        
        return response.data;
      } catch (error) {
        if (error.response?.status >= 500) {
          throw new ApiError(500, '服务器处理请求时发生错误，请稍后再试', error.response.data);
        }
        
        handleApiError(error);
        throw error;
      }
    });
  }
};
