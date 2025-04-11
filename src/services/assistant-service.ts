import { apiClient } from './api';
import { 
  SendMessageRequest, 
  SendMessageResponse, 
  GetConversationResponse, 
  GetConversationsResponse, 
  UpdateAssistantSettingsRequest, 
  UpdateAssistantSettingsResponse, 
  UploadAttachmentResponse
} from '../types/assistant';

/**
 * AI助手服务
 * 处理与AI助手交互的所有功能
 */
const assistantService = {
  /**
   * 发送消息到AI助手
   * @param request 消息请求
   */
  sendMessage: async (request: SendMessageRequest): Promise<SendMessageResponse | null> => {
    try {
      const response = await apiClient.post<SendMessageResponse>('/assistant/message', request);
      return response || null;
    } catch (error) {
      console.error('发送消息失败:', error);
      return null;
    }
  },

  /**
   * 获取特定对话的全部消息
   * @param conversationId 对话ID
   */
  getConversation: async (conversationId: string): Promise<GetConversationResponse | null> => {
    try {
      const response = await apiClient.get<GetConversationResponse>(`/assistant/conversations/${conversationId}`);
      return response || null;
    } catch (error) {
      console.error(`获取对话(${conversationId})失败:`, error);
      return null;
    }
  },

  /**
   * 获取用户的所有对话
   * @param limit 限制返回的记录数
   * @param offset 分页偏移量
   */
  getConversations: async (limit: number = 20, offset: number = 0): Promise<GetConversationsResponse | null> => {
    try {
      const response = await apiClient.get<GetConversationsResponse>(
        `/assistant/conversations?limit=${limit}&offset=${offset}`
      );
      return response || null;
    } catch (error) {
      console.error('获取对话列表失败:', error);
      return null;
    }
  },

  /**
   * 创建新对话
   * @param assistantType 助手类型
   * @param title 对话标题
   */
  createConversation: async (assistantType: string, title?: string): Promise<{ conversationId: string } | null> => {
    try {
      const response = await apiClient.post<{ conversationId: string }>('/assistant/conversations', {
        assistantType,
        title: title || `新对话 - ${new Date().toLocaleString()}`
      });
      return response || null;
    } catch (error) {
      console.error('创建对话失败:', error);
      return null;
    }
  },

  /**
   * 重命名对话
   * @param conversationId 对话ID
   * @param title 新标题
   */
  renameConversation: async (conversationId: string, title: string): Promise<boolean> => {
    try {
      await apiClient.put(`/assistant/conversations/${conversationId}`, { title });
      return true;
    } catch (error) {
      console.error(`重命名对话(${conversationId})失败:`, error);
      return false;
    }
  },

  /**
   * 删除对话
   * @param conversationId 对话ID
   */
  deleteConversation: async (conversationId: string): Promise<boolean> => {
    try {
      await apiClient.delete(`/assistant/conversations/${conversationId}`);
      return true;
    } catch (error) {
      console.error(`删除对话(${conversationId})失败:`, error);
      return false;
    }
  },

  /**
   * 更新助手设置
   * @param request 设置更新请求
   */
  updateSettings: async (request: UpdateAssistantSettingsRequest): Promise<UpdateAssistantSettingsResponse | null> => {
    try {
      const response = await apiClient.put<UpdateAssistantSettingsResponse>('/assistant/settings', request);
      return response || null;
    } catch (error) {
      console.error('更新助手设置失败:', error);
      return null;
    }
  },

  /**
   * 更新助手设置（别名，与updateSettings功能相同）
   * @param request 设置更新请求
   */
  updateAssistantSettings: async (request: UpdateAssistantSettingsRequest): Promise<UpdateAssistantSettingsResponse | null> => {
    return assistantService.updateSettings(request);
  },

  /**
   * 获取助手设置
   */
  getSettings: async (): Promise<UpdateAssistantSettingsResponse | null> => {
    try {
      const response = await apiClient.get<UpdateAssistantSettingsResponse>('/assistant/settings');
      return response || null;
    } catch (error) {
      console.error('获取助手设置失败:', error);
      return null;
    }
  },

  /**
   * 上传附件
   * @param formData 包含附件的FormData
   */
  uploadAttachment: async (formData: FormData): Promise<UploadAttachmentResponse | null> => {
    try {
      const response = await apiClient.post<UploadAttachmentResponse>('/assistant/attachments', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response || null;
    } catch (error) {
      console.error('上传附件失败:', error);
      return null;
    }
  },

  /**
   * 获取使用情况统计
   */
  getUsageStats: async (): Promise<{ 
    totalConversations: number;
    totalMessages: number;
    messagesByType: Record<string, number>;
  } | null> => {
    try {
      const response = await apiClient.get<{ 
        totalConversations: number;
        totalMessages: number;
        messagesByType: Record<string, number>;
      }>('/assistant/stats');
      return response || null;
    } catch (error) {
      console.error('获取使用情况统计失败:', error);
      return null;
    }
  },

  /**
   * 标记对话为收藏
   * @param conversationId 对话ID
   * @param isFavorite 是否收藏
   */
  setFavoriteConversation: async (conversationId: string, isFavorite: boolean): Promise<boolean> => {
    try {
      await apiClient.put(`/assistant/conversations/${conversationId}/favorite`, { isFavorite });
      return true;
    } catch (error) {
      console.error(`设置对话(${conversationId})收藏状态失败:`, error);
      return false;
    }
  },

  /**
   * 获取收藏的对话
   */
  getFavoriteConversations: async (): Promise<GetConversationsResponse | null> => {
    try {
      const response = await apiClient.get<GetConversationsResponse>('/assistant/conversations/favorites');
      return response || null;
    } catch (error) {
      console.error('获取收藏对话失败:', error);
      return null;
    }
  },

  /**
   * 清除对话历史
   * @param conversationId 对话ID
   */
  clearConversationHistory: async (conversationId: string): Promise<boolean> => {
    try {
      await apiClient.delete(`/assistant/conversations/${conversationId}/messages`);
      return true;
    } catch (error) {
      console.error(`清除对话(${conversationId})历史失败:`, error);
      return false;
    }
  }
};

export default assistantService; 