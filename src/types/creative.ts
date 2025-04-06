export interface ContentType {
  id: string;
  name: string;
  description: string;
  icon?: string;
}

export interface CreativeStyle {
  id: string;
  name: string;
  description: string;
  category: string;
}

export interface ContentGenerationRequest {
  contentType: string;
  prompt: string;
  style?: string;
  length?: 'short' | 'medium' | 'long';
  tone?: string;
  audience?: string;
  additionalInstructions?: string;
}

export interface ContentResponse {
  content: string;
  contentType: string;
  style?: string;
  id: string;
  createdAt: string;
}

export interface ContentDetailResponse extends ContentResponse {
  prompt: string;
  metadata?: Record<string, any>;
}

export interface ContentVariationRequest {
  style?: string;
  tone?: string;
  length?: 'shorter' | 'similar' | 'longer';
  additionalInstructions?: string;
}

export interface SaveContentRequest {
  contentId: string;
  title: string;
}

export interface ContentHistoryItem {
  id: string;
  contentType: string;
  content: string;
  style?: string;
  createdAt: string;
} 