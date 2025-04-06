import { api } from './api';
import {
  MeetingRequest,
  MeetingResponse,
  MeetingNoteResponse,
  MeetingSummaryResponse,
  MeetingNotesRequest
} from '../types/assistant';
import { Meeting } from '../types/meeting';

export interface MeetingListResponse {
  meetings: Meeting[];
  total: number;
  page: number;
  page_size: number;
}

export interface MeetingFilters {
  status?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  page_size?: number;
}

/**
 * 会议助手服务
 * 处理会议笔记、总结和记录等功能
 */
export class MeetingService {
  private static instance: MeetingService;
  
  private constructor() {}
  
  static getInstance(): MeetingService {
    if (!MeetingService.instance) {
      MeetingService.instance = new MeetingService();
    }
    return MeetingService.instance;
  }
  
  /**
   * 创建会议
   * @param request 会议创建请求
   */
  async createMeeting(meetingData: any): Promise<Meeting> {
    const response = await api.post('/productivity/meetings/create', meetingData);
    return response.data;
  }
  
  /**
   * 获取会议信息
   * @param meetingId 会议ID
   */
  async getMeeting(meetingId: string): Promise<Meeting> {
    const response = await api.get(`/productivity/meetings/${meetingId}`);
    return response.data;
  }
  
  /**
   * 获取用户的所有会议
   * @param filters 过滤条件
   */
  async getMeetings(filters: MeetingFilters = {}): Promise<MeetingListResponse> {
    const response = await api.get('/productivity/meetings', { params: filters });
    return response.data;
  }
  
  /**
   * 更新会议信息
   * @param meetingId 会议ID
   * @param meetingData 会议更新数据
   */
  async updateMeeting(meetingId: string, meetingData: any): Promise<Meeting> {
    const response = await api.put(`/productivity/meetings/${meetingId}`, meetingData);
    return response.data;
  }
  
  /**
   * 删除会议
   * @param meetingId 会议ID
   */
  async deleteMeeting(meetingId: string): Promise<void> {
    await api.delete(`/productivity/meetings/${meetingId}`);
  }
  
  /**
   * 开始会议
   * @param meetingId 会议ID
   */
  async startMeeting(meetingId: string): Promise<Meeting> {
    const response = await api.post(`/productivity/meetings/${meetingId}/start`);
    return response.data;
  }
  
  /**
   * 结束会议
   * @param meetingId 会议ID
   */
  async endMeeting(meetingId: string): Promise<Meeting> {
    const response = await api.post(`/productivity/meetings/${meetingId}/end`);
    return response.data;
  }
  
  /**
   * 生成会议笔记
   * @param meetingId 会议ID
   * @param audioFile 音频文件
   * @param textContent 文本内容
   */
  async generateNotes(meetingId: string, audioFile?: File, textContent?: string): Promise<any> {
    const formData = new FormData();
    if (audioFile) {
      formData.append('audio_file', audioFile);
    }
    if (textContent) {
      formData.append('text_content', textContent);
    }
    
    const response = await api.post(`/productivity/meetings/${meetingId}/notes`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
  
  /**
   * 生成会议总结
   * @param meetingId 会议ID
   */
  async generateSummary(meetingId: string): Promise<any> {
    const response = await api.post(`/productivity/meetings/${meetingId}/summary`);
    return response.data;
  }
}

export default MeetingService; 