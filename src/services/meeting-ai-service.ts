import apiService from './api';
import { 
  AdvancedSummary, 
  SmartActionItems, 
  DiscussionAnalysis,
  MeetingAIAnalysis 
} from '../types/meeting';

export class MeetingAIService {
  private static instance: MeetingAIService;
  
  private constructor() {}
  
  static getInstance(): MeetingAIService {
    if (!MeetingAIService.instance) {
      MeetingAIService.instance = new MeetingAIService();
    }
    return MeetingAIService.instance;
  }
  
  async generateAdvancedSummary(meetingId: string): Promise<AdvancedSummary> {
    try {
      const response = await apiService.client.post<AdvancedSummary>(`/assistant/meeting/${meetingId}/advanced-summary`);
      return response || {} as AdvancedSummary;
    } catch (error) {
      console.error('生成高级会议总结失败:', error);
      throw error;
    }
  }
  
  async extractSmartActionItems(meetingId: string): Promise<SmartActionItems> {
    try {
      const response = await apiService.client.post<SmartActionItems>(`/assistant/meeting/${meetingId}/smart-action-items`);
      return response || {} as SmartActionItems;
    } catch (error) {
      console.error('提取智能行动项目失败:', error);
      throw error;
    }
  }
  
  async analyzeDiscussion(meetingId: string): Promise<DiscussionAnalysis> {
    try {
      const response = await apiService.client.post<DiscussionAnalysis>(`/assistant/meeting/${meetingId}/discussion-analysis`);
      return response || {} as DiscussionAnalysis;
    } catch (error) {
      console.error('分析会议讨论失败:', error);
      throw error;
    }
  }
  
  async getAIAnalysis(meetingId: string): Promise<MeetingAIAnalysis | null> {
    try {
      const response = await apiService.client.get<MeetingAIAnalysis>(`/assistant/meeting/${meetingId}/ai-analysis`);
      return response || null;
    } catch (error) {
      console.error('获取AI分析结果失败:', error);
      return null;
    }
  }
} 