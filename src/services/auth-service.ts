import { apiClient, AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { store } from '../store';
import { 
  loginRequest, 
  loginSuccess, 
  loginFailure, 
  registerRequest, 
  registerSuccess, 
  registerFailure, 
  refreshTokenSuccess,
  logout,
  updateUserProfile,
  updateUserSettings,
  updateUserPreferences
} from '../store/slices/authSlice';

// 用户和认证相关的接口
interface User {
  id: string;
  email: string;
  username: string;
  profile?: {
    fullName?: string;
    avatar?: string;
    bio?: string;
  };
  preferences?: Record<string, any>;
  settings?: Record<string, any>;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  username: string;
}

interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

interface RefreshTokenRequest {
  refreshToken: string;
}

interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

interface ProfileUpdateRequest {
  fullName?: string;
  avatar?: string;
  bio?: string;
  [key: string]: any;
}

interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
}

interface ResetPasswordRequest {
  email: string;
}

interface ResetPasswordConfirmRequest {
  token: string;
  newPassword: string;
}

interface SettingsUpdateRequest {
  [key: string]: any;
}

interface PreferencesUpdateRequest {
  [key: string]: any;
}

/**
 * 认证服务
 * 处理登录、注册、令牌管理等认证相关功能
 */
const authService = {
  /**
   * 用户登录
   * @param credentials 登录凭证
   */
  login: async (credentials: LoginRequest): Promise<boolean> => {
    store.dispatch(loginRequest());
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
      
      if (response) {
        const { user, token, refreshToken } = response;
        
        // 保存令牌到AsyncStorage
        await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
        await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
        
        // 更新Redux状态
        store.dispatch(loginSuccess({ user, token, refreshToken }));
        return true;
      }
      throw new Error('登录失败，请稍后重试');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '登录失败，请检查您的凭证';
      store.dispatch(loginFailure(errorMessage));
      return false;
    }
  },
  
  /**
   * 用户注册
   * @param data 注册数据
   */
  register: async (data: RegisterRequest): Promise<boolean> => {
    store.dispatch(registerRequest());
    try {
      const response = await apiClient.post<AuthResponse>('/auth/register', data);
      
      if (response) {
        const { user, token, refreshToken } = response;
        
        // 保存令牌到AsyncStorage
        await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
        await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
        
        // 更新Redux状态
        store.dispatch(registerSuccess({ user, token, refreshToken }));
        return true;
      }
      throw new Error('注册失败，请稍后重试');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '注册失败，请检查您的输入';
      store.dispatch(registerFailure(errorMessage));
      return false;
    }
  },
  
  /**
   * 刷新访问令牌
   */
  refreshToken: async (): Promise<boolean> => {
    try {
      const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
      
      if (!refreshToken) {
        return false;
      }
      
      const request: RefreshTokenRequest = { refreshToken };
      const response = await apiClient.post<RefreshTokenResponse>('/auth/refresh-token', request);
      
      if (response) {
        const { accessToken, refreshToken: newRefreshToken } = response;
        
        // 保存新令牌到AsyncStorage
        await AsyncStorage.setItem(AUTH_TOKEN_KEY, accessToken);
        await AsyncStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
        
        // 更新Redux状态
        store.dispatch(refreshTokenSuccess({ token: accessToken, refreshToken: newRefreshToken }));
        return true;
      }
      return false;
    } catch (error) {
      console.error('刷新令牌失败:', error);
      return false;
    }
  },
  
  /**
   * 用户登出
   */
  logout: async (): Promise<void> => {
    try {
      // 尝试调用登出接口
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('登出API调用失败:', error);
    }
    
    // 无论API调用是否成功，都清除本地存储的令牌
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
    
    // 更新Redux状态
    store.dispatch(logout());
  },
  
  /**
   * 更新用户资料
   * @param data 资料更新数据
   */
  updateProfile: async (data: ProfileUpdateRequest): Promise<User | null> => {
    try {
      const response = await apiClient.put<User>('/users/profile', data);
      
      if (response) {
        // 更新Redux状态
        store.dispatch(updateUserProfile(response));
        return response;
      }
      return null;
    } catch (error) {
      console.error('更新用户资料失败:', error);
      return null;
    }
  },
  
  /**
   * 更改密码
   * @param data 密码更改请求
   */
  changePassword: async (data: PasswordChangeRequest): Promise<boolean> => {
    try {
      await apiClient.put('/users/password', data);
      return true;
    } catch (error) {
      console.error('更改密码失败:', error);
      return false;
    }
  },
  
  /**
   * 请求密码重置
   * @param data 密码重置请求
   */
  requestPasswordReset: async (data: ResetPasswordRequest): Promise<boolean> => {
    try {
      await apiClient.post('/auth/forgot-password', data);
      return true;
    } catch (error) {
      console.error('请求密码重置失败:', error);
      return false;
    }
  },
  
  /**
   * 确认密码重置
   * @param data 密码重置确认请求
   */
  confirmPasswordReset: async (data: ResetPasswordConfirmRequest): Promise<boolean> => {
    try {
      await apiClient.post('/auth/reset-password', data);
      return true;
    } catch (error) {
      console.error('确认密码重置失败:', error);
      return false;
    }
  },
  
  /**
   * 更新用户设置
   * @param data 设置更新数据
   */
  updateSettings: async (data: SettingsUpdateRequest): Promise<boolean> => {
    try {
      await apiClient.put('/users/settings', data);
      
      // 更新Redux状态
      store.dispatch(updateUserSettings(data));
      return true;
    } catch (error) {
      console.error('更新用户设置失败:', error);
      return false;
    }
  },
  
  /**
   * 更新用户偏好
   * @param data 偏好更新数据
   */
  updatePreferences: async (data: PreferencesUpdateRequest): Promise<boolean> => {
    try {
      await apiClient.put('/users/preferences', data);
      
      // 更新Redux状态
      store.dispatch(updateUserPreferences(data));
      return true;
    } catch (error) {
      console.error('更新用户偏好失败:', error);
      return false;
    }
  },
  
  /**
   * 获取当前已认证的用户信息
   */
  getCurrentUser: async (): Promise<User | null> => {
    try {
      const response = await apiClient.get<User>('/users/me');
      return response || null;
    } catch (error) {
      console.error('获取当前用户失败:', error);
      return null;
    }
  },
  
  /**
   * 检查用户是否已登录
   */
  isLoggedIn: async (): Promise<boolean> => {
    const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    return !!token;
  }
};

export default authService; 