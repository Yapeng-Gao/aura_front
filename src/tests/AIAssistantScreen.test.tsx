import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import assistantReducer from '../store/slices/assistantSlice';
import AIAssistantScreen from '../screens/assistant/AIAssistantScreen';
import apiService from '../services/api';

// 模拟API服务
jest.mock('../services/api', () => ({
  assistant: {
    sendMessage: jest.fn(),
    getConversation: jest.fn(),
  },
}));

// 创建测试store
const createTestStore = (preloadedState = {}) => {
  return configureStore({
    reducer: {
      assistant: assistantReducer,
    },
    preloadedState,
  });
};

describe('AIAssistantScreen', () => {
  beforeEach(() => {
    // 重置模拟函数
    jest.clearAllMocks();
  });

  test('渲染AI助手界面', () => {
    const store = createTestStore({
      assistant: {
        conversations: [],
        currentConversation: {
          id: '1',
          messages: [],
          createdAt: new Date().toISOString(),
        },
        isLoading: false,
        error: null,
      },
    });
    
    const { getByPlaceholderText, getByText } = render(
      <Provider store={store}>
        <AIAssistantScreen />
      </Provider>
    );

    // 验证界面元素存在
    expect(getByPlaceholderText('输入消息...')).toBeTruthy();
    expect(getByText('发送')).toBeTruthy();
  });

  test('发送消息', async () => {
    // 模拟成功的消息发送响应
    apiService.assistant.sendMessage.mockResolvedValueOnce({
      data: {
        id: '1',
        messages: [
          {
            id: 'm1',
            content: '你好，我能帮你什么？',
            role: 'assistant',
            createdAt: new Date().toISOString(),
          },
        ],
      },
    });

    const store = createTestStore({
      assistant: {
        conversations: [],
        currentConversation: {
          id: '1',
          messages: [],
          createdAt: new Date().toISOString(),
        },
        isLoading: false,
        error: null,
      },
    });
    
    const { getByPlaceholderText, getByText } = render(
      <Provider store={store}>
        <AIAssistantScreen />
      </Provider>
    );

    // 输入消息
    const input = getByPlaceholderText('输入消息...');
    fireEvent.changeText(input, '你好');
    
    // 点击发送按钮
    const sendButton = getByText('发送');
    fireEvent.press(sendButton);

    // 验证API调用
    expect(apiService.assistant.sendMessage).toHaveBeenCalledWith({
      conversationId: '1',
      content: '你好',
      role: 'user',
    });

    // 等待响应
    await waitFor(() => {
      // 验证助手回复显示
      expect(getByText('你好，我能帮你什么？')).toBeTruthy();
    });
  });

  test('处理发送消息失败', async () => {
    // 模拟失败的消息发送响应
    apiService.assistant.sendMessage.mockRejectedValueOnce(new Error('网络错误'));

    const store = createTestStore({
      assistant: {
        conversations: [],
        currentConversation: {
          id: '1',
          messages: [],
          createdAt: new Date().toISOString(),
        },
        isLoading: false,
        error: null,
      },
    });
    
    const { getByPlaceholderText, getByText } = render(
      <Provider store={store}>
        <AIAssistantScreen />
      </Provider>
    );

    // 输入消息
    const input = getByPlaceholderText('输入消息...');
    fireEvent.changeText(input, '你好');
    
    // 点击发送按钮
    const sendButton = getByText('发送');
    fireEvent.press(sendButton);

    // 验证API调用
    expect(apiService.assistant.sendMessage).toHaveBeenCalledWith({
      conversationId: '1',
      content: '你好',
      role: 'user',
    });

    // 等待错误消息显示
    await waitFor(() => {
      expect(getByText('发送消息失败：网络错误')).toBeTruthy();
    });
  });

  test('加载对话历史', async () => {
    // 模拟成功的对话历史获取响应
    apiService.assistant.getConversation.mockResolvedValueOnce({
      data: {
        id: '1',
        messages: [
          {
            id: 'm1',
            content: '你好',
            role: 'user',
            createdAt: new Date().toISOString(),
          },
          {
            id: 'm2',
            content: '你好，我能帮你什么？',
            role: 'assistant',
            createdAt: new Date().toISOString(),
          },
        ],
        createdAt: new Date().toISOString(),
      },
    });

    const store = createTestStore({
      assistant: {
        conversations: [],
        currentConversation: null,
        isLoading: false,
        error: null,
      },
    });
    
    const { getByText } = render(
      <Provider store={store}>
        <AIAssistantScreen conversationId="1" />
      </Provider>
    );

    // 验证API调用
    expect(apiService.assistant.getConversation).toHaveBeenCalledWith('1');

    // 等待对话历史加载
    await waitFor(() => {
      expect(getByText('你好')).toBeTruthy();
      expect(getByText('你好，我能帮你什么？')).toBeTruthy();
    });
  });
});
