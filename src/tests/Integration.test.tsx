import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import AppNavigator from '../navigation/AppNavigator';
import authReducer from '../store/slices/authSlice';
import assistantReducer from '../store/slices/assistantSlice';
import schedulerReducer from '../store/slices/schedulerSlice';
import productivityReducer from '../store/slices/productivitySlice';
import iotReducer from '../store/slices/iotSlice';
import creativeReducer from '../store/slices/creativeSlice';
import { SyncProvider } from '../services/sync';

// 创建测试store
const createTestStore = (preloadedState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
      assistant: assistantReducer,
      scheduler: schedulerReducer,
      productivity: productivityReducer,
      iot: iotReducer,
      creative: creativeReducer,
    },
    preloadedState,
  });
};

// 模拟导航容器
const renderWithNavigation = (component, { store }) => {
  return render(
    <Provider store={store}>
      <SyncProvider>
        <NavigationContainer>
          {component}
        </NavigationContainer>
      </SyncProvider>
    </Provider>
  );
};

describe('集成测试：应用导航和状态管理', () => {
  test('未登录用户应该看到登录界面', async () => {
    const store = createTestStore({
      auth: {
        isAuthenticated: false,
        token: null,
        user: null,
        isLoading: false,
        error: null,
      },
    });
    
    const { findByText } = renderWithNavigation(<AppNavigator />, { store });
    
    // 验证登录界面元素
    await findByText('登录到Aura');
    await findByText('没有账号？注册');
  });
  
  test('已登录用户应该看到主界面', async () => {
    const store = createTestStore({
      auth: {
        isAuthenticated: true,
        token: 'fake-token',
        user: {
          id: '1',
          name: '测试用户',
          email: 'test@example.com',
        },
        isLoading: false,
        error: null,
      },
    });
    
    const { findByText } = renderWithNavigation(<AppNavigator />, { store });
    
    // 验证主界面元素
    await findByText('Aura');
    await findByText('助手');
  });
  
  test('应用应该正确处理网络状态变化', async () => {
    const store = createTestStore({
      auth: {
        isAuthenticated: true,
        token: 'fake-token',
        user: {
          id: '1',
          name: '测试用户',
          email: 'test@example.com',
        },
      },
    });
    
    // 模拟网络状态变化
    jest.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
    
    const { findByText } = renderWithNavigation(<AppNavigator />, { store });
    
    // 验证离线模式提示
    await findByText('离线模式');
    
    // 恢复网络连接
    jest.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
    
    // 验证离线模式提示消失
    await waitFor(() => {
      expect(findByText('离线模式')).rejects.toThrow();
    });
  });
  
  test('应用应该正确处理认证状态变化', async () => {
    const store = createTestStore({
      auth: {
        isAuthenticated: true,
        token: 'fake-token',
        user: {
          id: '1',
          name: '测试用户',
          email: 'test@example.com',
        },
      },
    });
    
    const { findByText, queryByText } = renderWithNavigation(<AppNavigator />, { store });
    
    // 验证主界面元素
    await findByText('Aura');
    
    // 模拟登出
    store.dispatch({
      type: 'auth/logout',
    });
    
    // 验证返回登录界面
    await findByText('登录到Aura');
    expect(queryByText('Aura')).toBeNull();
  });
});
