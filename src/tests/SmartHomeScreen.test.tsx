import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import iotReducer from '../store/slices/iotSlice';
import SmartHomeScreen from '../screens/iot/SmartHomeScreen';
import apiService from '../services/api';

// 模拟API服务
jest.mock('../services/api', () => ({
  iot: {
    getDevices: jest.fn(),
    getScenes: jest.fn(),
    updateDeviceStatus: jest.fn(),
    activateScene: jest.fn(),
  },
}));

// 创建测试store
const createTestStore = (preloadedState = {}) => {
  return configureStore({
    reducer: {
      iot: iotReducer,
    },
    preloadedState,
  });
};

describe('SmartHomeScreen', () => {
  beforeEach(() => {
    // 重置模拟函数
    jest.clearAllMocks();
    
    // 模拟设备和场景数据
    apiService.iot.getDevices.mockResolvedValue({
      data: [
        {
          id: 'd1',
          name: '客厅主灯',
          type: 'light',
          room: '客厅',
          status: 'on',
          isConnected: true,
        },
        {
          id: 'd2',
          name: '卧室空调',
          type: 'thermostat',
          room: '卧室',
          status: 'off',
          isConnected: true,
        },
      ],
    });
    
    apiService.iot.getScenes.mockResolvedValue({
      data: [
        {
          id: 's1',
          name: '回家模式',
          icon: '🏠',
          isActive: false,
        },
        {
          id: 's2',
          name: '睡眠模式',
          icon: '🌙',
          isActive: false,
        },
      ],
    });
  });

  test('渲染智能家居界面', async () => {
    const store = createTestStore();
    
    const { getByText, findByText } = render(
      <Provider store={store}>
        <SmartHomeScreen />
      </Provider>
    );

    // 验证API调用
    expect(apiService.iot.getDevices).toHaveBeenCalled();
    expect(apiService.iot.getScenes).toHaveBeenCalled();

    // 等待数据加载
    await findByText('客厅主灯');
    await findByText('卧室空调');
    await findByText('回家模式');
    await findByText('睡眠模式');

    // 验证界面元素存在
    expect(getByText('我的设备')).toBeTruthy();
    expect(getByText('场景')).toBeTruthy();
  });

  test('控制设备状态', async () => {
    // 模拟成功的设备状态更新响应
    apiService.iot.updateDeviceStatus.mockResolvedValueOnce({
      data: {
        id: 'd1',
        name: '客厅主灯',
        type: 'light',
        room: '客厅',
        status: 'off',
        isConnected: true,
      },
    });

    const store = createTestStore();
    
    const { findByText, findByTestId } = render(
      <Provider store={store}>
        <SmartHomeScreen />
      </Provider>
    );

    // 等待设备加载
    const deviceCard = await findByText('客厅主灯');
    
    // 找到设备开关并点击
    const deviceSwitch = await findByTestId('device-switch-d1');
    fireEvent.press(deviceSwitch);

    // 验证API调用
    expect(apiService.iot.updateDeviceStatus).toHaveBeenCalledWith('d1', { status: 'off' });

    // 等待状态更新
    await waitFor(() => {
      expect(store.getState().iot.devices.find(d => d.id === 'd1').status).toBe('off');
    });
  });

  test('激活场景', async () => {
    // 模拟成功的场景激活响应
    apiService.iot.activateScene.mockResolvedValueOnce({
      data: {
        id: 's1',
        name: '回家模式',
        icon: '🏠',
        isActive: true,
      },
    });

    const store = createTestStore();
    
    const { findByText } = render(
      <Provider store={store}>
        <SmartHomeScreen />
      </Provider>
    );

    // 等待场景加载
    const sceneCard = await findByText('回家模式');
    
    // 点击场景卡片
    fireEvent.press(sceneCard);

    // 验证API调用
    expect(apiService.iot.activateScene).toHaveBeenCalledWith('s1');

    // 等待状态更新
    await waitFor(() => {
      expect(store.getState().iot.scenes.find(s => s.id === 's1').isActive).toBe(true);
    });
  });

  test('处理设备控制错误', async () => {
    // 模拟设备控制失败
    apiService.iot.updateDeviceStatus.mockRejectedValueOnce(new Error('设备无响应'));

    const store = createTestStore();
    
    const { findByText, findByTestId } = render(
      <Provider store={store}>
        <SmartHomeScreen />
      </Provider>
    );

    // 等待设备加载
    await findByText('客厅主灯');
    
    // 找到设备开关并点击
    const deviceSwitch = await findByTestId('device-switch-d1');
    fireEvent.press(deviceSwitch);

    // 验证API调用
    expect(apiService.iot.updateDeviceStatus).toHaveBeenCalledWith('d1', { status: 'off' });

    // 等待错误消息显示
    await findByText('控制设备失败：设备无响应');
  });
});
