import { apiClient } from './api';
import {
  CodeGenerationRequest,
  CodeGenerationResponse,
  CodeOptimizationRequest,
  CodeTestRequest,
  CodeExplainRequest,
  LanguagesResponse
} from '../types/assistant';

/**
 * 代码助手服务
 * 处理代码生成、优化、测试等功能
 */
const codeService = {
  /**
   * 获取支持的编程语言列表
   */
  getSupportedLanguages: async (): Promise<LanguagesResponse | null> => {
    try {
      const response = await apiClient.get<LanguagesResponse>('/assistant/code/languages');
      return response || null;
    } catch (error) {
      console.error('获取支持的编程语言失败:', error);
      return null;
    }
  },

  /**
   * a生成代码
   * @param request 代码生成请求
   */
  generateCode: async (request: CodeGenerationRequest): Promise<CodeGenerationResponse | null> => {
    try {
      const response = await apiClient.post<CodeGenerationResponse>('/assistant/code/generate', request);
      return response || null;
    } catch (error) {
      console.error('生成代码失败:', error);
      return null;
    }
  },

  /**
   * 优化代码
   * @param request 代码优化请求
   */
  optimizeCode: async (request: CodeOptimizationRequest): Promise<CodeGenerationResponse | null> => {
    try {
      const response = await apiClient.post<CodeGenerationResponse>('/assistant/code/optimize', request);
      return response || null;
    } catch (error) {
      console.error('优化代码失败:', error);
      return null;
    }
  },

  /**
   * 生成测试用例
   * @param request 测试生成请求
   */
  generateTests: async (request: CodeTestRequest): Promise<CodeGenerationResponse | null> => {
    try {
      const response = await apiClient.post<CodeGenerationResponse>('/assistant/code/test', request);
      return response || null;
    } catch (error) {
      console.error('生成测试用例失败:', error);
      return null;
    }
  },

  /**
   * 解释代码
   * @param request 代码解释请求
   */
  explainCode: async (request: CodeExplainRequest): Promise<{ explanation: string } | null> => {
    try {
      const response = await apiClient.post<{ explanation: string }>('/assistant/code/explain', request);
      return response || null;
    } catch (error) {
      console.error('解释代码失败:', error);
      return null;
    }
  },

  /**
   * 调试代码
   * @param request 代码调试请求
   */
  debugCode: async (request: { code: string; language: string; error?: string }): Promise<{ solution: string; explanation: string } | null> => {
    try {
      const response = await apiClient.post<{ solution: string; explanation: string }>('/assistant/code/debug', request);
      return response || null;
    } catch (error) {
      console.error('调试代码失败:', error);
      return null;
    }
  },

  /**
   * 转换代码到不同的语言
   * @param request 代码转换请求
   */
  translateCode: async (request: { code: string; fromLanguage: string; toLanguage: string; }): Promise<CodeGenerationResponse | null> => {
    try {
      const response = await apiClient.post<CodeGenerationResponse>('/assistant/code/translate', request);
      return response || null;
    } catch (error) {
      console.error('转换代码失败:', error);
      return null;
    }
  },

  /**
   * 获取代码片段
   * @param query 查询参数
   */
  getCodeSnippets: async (query: { language: string; category?: string; tags?: string[] }): Promise<Array<{ title: string; code: string; description: string; tags: string[] }> | null> => {
    try {
      const response = await apiClient.get<Array<{ title: string; code: string; description: string; tags: string[] }>>(
        `/assistant/code/snippets?language=${query.language}${query.category ? `&category=${query.category}` : ''}${query.tags ? `&tags=${query.tags.join(',')}` : ''}`
      );
      return response || null;
    } catch (error) {
      console.error('获取代码片段失败:', error);
      return null;
    }
  },

  /**
   * 保存代码片段
   * @param snippet 代码片段
   */
  saveCodeSnippet: async (snippet: { title: string; code: string; description: string; language: string; tags?: string[] }): Promise<{ id: string } | null> => {
    try {
      const response = await apiClient.post<{ id: string }>('/assistant/code/snippets', snippet);
      return response || null;
    } catch (error) {
      console.error('保存代码片段失败:', error);
      return null;
    }
  },

  /**
   * 获取代码建议
   * @param request 建议请求
   */
  getCodeSuggestions: async (request: { code: string; language: string; position: number }): Promise<Array<{ text: string; description: string }> | null> => {
    try {
      const response = await apiClient.post<Array<{ text: string; description: string }>>('/assistant/code/suggestions', request);
      return response || null;
    } catch (error) {
      console.error('获取代码建议失败:', error);
      return null;
    }
  }
};

export default codeService; 