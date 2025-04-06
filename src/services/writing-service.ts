import { apiClient } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  WritingTemplate,
  WriteGenerationRequest,
  WriteGenerationResponse,
  WritePolishRequest,
  WritePolishResponse,
  WriteGrammarCheckRequest,
  WriteGrammarCheckResponse,
  WritingDocument,
  WritingDocumentRequest,
  WritingDocumentVersion,
  WritingStatistics
} from '../types/assistant';

// 缓存键
const TEMPLATES_CACHE_KEY = 'writing_templates_cache';
const RECENT_DOCS_CACHE_KEY = 'writing_recent_docs';
const DOCUMENT_CACHE_PREFIX = 'writing_doc_';

// 写作助手API服务
const writingService = {
  // 获取写作模板
  getTemplates: async (): Promise<WritingTemplate[]> => {
    try {
      // 首先尝试从缓存获取
      const cachedData = await AsyncStorage.getItem(TEMPLATES_CACHE_KEY);
      
      // 即使有缓存，也发起网络请求以更新缓存
      const fetchPromise = apiClient.get<WritingTemplate[]>('/assistant/writing/templates');
      
      if (cachedData) {
        // 如果有缓存，立即返回缓存并在后台更新
        const parsed = JSON.parse(cachedData);
        
        // 后台更新缓存
        fetchPromise
          .then(data => {
            if (data) {
              AsyncStorage.setItem(TEMPLATES_CACHE_KEY, JSON.stringify(data));
            }
          })
          .catch(err => console.error('Background template fetch failed:', err));
        
        return parsed;
      }
      
      // 如果没有缓存，等待网络请求
      const data = await fetchPromise;
      if (data) {
        // 保存到缓存
        await AsyncStorage.setItem(TEMPLATES_CACHE_KEY, JSON.stringify(data));
        return data;
      }
      
      // 如果请求失败且没有缓存，返回空数组
      return [];
    } catch (error) {
      console.error('Failed to fetch writing templates:', error);
      // 如果请求失败，尝试从缓存获取
      const cachedData = await AsyncStorage.getItem(TEMPLATES_CACHE_KEY);
      if (cachedData) {
        return JSON.parse(cachedData);
      }
      return [];
    }
  },
  
  // 生成文本
  generateText: async (
    prompt: string, 
    templateId?: string, 
    options?: { style?: string; length?: string; tone?: string; language?: string }
  ): Promise<WriteGenerationResponse> => {
    try {
      const request: WriteGenerationRequest = {
        text: prompt,
        template_id: templateId,
        options
      };
      
      const response = await apiClient.post<WriteGenerationResponse>(
        '/assistant/writing/generate', 
        request
      );
      
      if (!response) {
        throw new Error('No response from API');
      }
      
      return response;
    } catch (error) {
      console.error('Text generation failed:', error);
      throw error;
    }
  },
  
  // 润色文本
  polishText: async (
    text: string, 
    options?: { goal?: string; style?: string; language?: string }
  ): Promise<WritePolishResponse> => {
    try {
      const request: WritePolishRequest = {
        text,
        ...options
      };
      
      const response = await apiClient.post<WritePolishResponse>(
        '/assistant/writing/polish', 
        request
      );
      
      if (!response) {
        throw new Error('No response from API');
      }
      
      return response;
    } catch (error) {
      console.error('Text polishing failed:', error);
      throw error;
    }
  },
  
  // 语法检查
  checkGrammar: async (
    text: string, 
    language?: string
  ): Promise<WriteGrammarCheckResponse> => {
    try {
      const request: WriteGrammarCheckRequest = {
        text,
        language
      };
      
      const response = await apiClient.post<WriteGrammarCheckResponse>(
        '/assistant/writing/grammar', 
        request
      );
      
      if (!response) {
        throw new Error('No response from API');
      }
      
      return response;
    } catch (error) {
      console.error('Grammar check failed:', error);
      throw error;
    }
  },
  
  // 获取最近的文档
  getRecentDocuments: async (): Promise<WritingDocument[]> => {
    try {
      const response = await apiClient.get<WritingDocument[]>('/assistant/writing/documents');
      
      if (response) {
        // 更新缓存
        await AsyncStorage.setItem(RECENT_DOCS_CACHE_KEY, JSON.stringify(response));
        return response;
      }
      
      // 如果请求失败，尝试从缓存获取
      const cachedData = await AsyncStorage.getItem(RECENT_DOCS_CACHE_KEY);
      if (cachedData) {
        return JSON.parse(cachedData);
      }
      
      return [];
    } catch (error) {
      console.error('Failed to fetch recent documents:', error);
      
      // 如果请求失败，尝试从缓存获取
      const cachedData = await AsyncStorage.getItem(RECENT_DOCS_CACHE_KEY);
      if (cachedData) {
        return JSON.parse(cachedData);
      }
      
      return [];
    }
  },
  
  // 获取单个文档
  getDocument: async (documentId: string): Promise<WritingDocument | null> => {
    try {
      // 首先检查缓存
      const cacheKey = `${DOCUMENT_CACHE_PREFIX}${documentId}`;
      const cachedData = await AsyncStorage.getItem(cacheKey);
      
      // 发起网络请求以确保获取最新数据
      const fetchPromise = apiClient.get<WritingDocument>(`/assistant/writing/documents/${documentId}`);
      
      if (cachedData) {
        // 如果有缓存，立即返回缓存并在后台更新
        const parsed = JSON.parse(cachedData);
        
        // 后台更新缓存
        fetchPromise
          .then(data => {
            if (data) {
              AsyncStorage.setItem(cacheKey, JSON.stringify(data));
            }
          })
          .catch(err => console.error(`Background document fetch failed for ${documentId}:`, err));
        
        return parsed;
      }
      
      // 如果没有缓存，等待网络请求
      const data = await fetchPromise;
      if (data) {
        // 保存到缓存
        await AsyncStorage.setItem(cacheKey, JSON.stringify(data));
        return data;
      }
      
      return null;
    } catch (error) {
      console.error(`Failed to fetch document ${documentId}:`, error);
      
      // 如果请求失败，尝试从缓存获取
      const cacheKey = `${DOCUMENT_CACHE_PREFIX}${documentId}`;
      const cachedData = await AsyncStorage.getItem(cacheKey);
      if (cachedData) {
        return JSON.parse(cachedData);
      }
      
      return null;
    }
  },
  
  // 保存新文档
  saveDocument: async (document: WritingDocumentRequest): Promise<WritingDocument | null> => {
    try {
      const response = await apiClient.post<WritingDocument>(
        '/assistant/writing/documents', 
        document
      );
      
      if (response) {
        // 更新文档缓存
        await AsyncStorage.setItem(
          `${DOCUMENT_CACHE_PREFIX}${response.id}`, 
          JSON.stringify(response)
        );
        
        // 刷新最近文档列表缓存
        await writingService.getRecentDocuments();
      }
      
      return response || null;
    } catch (error) {
      console.error('Failed to save document:', error);
      throw error;
    }
  },
  
  // 更新现有文档
  updateDocument: async (
    documentId: string, 
    updates: WritingDocumentRequest
  ): Promise<WritingDocument | null> => {
    try {
      const response = await apiClient.put<WritingDocument>(
        `/assistant/writing/documents/${documentId}`, 
        updates
      );
      
      if (response) {
        // 更新文档缓存
        await AsyncStorage.setItem(
          `${DOCUMENT_CACHE_PREFIX}${documentId}`, 
          JSON.stringify(response)
        );
        
        // 刷新最近文档列表缓存
        await writingService.getRecentDocuments();
      }
      
      return response || null;
    } catch (error) {
      console.error(`Failed to update document ${documentId}:`, error);
      throw error;
    }
  },
  
  // 删除文档
  deleteDocument: async (documentId: string): Promise<boolean> => {
    try {
      await apiClient.delete(`/assistant/writing/documents/${documentId}`);
      
      // 删除文档缓存
      await AsyncStorage.removeItem(`${DOCUMENT_CACHE_PREFIX}${documentId}`);
      
      // 刷新最近文档列表缓存
      await writingService.getRecentDocuments();
      
      return true;
    } catch (error) {
      console.error(`Failed to delete document ${documentId}:`, error);
      throw error;
    }
  },
  
  // 获取文档版本历史
  getDocumentVersions: async (documentId: string): Promise<WritingDocumentVersion[]> => {
    try {
      const response = await apiClient.get<WritingDocumentVersion[]>(
        `/assistant/writing/documents/${documentId}/versions`
      );
      
      return response || [];
    } catch (error) {
      console.error(`Failed to fetch document versions for ${documentId}:`, error);
      throw error;
    }
  },
  
  // 恢复到特定版本
  restoreDocumentVersion: async (
    documentId: string, 
    version: number
  ): Promise<WritingDocument | null> => {
    try {
      const response = await apiClient.post<WritingDocument>(
        `/assistant/writing/documents/${documentId}/restore`,
        { version }
      );
      
      if (response) {
        // 更新文档缓存
        await AsyncStorage.setItem(
          `${DOCUMENT_CACHE_PREFIX}${documentId}`, 
          JSON.stringify(response)
        );
      }
      
      return response || null;
    } catch (error) {
      console.error(`Failed to restore document ${documentId} to version ${version}:`, error);
      throw error;
    }
  },
  
  // 获取用户写作统计
  getUserStatistics: async (): Promise<WritingStatistics | null> => {
    try {
      const response = await apiClient.get<WritingStatistics>(
        '/assistant/writing/statistics'
      );
      
      return response || null;
    } catch (error) {
      console.error('Failed to fetch user writing statistics:', error);
      throw error;
    }
  }
};

export default writingService; 