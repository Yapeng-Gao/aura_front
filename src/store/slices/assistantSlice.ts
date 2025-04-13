import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// 助手状态接口
interface AssistantState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  assistantSettings: AssistantSettings;
  isProcessing: boolean;
  error: string | null;
}

// 对话接口
interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

// 消息接口
interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string | MessageContent;
  timestamp: string;
}

// 消息内容接口（支持多模态）
interface MessageContent {
  text?: string;
  image?: string;
  audio?: string;
  attachments?: Attachment[];
}

// 附件接口
interface Attachment {
  id: string;
  type: 'image' | 'audio' | 'document' | 'link';
  url: string;
  name: string;
  size?: number;
}

// 助手设置接口
interface AssistantSettings {
  appearance: {
    avatar: string;
    theme: string;
  };
  behavior: {
    personality: '专业' | '友好' | '创意' | '简洁';
    proactivity: number; // 0-100
  };
  voice: {
    enabled: boolean;
    voiceId: string;
    speed: number; // 0.5-2.0
    pitch: number; // 0-100
  };
  contextMemory: {
    enabled: boolean;
    depth: number; // 1-10
  };
}

// 初始状态
const initialState: AssistantState = {
  conversations: [],
  currentConversation: null,
  assistantSettings: {
    appearance: {
      avatar: '默认',
      theme: '浅色',
    },
    behavior: {
      personality: '友好',
      proactivity: 50,
    },
    voice: {
      enabled: true,
      voiceId: '默认',
      speed: 1.0,
      pitch: 50,
    },
    contextMemory: {
      enabled: true,
      depth: 5,
    },
  },
  isProcessing: false,
  error: null,
};

// 创建助手切片
const assistantSlice = createSlice({
  name: 'assistant',
  initialState,
  reducers: {
    // 创建新对话
    createConversation: (state, action: PayloadAction<{ title: string }>) => {
      const newConversation: Conversation = {
        id: Date.now().toString(),
        title: action.payload.title,
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      state.conversations.push(newConversation);
      state.currentConversation = newConversation;
    },
    
    // 设置当前对话
    setCurrentConversation: (state, action: PayloadAction<string>) => {
      const conversation = state.conversations.find(c => c.id === action.payload);
      if (conversation) {
        state.currentConversation = conversation;
      }
    },
    
    // 发送消息请求
    sendMessageRequest: (state, action: PayloadAction<{ content: string | MessageContent }>) => {
      if (state.currentConversation) {
        const userMessage: Message = {
          id: Date.now().toString(),
          role: 'user',
          content: action.payload.content,
          timestamp: new Date().toISOString(),
        };
        state.currentConversation.messages.push(userMessage);
        state.currentConversation.updatedAt = new Date().toISOString();
        state.isProcessing = true;
      }
    },
    
    // 接收消息成功
    receiveMessageSuccess: (state, action: PayloadAction<{ content: string | MessageContent }>) => {
      if (state.currentConversation) {
        const assistantMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: action.payload.content,
          timestamp: new Date().toISOString(),
        };
        state.currentConversation.messages.push(assistantMessage);
        state.currentConversation.updatedAt = new Date().toISOString();
        state.isProcessing = false;
      }
    },
    
    // 接收消息失败
    receiveMessageFailure: (state, action: PayloadAction<string>) => {
      state.isProcessing = false;
      state.error = action.payload;
    },
    
    // 更新助手设置
    updateAssistantSettings: (state, action: PayloadAction<Partial<AssistantSettings>>) => {
      state.assistantSettings = {
        ...state.assistantSettings,
        ...action.payload,
      };
    },
    
    // 清除对话历史
    clearConversationHistory: (state, action: PayloadAction<string>) => {
      const conversation = state.conversations.find(c => c.id === action.payload);
      if (conversation) {
        conversation.messages = [];
        conversation.updatedAt = new Date().toISOString();
      }
    },
    
    // 删除对话
    deleteConversation: (state, action: PayloadAction<string>) => {
      state.conversations = state.conversations.filter(c => c.id !== action.payload);
      if (state.currentConversation && state.currentConversation.id === action.payload) {
        state.currentConversation = state.conversations.length > 0 ? state.conversations[0] : null;
      }
    },
    
    // 清除错误
    clearError: (state) => {
      state.error = null;
    },
  },
});

// 导出动作创建器
export const {
  createConversation,
  setCurrentConversation,
  sendMessageRequest,
  receiveMessageSuccess,
  receiveMessageFailure,
  updateAssistantSettings,
  clearConversationHistory,
  deleteConversation,
  clearError,
} = assistantSlice.actions;

// 导出reducer
export default assistantSlice.reducer;
