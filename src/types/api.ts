import { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { WritingTemplate, WriteGenerationResponse, WriteGrammarCheckResponse } from './assistant';

// 基础API响应类型
export interface ApiResponse<T = any> {
    code: number;
    message: string;
    data: T;
    timestamp: number;
}

// 分页数据响应
export interface PaginatedData<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
}

// 错误响应
export interface ApiError {
    statusCode: number;
    message: string;
    error?: string;
    timestamp?: string;
    path?: string;
}

// 认证相关类型
export interface AuthTokens {
    access_token: string;
    refresh_token: string;
    expires_in: number;
}

export interface LoginParams {
    username: string;
    password: string;
}

export interface RegisterParams extends LoginParams {
    email: string;
    phone?: string;
}

// API配置扩展
export interface ApiConfig extends AxiosRequestConfig {
    autoErrorHandling?: boolean; // 是否自动处理错误
    retry?: boolean; // 是否允许重试
}

// API服务类型
export type ApiService = {
    get: <T>(url: string, config?: ApiConfig) => Promise<T>;
    post: <T>(url: string, data?: any, config?: ApiConfig) => Promise<T>;
    put: <T>(url: string, data?: any, config?: ApiConfig) => Promise<T>;
    patch: <T>(url: string, data?: any, config?: ApiConfig) => Promise<T>;
    delete: <T>(url: string, config?: ApiConfig) => Promise<T>;
    
    // 添加写作助手API
    writing: {
        getTemplates: () => Promise<WritingTemplate[]>;
        generateText: (prompt: string, templateId?: string, options?: Record<string, any>) => Promise<WriteGenerationResponse>;
        polishText: (text: string, goal?: string, style?: string) => Promise<WriteGenerationResponse>;
        checkGrammar: (text: string) => Promise<WriteGrammarCheckResponse>;
        getHistory: () => Promise<any>;
        saveDocument: (title: string, content: string, templateId?: string) => Promise<any>;
        getDocument: (documentId: string) => Promise<any>;
        updateDocument: (documentId: string, updates: { title?: string, content?: string }) => Promise<any>;
        deleteDocument: (documentId: string) => Promise<any>;
    };
};