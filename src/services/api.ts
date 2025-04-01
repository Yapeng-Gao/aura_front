import axios from 'axios';
import { store } from '../store';
import { logout } from '../store/slices/authSlice';

// 创建axios实例
const api = axios.create({
  baseURL: process.env.API_URL || 'http://localhost:8000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 从Redux store获取token
    const state = store.getState();
    const token = state.auth.token;
    
    // 如果有token，添加到请求头
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
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
  (error) => {
    // 处理401错误（未授权）
    if (error.response && error.response.status === 401) {
      // 清除token并重定向到登录页面
      store.dispatch(logout());
    }
    
    // 处理网络错误
    if (!error.response) {
      console.error('网络错误，请检查您的网络连接');
    }
    
    return Promise.reject(error);
  }
);

// API服务
const apiService = {
  // 认证相关
  auth: {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
    resetPassword: (token, newPassword) => api.post('/auth/reset-password', { token, new_password: newPassword }),
    refreshToken: (refreshToken) => api.post('/auth/refresh-token', { refresh_token: refreshToken }),
  },
  
  // 用户相关
  user: {
    getProfile: () => api.get('/user/profile'),
    updateProfile: (userData) => api.put('/user/profile', userData),
    updatePreferences: (preferences) => api.put('/user/preferences', preferences),
    uploadAvatar: (formData) => api.post('/user/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  },
  
  // AI助手相关
  assistant: {
    sendMessage: (message) => api.post('/assistant/message', message),
    getConversation: (conversationId) => api.get(`/assistant/conversation/${conversationId}`),
    getConversations: () => api.get('/assistant/conversations'),
    deleteConversation: (conversationId) => api.delete(`/assistant/conversation/${conversationId}`),
    updateAssistantSettings: (settings) => api.put('/assistant/settings', settings),
    uploadAttachment: (formData, conversationId) => api.post(`/assistant/attachment/${conversationId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  },
  
  // 日程管理相关
  scheduler: {
    getEvents: (startDate, endDate) => api.get('/scheduler/events', { params: { start_date: startDate, end_date: endDate } }),
    getEvent: (eventId) => api.get(`/scheduler/event/${eventId}`),
    createEvent: (eventData) => api.post('/scheduler/event', eventData),
    updateEvent: (eventId, eventData) => api.put(`/scheduler/event/${eventId}`, eventData),
    deleteEvent: (eventId) => api.delete(`/scheduler/event/${eventId}`),
    
    getTasks: (status) => api.get('/scheduler/tasks', { params: { status } }),
    getTask: (taskId) => api.get(`/scheduler/task/${taskId}`),
    createTask: (taskData) => api.post('/scheduler/task', taskData),
    updateTask: (taskId, taskData) => api.put(`/scheduler/task/${taskId}`, taskData),
    deleteTask: (taskId) => api.delete(`/scheduler/task/${taskId}`),
    
    getReminders: () => api.get('/scheduler/reminders'),
    createReminder: (reminderData) => api.post('/scheduler/reminder', reminderData),
    updateReminder: (reminderId, reminderData) => api.put(`/scheduler/reminder/${reminderId}`, reminderData),
    deleteReminder: (reminderId) => api.delete(`/scheduler/reminder/${reminderId}`),
  },
  
  // 生产力工具相关
  productivity: {
    getNotes: () => api.get('/productivity/notes'),
    getNote: (noteId) => api.get(`/productivity/note/${noteId}`),
    createNote: (noteData) => api.post('/productivity/note', noteData),
    updateNote: (noteId, noteData) => api.put(`/productivity/note/${noteId}`, noteData),
    deleteNote: (noteId) => api.delete(`/productivity/note/${noteId}`),
    
    processDocument: (formData) => api.post('/productivity/document/process', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
    
    startMeeting: (meetingData) => api.post('/productivity/meeting/start', meetingData),
    endMeeting: (meetingId) => api.post(`/productivity/meeting/${meetingId}/end`),
    getMeetingSummary: (meetingId) => api.get(`/productivity/meeting/${meetingId}/summary`),
    getMeetings: () => api.get('/productivity/meetings'),
  },
  
  // IoT智能家居相关
  iot: {
    getDevices: () => api.get('/iot/devices'),
    getDevice: (deviceId) => api.get(`/iot/device/${deviceId}`),
    updateDeviceStatus: (deviceId, status) => api.put(`/iot/device/${deviceId}/status`, { status }),
    addDevice: (deviceData) => api.post('/iot/device', deviceData),
    removeDevice: (deviceId) => api.delete(`/iot/device/${deviceId}`),
    
    getScenes: () => api.get('/iot/scenes'),
    getScene: (sceneId) => api.get(`/iot/scene/${sceneId}`),
    activateScene: (sceneId) => api.post(`/iot/scene/${sceneId}/activate`),
    createScene: (sceneData) => api.post('/iot/scene', sceneData),
    updateScene: (sceneId, sceneData) => api.put(`/iot/scene/${sceneId}`, sceneData),
    deleteScene: (sceneId) => api.delete(`/iot/scene/${sceneId}`),
  },
  
  // 创意服务相关
  creative: {
    generateText: (prompt) => api.post('/creative/generate/text', { prompt }),
    generateImage: (prompt, style) => api.post('/creative/generate/image', { prompt, style }),
    generateMusic: (prompt, duration) => api.post('/creative/generate/music', { prompt, duration }),
    
    getProjects: () => api.get('/creative/projects'),
    getProject: (projectId) => api.get(`/creative/project/${projectId}`),
    createProject: (projectData) => api.post('/creative/project', projectData),
    updateProject: (projectId, projectData) => api.put(`/creative/project/${projectId}`, projectData),
    deleteProject: (projectId) => api.delete(`/creative/project/${projectId}`),
    
    getRecommendations: (category) => api.get('/creative/recommendations', { params: { category } }),
    
    getARContent: () => api.get('/creative/ar/content'),
    getARContentItem: (contentId) => api.get(`/creative/ar/content/${contentId}`),
  },
  
  // 通知相关
  notification: {
    getNotifications: () => api.get('/notification/all'),
    markAsRead: (notificationId) => api.put(`/notification/${notificationId}/read`),
    markAllAsRead: () => api.put('/notification/read-all'),
    updateSettings: (settings) => api.put('/notification/settings', settings),
  },
  
  // 分析相关
  analytics: {
    getUsageStats: (period) => api.get('/analytics/usage', { params: { period } }),
    getProductivityStats: (period) => api.get('/analytics/productivity', { params: { period } }),
    getIoTStats: (period) => api.get('/analytics/iot', { params: { period } }),
  },
};

export default apiService;
