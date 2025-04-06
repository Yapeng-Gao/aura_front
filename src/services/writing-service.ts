import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@env';
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

// 定义API端点
const API_ENDPOINTS = {
  TEMPLATES: '/writing/templates',
  GENERATE: '/writing/generate',
  POLISH: '/writing/polish',
  GRAMMAR_CHECK: '/writing/grammar-check',
  SUGGESTIONS: '/writing/suggestions',
  DOCUMENTS: '/writing/documents',
  RECENT_DOCUMENTS: '/writing/documents/recent',
  DOCUMENT: (id: string) => `/writing/documents/${id}`,
  DOCUMENT_VERSIONS: (id: string) => `/writing/documents/${id}/versions`,
  RESTORE_VERSION: (docId: string, versionId: string) => 
    `/writing/documents/${docId}/versions/${versionId}/restore`,
  EXPORT_PDF: (id: string) => `/writing/documents/${id}/export/pdf`,
  EXPORT_TEXT: (id: string) => `/writing/documents/${id}/export/text`,
  STATISTICS: '/writing/statistics',
};

// 缓存键
const TEMPLATES_CACHE_KEY = 'writing_templates_cache';
const RECENT_DOCS_CACHE_KEY = 'writing_recent_docs';
const DOCUMENT_CACHE_PREFIX = 'writing_doc_';

// 添加新的接口类型
interface WriteSuggestionsResponse {
  suggestions: string[];
}

