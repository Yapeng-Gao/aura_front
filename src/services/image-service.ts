import { apiClient } from './api';
import {
  ImageStyle,
  ImageGenerationRequest,
  ImageGenerationResponse,
  ImageEditRequest,
  ImageStyleTransferRequest,
  ImageRemoveBackgroundRequest
} from '../types/assistant';

// 为服务扩展的接口
interface ExtendedImageEditRequest extends ImageEditRequest {
  imageFile?: File;
  imageBase64?: string;
  style?: string;
  size?: string;
}

interface ExtendedImageStyleTransferRequest extends ImageStyleTransferRequest {
  imageFile?: File;
  imageBase64?: string;
  strength: number;
}

interface ExtendedImageRemoveBackgroundRequest extends ImageRemoveBackgroundRequest {
  imageFile?: File;
  imageBase64?: string;
}

/**
 * 图像助手服务
 * 处理图像生成、编辑、风格转换等功能
 */
const imageService = {
  /**
   * 获取可用的图像风格
   */
  getAvailableStyles: async (): Promise<ImageStyle[]> => {
    try {
      const response = await apiClient.get<ImageStyle[]>('/assistant/image/styles');
      return response || [];
    } catch (error) {
      console.error('获取图像风格失败:', error);
      return [];
    }
  },

  /**
   * 根据文本描述生成图像
   * @param request 图像生成请求
   */
  generateImage: async (request: ImageGenerationRequest): Promise<ImageGenerationResponse | null> => {
    try {
      const response = await apiClient.post<ImageGenerationResponse>('/assistant/image/generate', request);
      return response || null;
    } catch (error) {
      console.error('生成图像失败:', error);
      return null;
    }
  },

  /**
   * 编辑图像
   * @param request 图像编辑请求
   */
  editImage: async (request: ExtendedImageEditRequest): Promise<ImageGenerationResponse | null> => {
    try {
      // 创建FormData对象用于上传图片
      const formData = new FormData();
      
      // 添加图片文件或base64
      if (request.imageFile) {
        formData.append('image', request.imageFile);
      } else if (request.imageBase64) {
        formData.append('imageBase64', request.imageBase64);
      } else if (request.image instanceof File) {
        formData.append('image', request.image);
      }
      
      // 添加其他参数
      formData.append('prompt', request.prompt);
      if (request.mask instanceof File) {
        formData.append('mask', request.mask);
      }
      if (request.style) {
        formData.append('style', request.style);
      }
      if (request.size) {
        formData.append('size', request.size);
      } else if (request.options?.size) {
        formData.append('size', request.options.size);
      }
      
      const response = await apiClient.post<ImageGenerationResponse>('/assistant/image/edit', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response || null;
    } catch (error) {
      console.error('编辑图像失败:', error);
      return null;
    }
  },

  /**
   * 图像风格转换
   * @param request 风格转换请求
   */
  transferStyle: async (request: ExtendedImageStyleTransferRequest): Promise<ImageGenerationResponse | null> => {
    try {
      // 创建FormData对象用于上传图片
      const formData = new FormData();
      
      // 添加图片文件或base64
      if (request.imageFile) {
        formData.append('image', request.imageFile);
      } else if (request.imageBase64) {
        formData.append('imageBase64', request.imageBase64);
      } else if (request.image instanceof File) {
        formData.append('image', request.image);
      }
      
      // 添加风格参数
      formData.append('style', request.style);
      
      // 添加可选参数
      if (request.strength) {
        formData.append('strength', request.strength.toString());
      }
      
      const response = await apiClient.post<ImageGenerationResponse>('/assistant/image/style-transfer', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response || null;
    } catch (error) {
      console.error('风格转换失败:', error);
      return null;
    }
  },

  /**
   * 移除图像背景
   * @param request 移除背景请求
   */
  removeBackground: async (request: ExtendedImageRemoveBackgroundRequest): Promise<ImageGenerationResponse | null> => {
    try {
      // 创建FormData对象用于上传图片
      const formData = new FormData();
      
      // 添加图片文件或base64
      if (request.imageFile) {
        formData.append('image', request.imageFile);
      } else if (request.imageBase64) {
        formData.append('imageBase64', request.imageBase64);
      } else if (request.image instanceof File) {
        formData.append('image', request.image);
      }
      
      const response = await apiClient.post<ImageGenerationResponse>('/assistant/image/remove-background', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response || null;
    } catch (error) {
      console.error('移除背景失败:', error);
      return null;
    }
  },

  /**
   * 图像上色
   * @param imageFile 图像文件或base64
   */
  colorizeImage: async (imageFile: File | string): Promise<ImageGenerationResponse | null> => {
    try {
      // 创建FormData对象用于上传图片
      const formData = new FormData();
      
      // 添加图片文件或base64
      if (typeof imageFile === 'string') {
        formData.append('imageBase64', imageFile);
      } else {
        formData.append('image', imageFile);
      }
      
      const response = await apiClient.post<ImageGenerationResponse>('/assistant/image/colorize', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response || null;
    } catch (error) {
      console.error('图像上色失败:', error);
      return null;
    }
  },

  /**
   * 增强图像质量
   * @param imageFile 图像文件或base64
   * @param scale 放大倍数
   */
  enhanceImage: async (imageFile: File | string, scale: number = 2): Promise<ImageGenerationResponse | null> => {
    try {
      // 创建FormData对象用于上传图片
      const formData = new FormData();
      
      // 添加图片文件或base64
      if (typeof imageFile === 'string') {
        formData.append('imageBase64', imageFile);
      } else {
        formData.append('image', imageFile);
      }
      
      // 添加放大倍数
      formData.append('scale', scale.toString());
      
      const response = await apiClient.post<ImageGenerationResponse>('/assistant/image/enhance', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response || null;
    } catch (error) {
      console.error('增强图像质量失败:', error);
      return null;
    }
  },

  /**
   * 保存生成的图像
   * @param imageUrl 图像URL
   * @param title 图像标题
   */
  saveGeneratedImage: async (imageUrl: string, title: string): Promise<{ id: string } | null> => {
    try {
      const response = await apiClient.post<{ id: string }>('/assistant/image/save', {
        imageUrl,
        title
      });
      
      return response || null;
    } catch (error) {
      console.error('保存图像失败:', error);
      return null;
    }
  },

  /**
   * 获取用户保存的图像
   * @param limit 限制返回的记录数
   * @param offset 分页偏移量
   */
  getSavedImages: async (limit: number = 20, offset: number = 0): Promise<Array<{ id: string; url: string; title: string; createdAt: string }> | null> => {
    try {
      const response = await apiClient.get<Array<{ id: string; url: string; title: string; createdAt: string }>>(
        `/assistant/image/saved?limit=${limit}&offset=${offset}`
      );
      
      return response || null;
    } catch (error) {
      console.error('获取保存的图像失败:', error);
      return null;
    }
  },

  /**
   * 删除保存的图像
   * @param imageId 图像ID
   */
  deleteSavedImage: async (imageId: string): Promise<boolean> => {
    try {
      await apiClient.delete(`/assistant/image/saved/${imageId}`);
      return true;
    } catch (error) {
      console.error('删除图像失败:', error);
      return false;
    }
  }
};

export default imageService; 