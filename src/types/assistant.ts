import { UUID } from './common';

// 消息类型
export interface Message {
  id: string;
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
  conversation_id: string;
  metadata?: Record<string, any>;
}

// AI消息响应
export interface SendMessageResponse {
  message_id: string;
  content: {
    type: string;
    text: string;
  };
  created_at: string;
}

// 获取对话请求
export interface GetConversationRequest {
  conversation_id: string;
}

// 获取对话响应
export interface GetConversationResponse {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  messages: {
    message_id: string;
    sender: 'user' | 'assistant';
    content: {
      type: string;
      text: string;
      attachment_url?: string;
    };
    created_at: string;
  }[];
}

// 获取所有对话响应
export interface GetConversationsResponse {
  conversations: {
    id: string;
    title: string;
    preview: string;
    created_at: string;
    updated_at: string;
    message_count: number;
  }[];
}

// 更新助手设置请求
export interface UpdateAssistantSettingsRequest {
  assistant_name?: string;
  avatar?: string;
  voice?: string;
  personality?: 'friendly' | 'professional' | 'humorous' | 'balanced';
  response_style?: 'concise' | 'detailed' | 'casual' | 'formal';
  specialties?: string;
}

// 更新助手设置响应
export interface UpdateAssistantSettingsResponse {
  assistant_name: string;
  avatar: string;
  voice: string;
  personality: 'friendly' | 'professional' | 'humorous' | 'balanced';
  response_style: 'concise' | 'detailed' | 'casual' | 'formal';
  specialties?: string;
  updated_at: string;
}

// 上传附件响应
export interface UploadAttachmentResponse {
  attachment_id: string;
  url: string;
  filename: string;
  mime_type: string;
  size: number;
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
  runtime_info?: {
    time_complexity: string;
    space_complexity: string;
    dependencies: string[];
  };
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
  test_framework?: string;
}

export interface CodeExplainRequest {
  language: string;
  code: string;
}

// 写作助手相关类型
export interface WritingTemplate {
  id: string;
  name: string;
  description: string;
}

export interface WriteGenerationRequest {
  template_id?: string;
  prompt: string;
  options?: {
    style?: 'formal' | 'casual' | 'persuasive' | 'informative' | 'friendly' | 'professional' | 'concise' | 'detailed' | 'humorous' | 'serious';
    length?: 'short' | 'medium' | 'long';
    tone?: string;
  };
}

export interface WriteGenerationResponse {
  text: string;
  template_id?: string;
  statistics: {
    word_count: number;
    paragraph_count: number;
    char_count: number;
  };
  created_at: string;
}

export interface WritePolishRequest {
  text: string;
  goal: 'improve' | 'shorten' | 'expand' | 'simplify' | 'formalize';
  style?: string;
}

export interface WriteGrammarCheckRequest {
  text: string;
}

export interface WriteGrammarCheckResponse {
  original_text: string;
  corrected_text: string;
  has_errors: boolean;
  error_count: number;
  corrections: {
    original: string;
    corrected: string;
    reason: string;
  }[];
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
export interface MeetingParticipant {
  user_id: string;
  name: string;
  email: string;
  role: string;
}

export interface MeetingRequest {
  title: string;
  start_time: string;
  duration_minutes: number;
  participants: MeetingParticipant[];
  description?: string;
  location?: string;
  meeting_type?: string;
}

export interface MeetingResponse {
  meeting_id: string;
  title: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  creator_id: string;
  participants: MeetingParticipant[];
  description?: string;
  location?: string;
  meeting_type?: string;
  created_at: string;
  updated_at: string;
}

export interface MeetingNotesRequest {
  meeting_id: string;
  audio?: File;
  transcript?: string;
}

export interface MeetingNoteResponse {
  notes_id: string;
  meeting_id: string;
  title: string;
  content: string;
  key_points: string[];
  action_items: string[];
  created_by: string;
  created_at: string;
}

export interface MeetingSummaryResponse {
  summary_id: string;
  meeting_id: string;
  title: string;
  content: string;
  created_by: string;
  created_at: string;
}

export interface MeetingUpdateRequest {
  meeting_id: string;
  updates: Partial<MeetingRequest>;
} 