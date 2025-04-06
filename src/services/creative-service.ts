import { apiClient } from './api';
import {
  ContentType,
  CreativeStyle,
  ContentGenerationRequest,
  ContentResponse,
  ContentDetailResponse,
  ContentVariationRequest,
  ContentHistoryItem
} from '../types/creative';

/**
 * 创意服务
 * 处理创意内容生成和管理功能
 */
const creativeService = {
  /**
   * 获取创意内容类型
   */
  getContentTypes: async (): Promise<ContentType[] | null> => {
    try {
      const response = await apiClient.get<ContentType[]>('/creative/content-types');
      
      return response || null;
    } catch (error) {
      console.error('获取创意内容类型失败:', error);
      return null;
    }
  },

  /**
   * 获取创意风格
   */
  getStyles: async (): Promise<CreativeStyle[] | null> => {
    try {
      const response = await apiClient.get<CreativeStyle[]>('/creative/styles');
      
      return response || null;
    } catch (error) {
      console.error('获取创意风格失败:', error);
      return null;
    }
  },

  /**
   * 生成创意内容
   * @param request 创意内容生成请求
   */
  generateContent: async (request: ContentGenerationRequest): Promise<ContentResponse | null> => {
    try {
      const response = await apiClient.post<ContentResponse>('/creative/generate', request);
      
      return response || null;
    } catch (error) {
      console.error('生成创意内容失败:', error);
      return null;
    }
  },

  /**
   * 获取用户的创意内容历史
   * @param limit 限制返回的记录数
   * @param offset 分页偏移量
   */
  getContentHistory: async (
    limit: number = 20,
    offset: number = 0
  ): Promise<ContentHistoryItem[] | null> => {
    try {
      const response = await apiClient.get<ContentHistoryItem[]>(`/creative/history?limit=${limit}&offset=${offset}`);
      
      return response || null;
    } catch (error) {
      console.error('获取创意内容历史失败:', error);
      return null;
    }
  },

  /**
   * 获取特定的创意内容
   * @param contentId 内容ID
   */
  getContent: async (contentId: string): Promise<ContentDetailResponse | null> => {
    try {
      const response = await apiClient.get<ContentDetailResponse>(`/creative/content/${contentId}`);
      
      return response || null;
    } catch (error) {
      console.error(`获取创意内容(${contentId})失败:`, error);
      return null;
    }
  },

  /**
   * 保存创意内容
   * @param contentId 内容ID
   * @param title 内容标题
   */
  saveContent: async (contentId: string, title: string): Promise<boolean> => {
    try {
      await apiClient.post('/creative/save', { contentId, title });
      return true;
    } catch (error) {
      console.error('保存创意内容失败:', error);
      return false;
    }
  },

  /**
   * 删除创意内容
   * @param contentId 内容ID
   */
  deleteContent: async (contentId: string): Promise<boolean> => {
    try {
      await apiClient.delete(`/creative/content/${contentId}`);
      return true;
    } catch (error) {
      console.error(`删除创意内容(${contentId})失败:`, error);
      return false;
    }
  },

  /**
   * 变体创意内容
   * @param contentId 原内容ID
   * @param request 变体请求
   */
  createVariation: async (
    contentId: string,
    request: ContentVariationRequest
  ): Promise<ContentResponse | null> => {
    try {
      const response = await apiClient.post<ContentResponse>(`/creative/content/${contentId}/variations`, request);
      
      return response || null;
    } catch (error) {
      console.error('创建内容变体失败:', error);
      return null;
    }
  }
};

export default creativeService; 