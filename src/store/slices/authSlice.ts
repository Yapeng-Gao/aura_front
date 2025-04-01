import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// 认证状态接口
interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
}

// 用户接口
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

// 登录凭证接口
interface LoginCredentials {
  email: string;
  password: string;
}

// 注册数据接口
interface RegisterData {
  email: string;
  password: string;
  username: string;
}

// 初始状态
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  refreshToken: null,
  loading: false,
  error: null,
};

// 创建认证切片
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // 登录请求开始
    loginRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    // 登录成功
    loginSuccess: (state, action: PayloadAction<{ user: User; token: string; refreshToken: string }>) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.loading = false;
      state.error = null;
    },
    // 登录失败
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.loading = false;
      state.error = action.payload;
    },
    // 注册请求开始
    registerRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    // 注册成功
    registerSuccess: (state, action: PayloadAction<{ user: User; token: string; refreshToken: string }>) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.loading = false;
      state.error = null;
    },
    // 注册失败
    registerFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    // 更新用户资料
    updateUserProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    // 更新用户设置
    updateUserSettings: (state, action: PayloadAction<Record<string, any>>) => {
      if (state.user) {
        state.user.settings = { ...state.user.settings, ...action.payload };
      }
    },
    // 更新用户偏好
    updateUserPreferences: (state, action: PayloadAction<Record<string, any>>) => {
      if (state.user) {
        state.user.preferences = { ...state.user.preferences, ...action.payload };
      }
    },
    // 刷新令牌
    refreshTokenSuccess: (state, action: PayloadAction<{ token: string; refreshToken: string }>) => {
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
    },
    // 登出
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.loading = false;
      state.error = null;
    },
    // 清除错误
    clearError: (state) => {
      state.error = null;
    },
  },
});

// 导出动作创建器
export const {
  loginRequest,
  loginSuccess,
  loginFailure,
  registerRequest,
  registerSuccess,
  registerFailure,
  updateUserProfile,
  updateUserSettings,
  updateUserPreferences,
  refreshTokenSuccess,
  logout,
  clearError,
} = authSlice.actions;

// 导出reducer
export default authSlice.reducer;
