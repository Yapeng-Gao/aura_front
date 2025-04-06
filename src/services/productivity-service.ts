import { apiClient } from './api';

/**
 * 生产力服务
 * 处理笔记、待办事项等生产力工具功能
 */
const productivityService = {
  // 笔记功能
  notes: {
    /**
     * 获取所有笔记
     * @param limit 限制返回的记录数
     * @param offset 分页偏移量
     */
    getAll: async (limit: number = 20, offset: number = 0): Promise<Array<{
      id: string;
      title: string;
      content: string;
      tags: string[];
      createdAt: string;
      updatedAt: string;
    }> | null> => {
      try {
        const response = await apiClient.get<Array<{
          id: string;
          title: string;
          content: string;
          tags: string[];
          createdAt: string;
          updatedAt: string;
        }>>(`/productivity/notes?limit=${limit}&offset=${offset}`);
        
        return response || null;
      } catch (error) {
        console.error('获取笔记列表失败:', error);
        return null;
      }
    },

    /**
     * 获取特定笔记
     * @param noteId 笔记ID
     */
    getById: async (noteId: string): Promise<{
      id: string;
      title: string;
      content: string;
      tags: string[];
      createdAt: string;
      updatedAt: string;
    } | null> => {
      try {
        const response = await apiClient.get<{
          id: string;
          title: string;
          content: string;
          tags: string[];
          createdAt: string;
          updatedAt: string;
        }>(`/productivity/notes/${noteId}`);
        
        return response || null;
      } catch (error) {
        console.error(`获取笔记(${noteId})失败:`, error);
        return null;
      }
    },

    /**
     * 创建笔记
     * @param note 笔记创建请求
     */
    create: async (note: {
      title: string;
      content: string;
      tags?: string[];
    }): Promise<{
      id: string;
      title: string;
      content: string;
      tags: string[];
      createdAt: string;
      updatedAt: string;
    } | null> => {
      try {
        const response = await apiClient.post<{
          id: string;
          title: string;
          content: string;
          tags: string[];
          createdAt: string;
          updatedAt: string;
        }>('/productivity/notes', note);
        
        return response || null;
      } catch (error) {
        console.error('创建笔记失败:', error);
        return null;
      }
    },

    /**
     * 更新笔记
     * @param noteId 笔记ID
     * @param update 笔记更新请求
     */
    update: async (noteId: string, update: {
      title?: string;
      content?: string;
      tags?: string[];
    }): Promise<{
      id: string;
      title: string;
      content: string;
      tags: string[];
      createdAt: string;
      updatedAt: string;
    } | null> => {
      try {
        const response = await apiClient.put<{
          id: string;
          title: string;
          content: string;
          tags: string[];
          createdAt: string;
          updatedAt: string;
        }>(`/productivity/notes/${noteId}`, update);
        
        return response || null;
      } catch (error) {
        console.error(`更新笔记(${noteId})失败:`, error);
        return null;
      }
    },

    /**
     * 删除笔记
     * @param noteId 笔记ID
     */
    delete: async (noteId: string): Promise<boolean> => {
      try {
        await apiClient.delete(`/productivity/notes/${noteId}`);
        return true;
      } catch (error) {
        console.error(`删除笔记(${noteId})失败:`, error);
        return false;
      }
    },

    /**
     * 搜索笔记
     * @param query 搜索查询
     */
    search: async (query: string): Promise<Array<{
      id: string;
      title: string;
      content: string;
      tags: string[];
      createdAt: string;
      updatedAt: string;
    }> | null> => {
      try {
        const response = await apiClient.get<Array<{
          id: string;
          title: string;
          content: string;
          tags: string[];
          createdAt: string;
          updatedAt: string;
        }>>(`/productivity/notes/search?q=${encodeURIComponent(query)}`);
        
        return response || null;
      } catch (error) {
        console.error(`搜索笔记(${query})失败:`, error);
        return null;
      }
    }
  },

  // 待办事项功能
  tasks: {
    /**
     * 获取所有待办事项
     * @param limit 限制返回的记录数
     * @param offset 分页偏移量
     */
    getAll: async (limit: number = 20, offset: number = 0): Promise<Array<{
      id: string;
      title: string;
      description?: string;
      dueDate?: string;
      priority: 'low' | 'medium' | 'high';
      completed: boolean;
      tags: string[];
      createdAt: string;
      updatedAt: string;
    }> | null> => {
      try {
        const response = await apiClient.get<Array<{
          id: string;
          title: string;
          description?: string;
          dueDate?: string;
          priority: 'low' | 'medium' | 'high';
          completed: boolean;
          tags: string[];
          createdAt: string;
          updatedAt: string;
        }>>(`/productivity/tasks?limit=${limit}&offset=${offset}`);
        
        return response || null;
      } catch (error) {
        console.error('获取待办事项列表失败:', error);
        return null;
      }
    },

    /**
     * 获取特定待办事项
     * @param taskId 待办事项ID
     */
    getById: async (taskId: string): Promise<{
      id: string;
      title: string;
      description?: string;
      dueDate?: string;
      priority: 'low' | 'medium' | 'high';
      completed: boolean;
      tags: string[];
      createdAt: string;
      updatedAt: string;
    } | null> => {
      try {
        const response = await apiClient.get<{
          id: string;
          title: string;
          description?: string;
          dueDate?: string;
          priority: 'low' | 'medium' | 'high';
          completed: boolean;
          tags: string[];
          createdAt: string;
          updatedAt: string;
        }>(`/productivity/tasks/${taskId}`);
        
        return response || null;
      } catch (error) {
        console.error(`获取待办事项(${taskId})失败:`, error);
        return null;
      }
    },

    /**
     * 创建待办事项
     * @param task 待办事项创建请求
     */
    create: async (task: {
      title: string;
      description?: string;
      dueDate?: string;
      priority?: 'low' | 'medium' | 'high';
      tags?: string[];
    }): Promise<{
      id: string;
      title: string;
      description?: string;
      dueDate?: string;
      priority: 'low' | 'medium' | 'high';
      completed: boolean;
      tags: string[];
      createdAt: string;
      updatedAt: string;
    } | null> => {
      try {
        const response = await apiClient.post<{
          id: string;
          title: string;
          description?: string;
          dueDate?: string;
          priority: 'low' | 'medium' | 'high';
          completed: boolean;
          tags: string[];
          createdAt: string;
          updatedAt: string;
        }>('/productivity/tasks', task);
        
        return response || null;
      } catch (error) {
        console.error('创建待办事项失败:', error);
        return null;
      }
    },

    /**
     * 更新待办事项
     * @param taskId 待办事项ID
     * @param update 待办事项更新请求
     */
    update: async (taskId: string, update: {
      title?: string;
      description?: string;
      dueDate?: string;
      priority?: 'low' | 'medium' | 'high';
      completed?: boolean;
      tags?: string[];
    }): Promise<{
      id: string;
      title: string;
      description?: string;
      dueDate?: string;
      priority: 'low' | 'medium' | 'high';
      completed: boolean;
      tags: string[];
      createdAt: string;
      updatedAt: string;
    } | null> => {
      try {
        const response = await apiClient.put<{
          id: string;
          title: string;
          description?: string;
          dueDate?: string;
          priority: 'low' | 'medium' | 'high';
          completed: boolean;
          tags: string[];
          createdAt: string;
          updatedAt: string;
        }>(`/productivity/tasks/${taskId}`, update);
        
        return response || null;
      } catch (error) {
        console.error(`更新待办事项(${taskId})失败:`, error);
        return null;
      }
    },

    /**
     * 删除待办事项
     * @param taskId 待办事项ID
     */
    delete: async (taskId: string): Promise<boolean> => {
      try {
        await apiClient.delete(`/productivity/tasks/${taskId}`);
        return true;
      } catch (error) {
        console.error(`删除待办事项(${taskId})失败:`, error);
        return false;
      }
    },

    /**
     * 将待办事项标记为已完成
     * @param taskId 待办事项ID
     */
    complete: async (taskId: string): Promise<boolean> => {
      try {
        await apiClient.put(`/productivity/tasks/${taskId}/complete`);
        return true;
      } catch (error) {
        console.error(`将待办事项(${taskId})标记为已完成失败:`, error);
        return false;
      }
    },

    /**
     * 将待办事项标记为未完成
     * @param taskId 待办事项ID
     */
    uncomplete: async (taskId: string): Promise<boolean> => {
      try {
        await apiClient.put(`/productivity/tasks/${taskId}/uncomplete`);
        return true;
      } catch (error) {
        console.error(`将待办事项(${taskId})标记为未完成失败:`, error);
        return false;
      }
    }
  }
};

export default productivityService; 