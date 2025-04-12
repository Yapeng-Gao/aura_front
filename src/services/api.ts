import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { store } from '../store';
import { logout } from '../store/slices/authSlice';
import { API_BASE_URL } from '@env';
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
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
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

  // DELETE请求
  delete: <T = void>(url: string, config?: AxiosRequestConfig): Promise<T | undefined> => {
    return api.delete<ApiResponse<T>>(url, config)
      .then((response: AxiosResponse<ApiResponse<T>>) => response.data.data);
  },
};

// 导出统一的API服务对象
const apiService = {
  // 通用API客户端
  client: apiClient,
  
  // 原始axios实例，用于高级用例
  api,
  
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