// 写作助手API服务
const writingService = {
  // 获取写作模板
  getTemplates: async (): Promise<WritingTemplate[]> => {
    try {
      // 首先尝试从缓存加载
      const cachedData = await AsyncStorage.getItem(TEMPLATES_CACHE_KEY);
      
      // 从服务器获取最新数据
      const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.TEMPLATES}`);
      if (response.status === 200) {
        const templates = response.data;
        // 更新缓存
        await AsyncStorage.setItem(TEMPLATES_CACHE_KEY, JSON.stringify(templates));
        return templates;
      }
      
      // 如果服务器请求失败但有缓存，返回缓存数据
      if (cachedData) {
        return JSON.parse(cachedData);
      }
      
      throw new Error('无法获取模板数据');
    } catch (error) {
      // 如果发生错误且有缓存，返回缓存数据
      const cachedData = await AsyncStorage.getItem(TEMPLATES_CACHE_KEY);
      if (cachedData) {
        return JSON.parse(cachedData);
      }
      throw error;
    }
  },
  
  // 生成文本
  generateText: async (
    text: string, 
    templateId: string, 
    options?: { 
      style?: string; 
      length?: string; 
      tone?: string;
      language?: string; // 添加语言选项
    }
  ): Promise<WriteGenerationResponse> => {
    const requestData: WriteGenerationRequest = {
      text,
      template_id: templateId,
      ...options
    };
    
    const response = await axios.post(
      `${API_BASE_URL}${API_ENDPOINTS.GENERATE}`, 
      requestData
    );
    
    return response.data;
  },
  
  // 润色文本
  polishText: async (
    text: string, 
    options?: { 
      style?: string;
      language?: string; // 添加语言选项
    }
  ): Promise<WritePolishResponse> => {
    const requestData: WritePolishRequest = {
      text,
      ...options
    };
    
    const response = await axios.post(
      `${API_BASE_URL}${API_ENDPOINTS.POLISH}`, 
      requestData
    );
    
    return response.data;
  },
  
  // 语法检查
  checkGrammar: async (
    text: string,
    language?: string // 添加语言选项
  ): Promise<WriteGrammarCheckResponse> => {
    const requestData: WriteGrammarCheckRequest = {
      text,
      language
    };
    
    const response = await axios.post(
      `${API_BASE_URL}${API_ENDPOINTS.GRAMMAR_CHECK}`, 
      requestData
    );
    
    return response.data;
  },
  
  // 获取智能建议
  getSuggestions: async (
    text: string,
    language: string = 'zh'
  ): Promise<WriteSuggestionsResponse> => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}${API_ENDPOINTS.SUGGESTIONS}`,
        { text, language }
      );
      
      return response.data;
    } catch (error) {
      console.error('获取建议失败:', error);
      // 返回空建议列表
      return { suggestions: [] };
    }
  },
  
  // 获取最近的文档
  getRecentDocuments: async (): Promise<WritingDocument[]> => {
    try {
      // 从服务器获取数据
      const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.RECENT_DOCUMENTS}`);
      if (response.status === 200) {
        const documents = response.data;
        // 更新缓存
        await AsyncStorage.setItem(RECENT_DOCS_CACHE_KEY, JSON.stringify(documents));
        return documents;
      }
      
      // 如果服务器请求失败，尝试从缓存加载
      const cachedData = await AsyncStorage.getItem(RECENT_DOCS_CACHE_KEY);
      if (cachedData) {
        return JSON.parse(cachedData);
      }
      
      return [];
    } catch (error) {
      // 如果发生错误，尝试从缓存加载
      const cachedData = await AsyncStorage.getItem(RECENT_DOCS_CACHE_KEY);
      if (cachedData) {
        return JSON.parse(cachedData);
      }
      return [];
    }
  },
  
  // 获取单个文档
  getDocument: async (documentId: string): Promise<WritingDocument> => {
    try {
      const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.DOCUMENT(documentId)}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // 保存文档
  saveDocument: async (document: WritingDocumentRequest): Promise<WritingDocument> => {
    try {
      const response = await axios.post(`${API_BASE_URL}${API_ENDPOINTS.DOCUMENTS}`, document);
      
      // 更新缓存的最近文档
      const cachedDocs = await AsyncStorage.getItem(RECENT_DOCS_CACHE_KEY);
      if (cachedDocs) {
        const docs: WritingDocument[] = JSON.parse(cachedDocs);
        docs.unshift(response.data);
        // 只保留最近10个文档
        const updatedDocs = docs.slice(0, 10);
        await AsyncStorage.setItem(RECENT_DOCS_CACHE_KEY, JSON.stringify(updatedDocs));
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // 更新文档
  updateDocument: async (
    documentId: string, 
    document: WritingDocumentRequest
  ): Promise<WritingDocument> => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}${API_ENDPOINTS.DOCUMENT(documentId)}`, 
        document
      );
      
      // 更新缓存的最近文档
      const cachedDocs = await AsyncStorage.getItem(RECENT_DOCS_CACHE_KEY);
      if (cachedDocs) {
        const docs: WritingDocument[] = JSON.parse(cachedDocs);
        const updatedDocs = docs.map(doc => 
          doc.id === documentId ? {...doc, ...response.data} : doc
        );
        await AsyncStorage.setItem(RECENT_DOCS_CACHE_KEY, JSON.stringify(updatedDocs));
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // 删除文档
  deleteDocument: async (documentId: string): Promise<void> => {
    try {
      await axios.delete(`${API_BASE_URL}${API_ENDPOINTS.DOCUMENT(documentId)}`);
      
      // 更新缓存的最近文档
      const cachedDocs = await AsyncStorage.getItem(RECENT_DOCS_CACHE_KEY);
      if (cachedDocs) {
        const docs: WritingDocument[] = JSON.parse(cachedDocs);
        const updatedDocs = docs.filter(doc => doc.id !== documentId);
        await AsyncStorage.setItem(RECENT_DOCS_CACHE_KEY, JSON.stringify(updatedDocs));
      }
    } catch (error) {
      throw error;
    }
  },
  
  // 获取文档版本
  getDocumentVersions: async (documentId: string): Promise<any[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.DOCUMENT_VERSIONS(documentId)}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // 恢复文档版本
  restoreDocumentVersion: async (documentId: string, versionId: string): Promise<WritingDocument> => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}${API_ENDPOINTS.RESTORE_VERSION(documentId, versionId)}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // 导出文档为PDF
  exportToPdf: async (documentId: string): Promise<string> => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}${API_ENDPOINTS.EXPORT_PDF(documentId)}`,
        { responseType: 'blob' }
      );
      
      // 返回Blob URL供下载
      return URL.createObjectURL(response.data);
    } catch (error) {
      throw error;
    }
  },
  
  // 导出文档为文本
  exportToText: async (documentId: string): Promise<string> => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}${API_ENDPOINTS.EXPORT_TEXT(documentId)}`,
        { responseType: 'text' }
      );
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // 获取用户统计
  getUserStatistics: async (): Promise<any> => {
    try {
      const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.STATISTICS}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default writingService; 