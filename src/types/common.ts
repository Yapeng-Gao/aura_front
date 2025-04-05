/**
 * 通用类型定义
 */

/**
 * UUID类型
 */
export type UUID = string;

/**
 * 分页响应接口
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  current_page: number;
  page_size: number;
  total_pages: number;
}

/**
 * API响应接口
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: AppError;
}

/**
 * 时间范围接口
 */
export interface TimeRange {
  start_date: string;
  end_date: string;
}

/**
 * 排序选项接口
 */
export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

/**
 * 应用错误接口
 */
export interface AppError {
  code: string;
  message: string;
  details?: any;
} 