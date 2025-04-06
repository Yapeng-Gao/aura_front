import { UUID } from './common';

// 消息类型
export interface Message {
  id: UUID;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  isProcessing?: boolean;
  attachmentType?: 'image' | 'voice' | 'file';
  attachmentUrl?: string;
}

// 对话类型
export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

// 助手设置类型
export interface AssistantSettings {
  name: string;
  avatarId: number;
  personality: 'friendly' | 'professional' | 'humorous' | 'balanced';
  responseStyle: 'concise' | 'detailed' | 'casual' | 'formal';
  specialties?: string;
}

// AI消息请求
export interface SendMessageRequest {
  message: string;
  conversation_id?: UUID;
  attachments?: string[];
}

// AI消息响应
export interface SendMessageResponse {
  message: Message;
  conversation_id: UUID;
}

// 获取对话请求
export interface GetConversationRequest {
  conversation_id: string;
}

// 获取对话响应
export interface GetConversationResponse {
  conversation_id: UUID;
  title: string;
  messages: Message[];
  created_at: string;
  updated_at: string;
}

// 获取所有对话响应
export interface GetConversationsResponse {
  conversations: Array<{
    id: UUID;
    title: string;
    last_message: string;
    created_at: string;
    updated_at: string;
  }>;
}

// 更新助手设置请求
export interface UpdateAssistantSettingsRequest {
  name?: string;
  voice?: string;
  personality?: string;
  response_style?: string;
}

// 更新助手设置响应
export interface UpdateAssistantSettingsResponse {
  name: string;
  voice: string;
  personality: string;
  response_style: string;
  updated_at: string;
}

// 上传附件响应
export interface UploadAttachmentResponse {
  attachment_id: UUID;
  file_name: string;
  file_type: string;
  file_size: number;
  upload_date: string;
}

// 代码助手相关类型
export interface CodeGenerationRequest {
  language: string;
  prompt: string;
  context?: Record<string, any>;
}

export interface CodeGenerationResponse {
  code: string;
  language: string;
  explanation?: string;
  runtime_info?: Record<string, any>;
  created_at: string;
}

export interface CodeOptimizationRequest {
  language: string;
  code: string;
  optimization_type: 'performance' | 'readability' | 'security' | 'memory';
}

export interface CodeTestRequest {
  language: string;
  code: string;
  prompt: string;
  context?: {
    test_framework?: string;
    [key: string]: any;
  };
}

export interface CodeExplainRequest {
  language: string;
  code: string;
}

export interface LanguagesResponse {
  languages: string[];
}

export interface RecentLanguagesResponse {
  languages: string[];
}

export interface FavoriteLanguagesResponse {
  languages: string[];
}

// 写作助手相关类型
export interface WritingTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
}

export interface WriteGenerationRequest {
  prompt: string;
  template_id?: string;
  options?: Record<string, any>;
}

export interface WriteGenerationResponse {
  text: string;
  template_id?: string;
  statistics: {
    word_count: number;
    character_count: number;
    sentence_count: number;
    paragraph_count: number;
  };
  created_at: string;
}

export interface WritePolishRequest {
  prompt: string;
  options: {
    goal: string;
    style?: string;
  };
}

export interface WriteGrammarCheckRequest {
  prompt: string;
}

export interface WriteGrammarCheckResponse {
  original_text: string;
  corrected_text: string;
  has_errors: boolean;
  error_count: number;
  corrections: Array<{
    original: string;
    corrected: string;
    reason: string;
  }>;
  created_at: string;
}

// 图像助手相关类型
export interface ImageStyle {
  id: string;
  name: string;
  description: string;
  preview_url: string;
}

export interface ImageGenerationRequest {
  prompt: string;
  style?: string;
  options?: {
    size?: string;
    model?: string;
    quality?: 'standard' | 'hd';
  };
}

export interface ImageGenerationResponse {
  image_id: string;
  image_url: string;
  prompt: string;
  style?: string;
  created_at: string;
}

export interface ImageEditRequest {
  image: File;
  prompt: string;
  mask?: File;
  options?: {
    size?: string;
  };
}

export interface ImageStyleTransferRequest {
  image: File;
  style: string;
  strength: number;
  options?: Record<string, any>;
}

export interface ImageRemoveBackgroundRequest {
  image: File;
  options?: Record<string, any>;
}

// 语音助手相关类型
export interface Voice {
  id: string;
  name: string;
  gender: 'male' | 'female' | 'neutral';
  description: string;
  preview_url: string;
}

export interface VoiceTranscriptionRequest {
  audio: File;
  options?: {
    language?: string;
  };
}

export interface VoiceTranscriptionResponse {
  text: string;
  language: string;
  confidence: number;
  created_at: string;
}

export interface VoiceGenerationRequest {
  text: string;
  voice_id: string;
  speed?: number;
  options?: {
    format?: 'mp3' | 'wav' | 'ogg';
  };
}

export interface VoiceGenerationResponse {
  audio_url: string;
  text: string;
  voice_id: string;
  voice_name: string;
  speed: number;
  duration: number;
  created_at: string;
}

export interface VoiceTranslateRequest {
  audio: File;
  target_language: string;
  options?: {
    voice_id?: string;
  };
}

export interface VoiceTranslateResponse {
  original_text: string;
  translated_text: string;
  source_language: string;
  target_language: string;
  audio_url: string;
  voice_id: string;
  created_at: string;
}

// 会议助手相关类型
export interface Meeting {
  id: UUID;
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  participants: string[];
  agenda?: string[];
  notes?: string;
  transcription?: string;
  summary?: string;
  action_items?: string[];
  recording_url?: string;
  created_at: string;
  updated_at: string;
}

export interface MeetingRequest {
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  participants: string[];
  agenda?: string[];
}

export interface MeetingResponse {
  meeting: Meeting;
}

export interface MeetingSummaryResponse {
  meeting_id: UUID;
  summary: string;
  key_points: string[];
  action_items: string[];
  created_at: string;
}

export interface MeetingNoteResponse {
  meeting_id: UUID;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface MeetingUpdateRequest {
  meeting_id: string;
  updates: Partial<MeetingRequest>;
} 