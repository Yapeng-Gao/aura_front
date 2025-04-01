import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import creativeReducer from '../store/slices/creativeSlice';
import CreativeStudioScreen from '../screens/creative/CreativeStudioScreen';
import apiService from '../services/api';

// 模拟API服务
jest.mock('../services/api', () => ({
  creative: {
    generateText: jest.fn(),
    generateImage: jest.fn(),
    generateMusic: jest.fn(),
    getProjects: jest.fn(),
    createProject: jest.fn(),
  },
}));

// 创建测试store
const createTestStore = (preloadedState = {}) => {
  return configureStore({
    reducer: {
      creative: creativeReducer,
    },
    preloadedState,
  });
};

describe('CreativeStudioScreen', () => {
  beforeEach(() => {
    // 重置模拟函数
    jest.clearAllMocks();
    
    // 模拟项目数据
    apiService.creative.getProjects.mockResolvedValue({
      data: [
        {
          id: 'p1',
          name: '小说创作',
          type: 'text',
          createdAt: '2025-03-20T10:00:00',
          items: [
            {
              id: 'i1',
              type: 'text',
              content: '从前有座山，山上有座庙...',
              createdAt: '2025-03-20T10:05:00',
            }
          ],
        },
        {
          id: 'p2',
          name: '艺术作品集',
          type: 'image',
          createdAt: '2025-03-22T14:30:00',
          items: [
            {
              id: 'i2',
              type: 'image',
              url: 'https://example.com/image1.jpg',
              prompt: '未来城市风景',
              createdAt: '2025-03-22T14:35:00',
            }
          ],
        },
      ],
    });
  });

  test('渲染创意工作室界面', async () => {
    const store = createTestStore();
    
    const { getByText, findByText } = render(
      <Provider store={store}>
        <CreativeStudioScreen />
      </Provider>
    );

    // 验证API调用
    expect(apiService.creative.getProjects).toHaveBeenCalled();

    // 等待项目加载
    await findByText('小说创作');
    await findByText('艺术作品集');

    // 验证界面元素存在
    expect(getByText('创意工作室')).toBeTruthy();
    expect(getByText('新建项目')).toBeTruthy();
    expect(getByText('文本生成')).toBeTruthy();
    expect(getByText('图像生成')).toBeTruthy();
    expect(getByText('音乐生成')).toBeTruthy();
  });

  test('生成文本', async () => {
    // 模拟成功的文本生成响应
    apiService.creative.generateText.mockResolvedValueOnce({
      data: {
        id: 't1',
        content: '这是AI生成的文本内容，展示了创意写作的能力。',
        prompt: '写一段关于创意的短文',
      },
    });

    const store = createTestStore();
    
    const { getByText, getByPlaceholderText, findByText } = render(
      <Provider store={store}>
        <CreativeStudioScreen />
      </Provider>
    );

    // 选择文本生成选项卡
    const textTab = getByText('文本生成');
    fireEvent.press(textTab);

    // 输入提示词
    const promptInput = getByPlaceholderText('输入提示词...');
    fireEvent.changeText(promptInput, '写一段关于创意的短文');
    
    // 点击生成按钮
    const generateButton = getByText('生成');
    fireEvent.press(generateButton);

    // 验证API调用
    expect(apiService.creative.generateText).toHaveBeenCalledWith({
      prompt: '写一段关于创意的短文',
    });

    // 等待生成结果显示
    await findByText('这是AI生成的文本内容，展示了创意写作的能力。');
  });

  test('生成图像', async () => {
    // 模拟成功的图像生成响应
    apiService.creative.generateImage.mockResolvedValueOnce({
      data: {
        id: 'img1',
        url: 'https://example.com/generated-image.jpg',
        prompt: '未来城市夜景，霓虹灯，赛博朋克风格',
        style: 'realistic',
      },
    });

    const store = createTestStore();
    
    const { getByText, getByPlaceholderText, findByTestId } = render(
      <Provider store={store}>
        <CreativeStudioScreen />
      </Provider>
    );

    // 选择图像生成选项卡
    const imageTab = getByText('图像生成');
    fireEvent.press(imageTab);

    // 输入提示词
    const promptInput = getByPlaceholderText('描述你想要的图像...');
    fireEvent.changeText(promptInput, '未来城市夜景，霓虹灯，赛博朋克风格');
    
    // 选择风格
    const styleSelect = getByText('选择风格');
    fireEvent.press(styleSelect);
    const realisticOption = getByText('写实');
    fireEvent.press(realisticOption);
    
    // 点击生成按钮
    const generateButton = getByText('生成图像');
    fireEvent.press(generateButton);

    // 验证API调用
    expect(apiService.creative.generateImage).toHaveBeenCalledWith({
      prompt: '未来城市夜景，霓虹灯，赛博朋克风格',
      style: 'realistic',
    });

    // 等待生成的图像显示
    await findByTestId('generated-image');
  });

  test('创建新项目', async () => {
    // 模拟成功的项目创建响应
    apiService.creative.createProject.mockResolvedValueOnce({
      data: {
        id: 'p3',
        name: '新音乐项目',
        type: 'music',
        createdAt: new Date().toISOString(),
        items: [],
      },
    });

    const store = createTestStore();
    
    const { getByText, getByPlaceholderText, findByText } = render(
      <Provider store={store}>
        <CreativeStudioScreen />
      </Provider>
    );

    // 点击新建项目按钮
    const newProjectButton = getByText('新建项目');
    fireEvent.press(newProjectButton);

    // 填写项目表单
    const nameInput = getByPlaceholderText('项目名称');
    fireEvent.changeText(nameInput, '新音乐项目');
    
    // 选择项目类型
    const typeSelect = getByText('选择类型');
    fireEvent.press(typeSelect);
    const musicOption = getByText('音乐');
    fireEvent.press(musicOption);
    
    // 创建项目
    const createButton = getByText('创建');
    fireEvent.press(createButton);

    // 验证API调用
    expect(apiService.creative.createProject).toHaveBeenCalledWith({
      name: '新音乐项目',
      type: 'music',
    });

    // 等待新项目显示
    await findByText('新音乐项目');
  });

  test('处理生成错误', async () => {
    // 模拟文本生成失败
    apiService.creative.generateText.mockRejectedValueOnce(new Error('生成失败，请稍后再试'));

    const store = createTestStore();
    
    const { getByText, getByPlaceholderText, findByText } = render(
      <Provider store={store}>
        <CreativeStudioScreen />
      </Provider>
    );

    // 选择文本生成选项卡
    const textTab = getByText('文本生成');
    fireEvent.press(textTab);

    // 输入提示词
    const promptInput = getByPlaceholderText('输入提示词...');
    fireEvent.changeText(promptInput, '写一段关于创意的短文');
    
    // 点击生成按钮
    const generateButton = getByText('生成');
    fireEvent.press(generateButton);

    // 验证API调用
    expect(apiService.creative.generateText).toHaveBeenCalled();

    // 等待错误消息显示
    await findByText('生成失败：生成失败，请稍后再试');
  });
});
