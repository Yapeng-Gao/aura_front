import { apiClient } from './api';
import {
  MeetingRequest,
  MeetingResponse,
  MeetingNoteResponse,
  MeetingSummaryResponse,
  MeetingNotesRequest
} from '../types/assistant';

/**
 * 会议助手服务
 * 处理会议笔记、总结和记录等功能
 */
const meetingService = {
  /**
   * 创建会议
   * @param request 会议创建请求
   */
  createMeeting: async (request: MeetingRequest): Promise<MeetingResponse | null> => {
    try {
      const response = await apiClient.post<MeetingResponse>('/assistant/meeting/create', request);
      return response || null;
    } catch (error) {
      console.error('创建会议失败:', error);
      return null;
    }
  },

  /**
   * 获取会议信息
   * @param meetingId 会议ID
   */
  getMeeting: async (meetingId: string): Promise<MeetingResponse | null> => {
    try {
      const response = await apiClient.get<MeetingResponse>(`/assistant/meeting/${meetingId}`);
      return response || null;
    } catch (error) {
      console.error(`获取会议(${meetingId})失败:`, error);
      return null;
    }
  },

  /**
   * 获取用户的所有会议
   * @param limit 限制返回的记录数
   * @param offset 分页偏移量
   */
  getMeetings: async (limit: number = 20, offset: number = 0): Promise<Array<MeetingResponse> | null> => {
    try {
      const response = await apiClient.get<Array<MeetingResponse>>(
        `/assistant/meeting?limit=${limit}&offset=${offset}`
      );
      return response || null;
    } catch (error) {
      console.error('获取会议列表失败:', error);
      return null;
    }
  },

  /**
   * 更新会议信息
   * @param meetingId 会议ID
   * @param request 会议更新请求
   */
  updateMeeting: async (meetingId: string, request: Partial<MeetingRequest>): Promise<MeetingResponse | null> => {
    try {
      const response = await apiClient.put<MeetingResponse>(`/assistant/meeting/${meetingId}`, request);
      return response || null;
    } catch (error) {
      console.error(`更新会议(${meetingId})失败:`, error);
      return null;
    }
  },

  /**
   * 删除会议
   * @param meetingId 会议ID
   */
  deleteMeeting: async (meetingId: string): Promise<boolean> => {
    try {
      await apiClient.delete(`/assistant/meeting/${meetingId}`);
      return true;
    } catch (error) {
      console.error(`删除会议(${meetingId})失败:`, error);
      return false;
    }
  },

  /**
   * 创建会议笔记
   * @param meetingId 会议ID
   * @param request 笔记创建请求
   */
  createMeetingNotes: async (meetingId: string, request: MeetingNotesRequest): Promise<MeetingNoteResponse | null> => {
    try {
      const response = await apiClient.post<MeetingNoteResponse>(`/assistant/meeting/${meetingId}/notes`, request);
      return response || null;
    } catch (error) {
      console.error(`创建会议笔记失败:`, error);
      return null;
    }
  },

  /**
   * 获取会议笔记
   * @param meetingId 会议ID
   * @param noteId 笔记ID
   */
  getMeetingNote: async (meetingId: string, noteId: string): Promise<MeetingNoteResponse | null> => {
    try {
      const response = await apiClient.get<MeetingNoteResponse>(`/assistant/meeting/${meetingId}/notes/${noteId}`);
      return response || null;
    } catch (error) {
      console.error(`获取会议笔记失败:`, error);
      return null;
    }
  },

  /**
   * 获取会议的所有笔记
   * @param meetingId 会议ID
   */
  getMeetingNotes: async (meetingId: string): Promise<Array<MeetingNoteResponse> | null> => {
    try {
      const response = await apiClient.get<Array<MeetingNoteResponse>>(`/assistant/meeting/${meetingId}/notes`);
      return response || null;
    } catch (error) {
      console.error(`获取会议笔记列表失败:`, error);
      return null;
    }
  },

  /**
   * 更新会议笔记
   * @param meetingId 会议ID
   * @param noteId 笔记ID
   * @param request 笔记更新请求
   */
  updateMeetingNote: async (
    meetingId: string, 
    noteId: string, 
    request: Partial<MeetingNotesRequest>
  ): Promise<MeetingNoteResponse | null> => {
    try {
      const response = await apiClient.put<MeetingNoteResponse>(
        `/assistant/meeting/${meetingId}/notes/${noteId}`, 
        request
      );
      return response || null;
    } catch (error) {
      console.error(`更新会议笔记失败:`, error);
      return null;
    }
  },

  /**
   * 删除会议笔记
   * @param meetingId 会议ID
   * @param noteId 笔记ID
   */
  deleteMeetingNote: async (meetingId: string, noteId: string): Promise<boolean> => {
    try {
      await apiClient.delete(`/assistant/meeting/${meetingId}/notes/${noteId}`);
      return true;
    } catch (error) {
      console.error(`删除会议笔记失败:`, error);
      return false;
    }
  },

  /**
   * 获取会议总结
   * @param meetingId 会议ID
   */
  getMeetingSummary: async (meetingId: string): Promise<MeetingSummaryResponse | null> => {
    try {
      const response = await apiClient.get<MeetingSummaryResponse>(`/assistant/meeting/${meetingId}/summary`);
      return response || null;
    } catch (error) {
      console.error(`获取会议总结失败:`, error);
      return null;
    }
  },

  /**
   * 生成会议总结
   * @param meetingId 会议ID
   */
  generateMeetingSummary: async (meetingId: string): Promise<MeetingSummaryResponse | null> => {
    try {
      const response = await apiClient.post<MeetingSummaryResponse>(`/assistant/meeting/${meetingId}/summary/generate`);
      return response || null;
    } catch (error) {
      console.error(`生成会议总结失败:`, error);
      return null;
    }
  },

  /**
   * 从音频转录会议内容
   * @param meetingId 会议ID
   * @param audioFile 音频文件
   */
  transcribeMeetingAudio: async (meetingId: string, audioFile: File | Blob): Promise<boolean> => {
    try {
      // 创建FormData对象用于上传音频
      const formData = new FormData();
      formData.append('audio_file', audioFile);
      
      await apiClient.post(`/assistant/meeting/${meetingId}/transcribe`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return true;
    } catch (error) {
      console.error(`会议音频转录失败:`, error);
      return false;
    }
  }
};

export default meetingService; 