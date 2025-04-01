import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import schedulerReducer from '../store/slices/schedulerSlice';
import CalendarScreen from '../screens/scheduler/CalendarScreen';
import apiService from '../services/api';

// 模拟API服务
jest.mock('../services/api', () => ({
  scheduler: {
    getEvents: jest.fn(),
    createEvent: jest.fn(),
    updateEvent: jest.fn(),
    deleteEvent: jest.fn(),
  },
}));

// 创建测试store
const createTestStore = (preloadedState = {}) => {
  return configureStore({
    reducer: {
      scheduler: schedulerReducer,
    },
    preloadedState,
  });
};

describe('CalendarScreen', () => {
  beforeEach(() => {
    // 重置模拟函数
    jest.clearAllMocks();
    
    // 模拟日历事件数据
    apiService.scheduler.getEvents.mockResolvedValue({
      data: [
        {
          id: 'e1',
          title: '团队会议',
          description: '讨论项目进度',
          startTime: '2025-03-27T10:00:00',
          endTime: '2025-03-27T11:00:00',
          location: '会议室A',
          color: '#4285F4',
        },
        {
          id: 'e2',
          title: '医生预约',
          description: '年度体检',
          startTime: '2025-03-28T14:30:00',
          endTime: '2025-03-28T15:30:00',
          location: '市中心医院',
          color: '#0F9D58',
        },
      ],
    });
  });

  test('渲染日历界面', async () => {
    const store = createTestStore();
    
    const { getByText, findByText } = render(
      <Provider store={store}>
        <CalendarScreen />
      </Provider>
    );

    // 验证API调用
    expect(apiService.scheduler.getEvents).toHaveBeenCalled();

    // 等待事件加载
    await findByText('团队会议');
    await findByText('医生预约');

    // 验证界面元素存在
    expect(getByText('日历')).toBeTruthy();
    expect(getByText('添加事件')).toBeTruthy();
  });

  test('创建新事件', async () => {
    // 模拟成功的事件创建响应
    apiService.scheduler.createEvent.mockResolvedValueOnce({
      data: {
        id: 'e3',
        title: '新事件',
        description: '事件描述',
        startTime: '2025-03-29T09:00:00',
        endTime: '2025-03-29T10:00:00',
        location: '线上',
        color: '#DB4437',
      },
    });

    const store = createTestStore();
    
    const { getByText, getByPlaceholderText, findByText } = render(
      <Provider store={store}>
        <CalendarScreen />
      </Provider>
    );

    // 点击添加事件按钮
    const addButton = getByText('添加事件');
    fireEvent.press(addButton);

    // 填写事件表单
    const titleInput = getByPlaceholderText('事件标题');
    const descriptionInput = getByPlaceholderText('事件描述');
    const locationInput = getByPlaceholderText('地点');
    
    fireEvent.changeText(titleInput, '新事件');
    fireEvent.changeText(descriptionInput, '事件描述');
    fireEvent.changeText(locationInput, '线上');
    
    // 提交表单
    const saveButton = getByText('保存');
    fireEvent.press(saveButton);

    // 验证API调用
    expect(apiService.scheduler.createEvent).toHaveBeenCalledWith(expect.objectContaining({
      title: '新事件',
      description: '事件描述',
      location: '线上',
    }));

    // 等待新事件显示
    await findByText('新事件');
  });

  test('更新事件', async () => {
    // 模拟成功的事件更新响应
    apiService.scheduler.updateEvent.mockResolvedValueOnce({
      data: {
        id: 'e1',
        title: '更新的会议',
        description: '讨论项目进度',
        startTime: '2025-03-27T10:00:00',
        endTime: '2025-03-27T11:00:00',
        location: '会议室A',
        color: '#4285F4',
      },
    });

    const store = createTestStore();
    
    const { findByText, getByPlaceholderText, getByText } = render(
      <Provider store={store}>
        <CalendarScreen />
      </Provider>
    );

    // 等待事件加载并点击
    const eventItem = await findByText('团队会议');
    fireEvent.press(eventItem);

    // 修改事件标题
    const titleInput = getByPlaceholderText('事件标题');
    fireEvent.changeText(titleInput, '更新的会议');
    
    // 保存更新
    const updateButton = getByText('更新');
    fireEvent.press(updateButton);

    // 验证API调用
    expect(apiService.scheduler.updateEvent).toHaveBeenCalledWith('e1', expect.objectContaining({
      title: '更新的会议',
    }));

    // 等待更新后的事件显示
    await findByText('更新的会议');
  });

  test('删除事件', async () => {
    // 模拟成功的事件删除响应
    apiService.scheduler.deleteEvent.mockResolvedValueOnce({
      data: { success: true },
    });

    const store = createTestStore();
    
    const { findByText, getByText } = render(
      <Provider store={store}>
        <CalendarScreen />
      </Provider>
    );

    // 等待事件加载并点击
    const eventItem = await findByText('团队会议');
    fireEvent.press(eventItem);

    // 点击删除按钮
    const deleteButton = getByText('删除');
    fireEvent.press(deleteButton);

    // 确认删除
    const confirmButton = getByText('确认');
    fireEvent.press(confirmButton);

    // 验证API调用
    expect(apiService.scheduler.deleteEvent).toHaveBeenCalledWith('e1');

    // 等待事件被移除
    await waitFor(() => {
      expect(() => getByText('团队会议')).toThrow();
    });
  });

  test('处理事件创建错误', async () => {
    // 模拟事件创建失败
    apiService.scheduler.createEvent.mockRejectedValueOnce(new Error('创建事件失败'));

    const store = createTestStore();
    
    const { getByText, getByPlaceholderText, findByText } = render(
      <Provider store={store}>
        <CalendarScreen />
      </Provider>
    );

    // 点击添加事件按钮
    const addButton = getByText('添加事件');
    fireEvent.press(addButton);

    // 填写事件表单
    const titleInput = getByPlaceholderText('事件标题');
    fireEvent.changeText(titleInput, '新事件');
    
    // 提交表单
    const saveButton = getByText('保存');
    fireEvent.press(saveButton);

    // 验证API调用
    expect(apiService.scheduler.createEvent).toHaveBeenCalled();

    // 等待错误消息显示
    await findByText('创建事件失败：创建事件失败');
  });
});
