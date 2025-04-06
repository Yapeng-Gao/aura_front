import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { store } from '../store';
import { logout } from '../store/slices/authSlice';
import { Alert } from 'react-native';

// 导入服务模块
// 导入顺序与apiService中的顺序保持一致
import authService from './auth-service';
import userService from './user-service';
import assistantService from './assistant-service';
import codeService from './code-service';
import imageService from './image-service';
import voiceService from './voice-service';
import meetingService from './meeting-service';
import creativeService from './creative-service';
import iotService from './iot-service';
import productivityService from './productivity-service';
import analyticsService from './analytics-service';
// import calendarService from './calendar-service';
import writingService from './writing-service'; // 写作服务

// Keys for storing tokens in AsyncStorage
export const AUTH_TOKEN_KEY = 'aura_auth_token';
export const REFRESH_TOKEN_KEY = 'aura_refresh_token';

// API基础URL
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:8000/api' // 开发环境
  : 'https://api.auraapp.com/api'; // 生产环境

// 创建axios实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// 请求拦截器
apiClient.interceptors.request.use(
  async (config) => {
    // 在这里可以添加token等身份验证逻辑
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error('API错误:', error);
    return Promise.reject(error);
  }
);

// 定义API响应类型
interface ApiResponse<T> {
  status: 'success' | 'error';
  code: number;
  data?: T;
  message?: string;
  errors?: Array<{ code: string; field?: string; message: string }>;
}

// 导出API服务
const apiService = {
  client: apiClient,

  // GET请求
  get: async (url: string, params?: any) => {
    try {
      return await apiClient.get(url, { params });
    } catch (error) {
      console.error(`GET请求失败 ${url}:`, error);
      throw error;
    }
  },

  // POST请求
  post: async (url: string, data?: any) => {
    try {
      return await apiClient.post(url, data);
    } catch (error) {
      console.error(`POST请求失败 ${url}:`, error);
      throw error;
    }
  },

  // PUT请求
  put: async (url: string, data?: any) => {
    try {
      return await apiClient.put(url, data);
    } catch (error) {
      console.error(`PUT请求失败 ${url}:`, error);
      throw error;
    }
  },

  // DELETE请求
  delete: async (url: string) => {
    try {
      return await apiClient.delete(url);
    } catch (error) {
      console.error(`DELETE请求失败 ${url}:`, error);
      throw error;
    }
  },

  // 认证服务
  auth: authService,
  
  // 用户服务
  user: userService,
  
  // 助手服务
  assistant: assistantService,
  
  // 代码服务
  code: codeService,
  
  // 图像服务
  image: imageService,
  
  // 语音服务
  voice: voiceService,
  
  // 会议服务
  meeting: meetingService,
  
  // 创意服务
  creative: creativeService,
  
  // IoT服务
  iot: iotService,
  
  // 生产力服务
  productivity: productivityService,
  
  // 分析服务
  analytics: analyticsService,
  
  // 日历服务
  // calendar: calendarService,
  
  // 写作服务 - 新添加
  writing: writingService
};

export default apiService;
