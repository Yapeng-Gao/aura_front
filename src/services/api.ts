import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { store } from '../store';
import { logout, refreshTokenSuccess } from '../store/slices/authSlice';
import { API_BASE_URL } from '@env';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';

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

// 是否正在刷新令牌
let isRefreshing = false;
// 待处理的请求队列
let failedQueue: any[] = [];

// 处理队列中的请求
const processQueue = (error: any = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

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

// 响应拦截器
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 如果是401错误且不是刷新令牌的请求
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/refresh-token') {
      if (isRefreshing) {
        // 如果正在刷新令牌，将请求加入队列
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return api(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // 尝试刷新令牌
        const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await api.post('/auth/refresh-token', {
          refresh_token: refreshToken
        });

        const { access_token, refresh_token } = response.data;

        // 保存新令牌
        await AsyncStorage.setItem(AUTH_TOKEN_KEY, access_token);
        if (refresh_token) {
          await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refresh_token);
        }

        // 更新Redux状态
        store.dispatch(refreshTokenSuccess({ 
          token: access_token, 
          refreshToken: refresh_token || refreshToken 
        }));

        // 处理队列中的请求
        processQueue();

        // 重试原始请求
        return api(originalRequest);
      } catch (refreshError) {
        // 刷新令牌失败，清除所有令牌并登出
        processQueue(refreshError);
        await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
        await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
        store.dispatch(logout());
        
        // 显示错误提示
        Alert.alert(
          '会话已过期',
          '您的登录会话已过期，请重新登录',
          [{ text: '确定' }]
        );
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

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
