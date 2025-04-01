import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../store/slices/authSlice';
import LoginScreen from '../screens/auth/LoginScreen';
import apiService from '../services/api';

// 模拟API服务
jest.mock('../services/api', () => ({
  auth: {
    login: jest.fn(),
  },
}));

// 创建测试store
const createTestStore = (preloadedState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState,
  });
};

describe('LoginScreen', () => {
  beforeEach(() => {
    // 重置模拟函数
    jest.clearAllMocks();
  });

  test('渲染登录表单', () => {
    const store = createTestStore();
    const { getByPlaceholderText, getByText } = render(
      <Provider store={store}>
        <LoginScreen />
      </Provider>
    );

    // 验证表单元素存在
    expect(getByPlaceholderText('邮箱')).toBeTruthy();
    expect(getByPlaceholderText('密码')).toBeTruthy();
    expect(getByText('登录')).toBeTruthy();
    expect(getByText('忘记密码？')).toBeTruthy();
    expect(getByText('没有账号？注册')).toBeTruthy();
  });

  test('输入验证', () => {
    const store = createTestStore();
    const { getByPlaceholderText, getByText } = render(
      <Provider store={store}>
        <LoginScreen />
      </Provider>
    );

    // 获取输入框和按钮
    const emailInput = getByPlaceholderText('邮箱');
    const passwordInput = getByPlaceholderText('密码');
    const loginButton = getByText('登录');

    // 测试空输入
    fireEvent.press(loginButton);
    expect(getByText('请输入邮箱')).toBeTruthy();

    // 测试无效邮箱
    fireEvent.changeText(emailInput, 'invalid-email');
    fireEvent.press(loginButton);
    expect(getByText('请输入有效的邮箱地址')).toBeTruthy();

    // 测试无密码
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.press(loginButton);
    expect(getByText('请输入密码')).toBeTruthy();

    // 测试密码太短
    fireEvent.changeText(passwordInput, '123');
    fireEvent.press(loginButton);
    expect(getByText('密码至少需要6个字符')).toBeTruthy();
  });

  test('成功登录', async () => {
    // 模拟成功的登录响应
    apiService.auth.login.mockResolvedValueOnce({
      data: {
        token: 'fake-token',
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
        },
      },
    });

    const store = createTestStore();
    const { getByPlaceholderText, getByText, queryByText } = render(
      <Provider store={store}>
        <LoginScreen />
      </Provider>
    );

    // 填写表单
    fireEvent.changeText(getByPlaceholderText('邮箱'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('密码'), 'password123');
    fireEvent.press(getByText('登录'));

    // 验证API调用
    expect(apiService.auth.login).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });

    // 等待登录完成
    await waitFor(() => {
      // 验证错误消息不存在
      expect(queryByText('邮箱或密码不正确')).toBeNull();
      
      // 验证store中的状态
      const state = store.getState();
      expect(state.auth.isAuthenticated).toBe(true);
      expect(state.auth.token).toBe('fake-token');
      expect(state.auth.user).toEqual({
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
      });
    });
  });

  test('登录失败', async () => {
    // 模拟失败的登录响应
    apiService.auth.login.mockRejectedValueOnce({
      response: {
        data: {
          message: '邮箱或密码不正确',
        },
      },
    });

    const store = createTestStore();
    const { getByPlaceholderText, getByText } = render(
      <Provider store={store}>
        <LoginScreen />
      </Provider>
    );

    // 填写表单
    fireEvent.changeText(getByPlaceholderText('邮箱'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('密码'), 'wrongpassword');
    fireEvent.press(getByText('登录'));

    // 验证API调用
    expect(apiService.auth.login).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'wrongpassword',
    });

    // 等待错误消息显示
    await waitFor(() => {
      expect(getByText('邮箱或密码不正确')).toBeTruthy();
      
      // 验证store中的状态
      const state = store.getState();
      expect(state.auth.isAuthenticated).toBe(false);
      expect(state.auth.token).toBeNull();
      expect(state.auth.user).toBeNull();
    });
  });
});
