// 附件上传类型
export interface AttachmentUpload {
  uri: string;
  type: string;
  name: string;
}

// 图像风格类型
export interface ImageStyle {
  id: string;
  name: string;
  description: string;
  preview_url: string;
}

// 图像生成请求
export interface ImageGenerationRequest {
  prompt: string;
  style?: string;
  options?: {
    size?: string;
    model?: string;
    quality?: string;
  };
}

// 图像生成响应
export interface ImageGenerationResponse {
  image_id: string;
  image_url: string;
  prompt: string;
  style?: string;
  created_at: string;
}

// 图像编辑请求
export interface ImageEditRequest {
  image_file: any; // 文件对象
  prompt: string;
  edit_type: string;
}

// 图像风格迁移请求
export interface ImageStyleTransferRequest {
  image_file: any; // 文件对象
  style: string;
}

// 图像背景移除请求
export interface ImageRemoveBackgroundRequest {
  image_file: any; // 文件对象
} 