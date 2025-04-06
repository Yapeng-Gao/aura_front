// 基础会议类型
export interface Meeting {
  meeting_id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  duration_minutes?: number;
  status: string;
  participants: string[];
  meeting_link?: string;
  notes?: any;
  summary?: any;
  created_at: string;
  updated_at: string;
}

// AI增强类型
export interface AdvancedSummary {
  theme_analysis: string;
  insights: string;
  implied_decisions: string[];
  recommendations: string[];
  sentiment_analysis?: Record<string, number>;
  key_topics: string[];
}

export interface SmartActionItem {
  content: string;
  assignee: string;
  priority: string;
  due_date?: string;
  context: string;
  confidence: number;
}

export interface SmartActionItems {
  items: SmartActionItem[];
  summary: string;
  priority_distribution: Record<string, number>;
}

export interface TopicTransition {
  from_topic: string;
  to_topic: string;
  triggered_by: string;
}

export interface DiscussionAnalysis {
  discussion_patterns: string[];
  key_points: string[];
  participant_engagement: Record<string, number>;
  topic_transitions: TopicTransition[];
  consensus_points: string[];
  disagreement_points: string[];
}

export interface MeetingAIAnalysis {
  meeting_id: string;
  advanced_summary?: AdvancedSummary;
  smart_action_items?: SmartActionItems;
  discussion_analysis?: DiscussionAnalysis;
  created_at: string;
  updated_at: string;
} 