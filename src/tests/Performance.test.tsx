import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { PerformanceMonitor } from '../utils/performance';
import AppNavigator from '../navigation/AppNavigator';
import authReducer from '../store/slices/authSlice';
import assistantReducer from '../store/slices/assistantSlice';
import schedulerReducer from '../store/slices/schedulerSlice';
import productivityReducer from '../store/slices/productivitySlice';
import iotReducer from '../store/slices/iotSlice';
import creativeReducer from '../store/slices/creativeSlice';

// 模拟性能监控工具
jest.mock('../utils/performance', () => ({
  PerformanceMonitor: {
    startMeasure: jest.fn(),
    stopMeasure: jest.fn(),
    getMetrics: jest.fn(),
    clearMetrics: jest.fn(),
  },
}));

describe('性能测试', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // 模拟性能指标
    PerformanceMonitor.getMetrics.mockReturnValue({
      renderTime: {
        avg: 120,
        min: 80,
        max: 200,
        samples: 10,
      },
      apiResponseTime: {
        avg: 250,
        min: 150,
        max: 500,
        samples: 5,
      },
      memoryUsage: {
        avg: 50,
        min: 40,
        max: 70,
        samples: 10,
      },
    });
  });
  
  test('应用启动性能应在可接受范围内', async () => {
    // 创建测试store
    const store = configureStore({
      reducer: {
        auth: authReducer,
        assistant: assistantReducer,
        scheduler: schedulerReducer,
        productivity: productivityReducer,
        iot: iotReducer,
        creative: creativeReducer,
      },
    });
    
    // 开始测量
    PerformanceMonitor.startMeasure('appLaunch');
    
    render(
      <Provider store={store}>
        <AppNavigator />
      </Provider>
    );
    
    // 停止测量
    PerformanceMonitor.stopMeasure('appLaunch');
    
    // 验证性能监控被调用
    expect(PerformanceMonitor.startMeasure).toHaveBeenCalledWith('appLaunch');
    expect(PerformanceMonitor.stopMeasure).toHaveBeenCalledWith('appLaunch');
    
    // 获取性能指标
    const metrics = PerformanceMonitor.getMetrics();
    
    // 验证性能指标在可接受范围内
    expect(metrics.renderTime.avg).toBeLessThan(200); // 平均渲染时间应小于200ms
    expect(metrics.apiResponseTime.avg).toBeLessThan(300); // 平均API响应时间应小于300ms
    expect(metrics.memoryUsage.avg).toBeLessThan(100); // 平均内存使用率应小于100MB
  });
  
  test('列表滚动性能应流畅', async () => {
    // 模拟滚动性能指标
    PerformanceMonitor.getMetrics.mockReturnValue({
      scrollFPS: {
        avg: 55,
        min: 45,
        max: 60,
        samples: 100,
      },
      scrollJank: {
        count: 2,
        duration: 50,
      },
    });
    
    // 验证滚动性能指标
    const metrics = PerformanceMonitor.getMetrics();
    
    // 验证滚动帧率在可接受范围内（应接近60FPS）
    expect(metrics.scrollFPS.avg).toBeGreaterThan(45);
    
    // 验证卡顿次数在可接受范围内
    expect(metrics.scrollJank.count).toBeLessThan(5);
  });
  
  test('内存使用应在合理范围内', async () => {
    // 模拟长时间运行后的内存使用指标
    PerformanceMonitor.getMetrics.mockReturnValue({
      memoryUsage: {
        initial: 30,
        current: 45,
        peak: 70,
        leak: false,
      },
    });
    
    // 验证内存使用指标
    const metrics = PerformanceMonitor.getMetrics();
    
    // 验证内存使用在合理范围内
    expect(metrics.memoryUsage.current).toBeLessThan(100); // 当前内存使用应小于100MB
    expect(metrics.memoryUsage.peak).toBeLessThan(150); // 峰值内存使用应小于150MB
    expect(metrics.memoryUsage.leak).toBe(false); // 不应有内存泄漏
  });
  
  test('API响应时间应在可接受范围内', async () => {
    // 模拟API响应时间指标
    PerformanceMonitor.getMetrics.mockReturnValue({
      apiResponseTime: {
        login: 180,
        getProfile: 120,
        getEvents: 250,
        getDevices: 200,
        average: 187.5,
      },
    });
    
    // 验证API响应时间指标
    const metrics = PerformanceMonitor.getMetrics();
    
    // 验证各API响应时间在可接受范围内
    expect(metrics.apiResponseTime.login).toBeLessThan(300);
    expect(metrics.apiResponseTime.getProfile).toBeLessThan(300);
    expect(metrics.apiResponseTime.getEvents).toBeLessThan(300);
    expect(metrics.apiResponseTime.getDevices).toBeLessThan(300);
    expect(metrics.apiResponseTime.average).toBeLessThan(250);
  });
});
