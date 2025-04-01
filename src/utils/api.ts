import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 从环境变量获取API基础URL
const API_BASE_URL = process.env.API_BASE_URL || 'http://10.0.2.2:8000/api'; //虚拟机不用localhost

// Keys for storing tokens in AsyncStorage
const AUTH_TOKEN_KEY = 'aura_auth_token';
const REFRESH_TOKEN_KEY = 'aura_refresh_token';
// 创建axios实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// 请求拦截器 - 添加认证令牌
apiClient.interceptors.request.use(
    async (config) => { // Marked as async
      try {
        const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY); // Use AsyncStorage (await)
        if (token) {
          // Ensure headers object exists
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (e) {
        console.error('Error reading auth token from storage:', e);
        // Decide if you want to block the request or proceed without token
      }
      return config;
    },
    (error) => {
      console.error('Request interceptor error:', error);
      return Promise.reject(error);
    }
);

// 响应拦截器 - 处理错误和刷新令牌
apiClient.interceptors.response.use(
    (response) => {
      // Directly return successful responses
      return response;
    },
    async (error: AxiosError) => { // Marked as async
      const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }; // Add _retry flag type

      // Check if it's a 401 error, not a retry, and not the refresh token endpoint itself
      if (error.response?.status === 401 && originalRequest && !originalRequest._retry && originalRequest.url !== '/auth/refresh-token') {

        originalRequest._retry = true; // Mark as retried to prevent infinite loops

        try {
          const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY); // Use AsyncStorage (await)

          if (refreshToken) {
            console.log('Attempting to refresh token...');
            // Use a separate axios instance or direct axios call for refresh to avoid interceptor loop
            const refreshResponse = await axios.post(
                `${API_BASE_URL}/auth/refresh-token`, // Use endpoint from API spec
                { refreshToken: refreshToken } // Match API spec body field name: { "refreshToken": "..." }
                // **VERIFY THIS FIELD NAME WITH YOUR BACKEND API SPEC**
            );

            const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data.data; // Adjust based on your actual API response structure

            // Store new tokens using AsyncStorage (await)
            await AsyncStorage.setItem(AUTH_TOKEN_KEY, accessToken);
            // Only store new refresh token if backend provides one
            if (newRefreshToken) {
              await AsyncStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
            }

            console.log('Token refreshed successfully. Retrying original request...');

            // Update the header of the original request
            if (originalRequest.headers) {
              originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
            } else {
              originalRequest.headers = { 'Authorization': `Bearer ${accessToken}` };
            }

            // Retry the original request with the new token
            return apiClient(originalRequest);
          } else {
            console.log('No refresh token found, cannot refresh.');
            // Handle logout - Dispatch action, navigate, etc.
            await handleLogout();
            return Promise.reject(error); // Reject original error after handling logout
          }
        } catch (refreshError: any) {
          console.error('Unable to refresh token:', refreshError.response?.data || refreshError.message);
          // Refresh failed, logout the user
          await handleLogout();
          // It's often better to reject with the refreshError to indicate *why* it ultimately failed
          return Promise.reject(refreshError);
        }
      }

      // For errors other than 401 or if retry failed, reject the promise
      return Promise.reject(error);
    }
);
// --- Helper Function for Logout ---
// This should ideally trigger a state change (e.g., Redux action)
// rather than performing navigation directly within this utility file.
async function handleLogout() {
  console.log('Handling logout due to auth failure...');
  try {
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
    // **IMPORTANT**: Trigger logout state in your app (e.g., dispatch Redux action)
    // Example: import store from '../store'; import { logoutUser } from '../store/slices/authSlice'; store.dispatch(logoutUser());
    console.log('Tokens removed. Logout action should be dispatched.');
  } catch (e) {
    console.error('Error removing tokens during logout handling:', e);
  }
}
// API请求工具函数

// These functions automatically extract the 'data' part of the Axios response.

// Define a generic type for the structured API response from your backend
// Adjust this based on the actual structure defined in your API design (Section 1.3)
interface ApiResponse<T> {
  status: 'success' | 'error';
  code: number;
  data?: T;
  message?: string;
  errors?: Array<{ code: string; field?: string; message: string }>;
  // Add other common fields like timestamp, requestId if needed
}

export const apiService = {
  // GET request
  get: <T>(url: string, config?: AxiosRequestConfig): Promise<T | undefined> => {
    return apiClient.get<ApiResponse<T>>(url, config)
        .then((response: AxiosResponse<ApiResponse<T>>) => response.data.data); // Extract nested data field
  },

  // POST request
  post: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T | undefined> => {
    return apiClient.post<ApiResponse<T>>(url, data, config)
        .then((response: AxiosResponse<ApiResponse<T>>) => response.data.data); // Extract nested data field
  },

  // PUT request
  put: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T | undefined> => {
    return apiClient.put<ApiResponse<T>>(url, data, config)
        .then((response: AxiosResponse<ApiResponse<T>>) => response.data.data); // Extract nested data field
  },

  // PATCH request
  patch: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T | undefined> => {
    return apiClient.patch<ApiResponse<T>>(url, data, config)
        .then((response: AxiosResponse<ApiResponse<T>>) => response.data.data); // Extract nested data field
  },

  // DELETE request
  delete: <T = void>(url: string, config?: AxiosRequestConfig): Promise<T | undefined> => {
    // Delete might return data (e.g., the deleted object) or nothing (void)
    return apiClient.delete<ApiResponse<T>>(url, config)
        .then((response: AxiosResponse<ApiResponse<T>>) => response.data.data); // Extract nested data field
  },
};

export default apiService;
