import { apiClient } from './api';
import {
  Voice,
  VoiceTranscriptionRequest,
  VoiceTranscriptionResponse,
  VoiceGenerationRequest,
  VoiceGenerationResponse,
  VoiceTranslateRequest,
  VoiceTranslateResponse
} from '../types/assistant';

/**
 * 语音助手服务
 * 处理语音转录、生成和翻译等功能
 */
const voiceService = {
  /**
   * 获取可用的语音列表
   */
  getVoices: async (): Promise<Voice[]> => {
    try {
      const response = await apiClient.get<Voice[]>('/assistant/voice/voices');
      return response || [];
    } catch (error) {
      console.error('获取语音列表失败:', error);
      return [];
    }
  },

  /**
   * 语音转文本
   * @param audioFile 音频文件
   * @param options 转录选项
   */
  transcribeAudio: async (
    audioFile: File | Blob, 
    options?: { language?: string }
  ): Promise<VoiceTranscriptionResponse | null> => {
    try {
      // 创建FormData对象用于上传音频
      const formData = new FormData();
      formData.append('audio_file', audioFile);
      
      if (options?.language) {
        formData.append('language', options.language);
      }
      
      const response = await apiClient.post<VoiceTranscriptionResponse>(
        '/assistant/voice/transcribe',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      return response || null;
    } catch (error) {
      console.error('语音转文本失败:', error);
      return null;
    }
  },

  /**
   * 文本转语音
   * @param text 要转换为语音的文本
   * @param voiceId 语音ID
   * @param options 生成选项
   */
  generateSpeech: async (
    text: string,
    voiceId: string,
    options?: { 
      speed?: number; 
      pitch?: number;
      format?: 'mp3' | 'wav' | 'ogg';
      emotion?: 'neutral' | 'happy' | 'sad' | 'excited' | 'angry';
    }
  ): Promise<VoiceGenerationResponse | null> => {
    try {
      const request: VoiceGenerationRequest = {
        text,
        voice_id: voiceId,
        options
      };
      
      const response = await apiClient.post<VoiceGenerationResponse>(
        '/assistant/voice/generate',
        request
      );
      
      return response || null;
    } catch (error) {
      console.error('文本转语音失败:', error);
      return null;
    }
  },

  /**
   * 语音翻译
   * @param audioFile 音频文件
   * @param targetLanguage 目标语言
   * @param options 翻译选项
   */
  translateAudio: async (
    audioFile: File | Blob,
    targetLanguage: string,
    options?: { 
      sourceLanguage?: string;
      voiceId?: string;
      outputFormat?: 'mp3' | 'wav' | 'ogg';
    }
  ): Promise<VoiceTranslateResponse | null> => {
    try {
      // 创建FormData对象用于上传音频
      const formData = new FormData();
      formData.append('audio_file', audioFile);
      formData.append('target_language', targetLanguage);
      
      if (options?.sourceLanguage) {
        formData.append('source_language', options.sourceLanguage);
      }
      
      if (options?.voiceId) {
        formData.append('voice_id', options.voiceId);
      }
      
      if (options?.outputFormat) {
        formData.append('output_format', options.outputFormat);
      }
      
      const response = await apiClient.post<VoiceTranslateResponse>(
        '/assistant/voice/translate',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      return response || null;
    } catch (error) {
      console.error('语音翻译失败:', error);
      return null;
    }
  },

  /**
   * 获取用户的语音历史记录
   * @param limit 限制返回的记录数
   * @param offset 分页偏移量
   */
  getVoiceHistory: async (
    limit: number = 20, 
    offset: number = 0
  ): Promise<Array<{ 
    id: string; 
    type: 'transcription' | 'generation' | 'translation';
    text?: string;
    audioUrl?: string;
    createdAt: string;
  }> | null> => {
    try {
      const response = await apiClient.get<Array<{ 
        id: string; 
        type: 'transcription' | 'generation' | 'translation';
        text?: string;
        audioUrl?: string;
        createdAt: string;
      }>>(`/assistant/voice/history?limit=${limit}&offset=${offset}`);
      
      return response || null;
    } catch (error) {
      console.error('获取语音历史记录失败:', error);
      return null;
    }
  }
};

export default voiceService; 