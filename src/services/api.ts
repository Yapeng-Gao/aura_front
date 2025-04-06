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

// 导入各模块服务
import authService from './auth-service';
import userService from './user-service';
import assistantService from './assistant-service';
import codeService from './code-service';
import writingService from './writing-service';
import imageService from './image-service';
import voiceService from './voice-service';
import meetingService from './meeting-service';
import creativeService from './creative-service';
import iotService from './iot-service';
import productivityService from './productivity-service';
import analyticsService from './analytics-service';

// 导出完整的API服务对象
const apiService = {
  // 通用API客户端
  client: apiClient,
  
  // 原始axios实例，用于高级用例
  api,
  
  // 认证服务
  auth: authService,
  
  // 用户服务
  user: userService,
  
  // 助手模块
  assistant: assistantService,
  code: codeService,
  writing: writingService,
  image: imageService,
  voice: voiceService,
  meeting: meetingService,
  
  // 创意服务
  creative: creativeService,
  
  // IoT服务
  iot: iotService,
  
  // 生产力服务
  productivity: productivityService,
  
  // 分析服务
  analytics: analyticsService
};

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
  // 获取支持的编程语言列表
  getLanguages: async (): Promise<string[]> => {
    return retryOperation(async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        
        const response = await axios.get<LanguagesResponse>(
          `${API_BASE_URL}/assistant/code/languages`,
          { headers }
        );
        
        return response.data.languages;
      } catch (error) {
        handleApiError(error);
        throw error;
      }
    });
  },
  
  // 获取支持的编程语言详情
  getLanguageDetails: async (): Promise<any[]> => {
    return retryOperation(async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        
        const response = await axios.get(
          `${API_BASE_URL}/assistant/code/languages/details`,
          { headers }
        );
        
        return response.data;
      } catch (error) {
        handleApiError(error);
        throw error;
      }
    });
  },
  
  // 获取用户最近使用的编程语言
  getRecentLanguages: async (): Promise<string[]> => {
    return retryOperation(async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        
        const response = await axios.get<RecentLanguagesResponse>(
          `${API_BASE_URL}/assistant/code/languages/recent`,
          { headers }
        );
        
        return response.data.languages;
      } catch (error) {
        handleApiError(error);
        throw error;
      }
    });
  },
  
  // 更新用户最近使用的编程语言
  updateRecentLanguage: async (language: string): Promise<string[]> => {
    return retryOperation(async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        
        const response = await axios.post<RecentLanguagesResponse>(
          `${API_BASE_URL}/assistant/code/languages/recent`,
          { language },
          { headers }
        );
        
        return response.data.languages;
      } catch (error) {
        handleApiError(error);
        throw error;
      }
    });
  },
  
  // 获取用户收藏的编程语言
  getFavoriteLanguages: async (): Promise<string[]> => {
    return retryOperation(async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        
        const response = await axios.get<FavoriteLanguagesResponse>(
          `${API_BASE_URL}/assistant/code/languages/favorite`,
          { headers }
        );
        
        return response.data.languages;
      } catch (error) {
        handleApiError(error);
        throw error;
      }
    });
  },
  
  // 更新用户收藏的编程语言
  updateFavoriteLanguage: async (language: string, isFavorite: boolean): Promise<string[]> => {
    return retryOperation(async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        
        const response = await axios.post<FavoriteLanguagesResponse>(
          `${API_BASE_URL}/assistant/code/languages/favorite`,
          { language, is_favorite: isFavorite },
          { headers }
        );
        
        return response.data.languages;
      } catch (error) {
        handleApiError(error);
        throw error;
      }
    });
  },

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
