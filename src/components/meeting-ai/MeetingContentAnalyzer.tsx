import React, { useState } from 'react';
import { Button, Card, List, Progress, message } from 'antd';
import { MeetingAIService } from '../../services/meeting-ai-service';
import { DiscussionAnalysis } from '../../types/meeting';

interface Props {
  meetingId: string;
  existingAnalysis?: DiscussionAnalysis;
}

interface TopicTransition {
  from_topic: string;
  to_topic: string;
  triggered_by: string;
}

export const MeetingContentAnalyzer: React.FC<Props> = ({
  meetingId,
  existingAnalysis
}) => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<DiscussionAnalysis | undefined>(existingAnalysis);

  const analyzeDiscussion = async () => {
    try {
      setLoading(true);
      const result = await MeetingAIService.getInstance().analyzeDiscussion(meetingId);
      setAnalysis(result);
      message.success('会议内容分析完成');
    } catch (error) {
      message.error('分析会议内容失败');
      console.error('分析会议内容失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">会议内容分析</h2>
        <Button 
          type="primary" 
          onClick={analyzeDiscussion} 
          loading={loading}
        >
          分析会议内容
        </Button>
      </div>

      {analysis ? (
        <div className="space-y-4">
          <Card title="讨论模式" className="shadow-sm">
            <List
              dataSource={analysis.discussion_patterns}
              renderItem={(pattern: string) => (
                <List.Item>
                  <span className="text-gray-700">{pattern}</span>
                </List.Item>
              )}
            />
          </Card>

          <Card title="关键讨论点" className="shadow-sm">
            <List
              dataSource={analysis.key_points}
              renderItem={(point: string) => (
                <List.Item>
                  <span className="text-gray-700">{point}</span>
                </List.Item>
              )}
            />
          </Card>

          <Card title="参与者参与度" className="shadow-sm">
            <div className="space-y-4">
              {Object.entries(analysis.participant_engagement).map(([participant, score]) => (
                <div key={participant} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">{participant}:</span>
                    <span className="font-medium">{(score * 100).toFixed(1)}%</span>
                  </div>
                  <Progress 
                    percent={Math.round(score * 100)}
                    strokeColor={score > 0.7 ? '#52c41a' : score > 0.4 ? '#faad14' : '#f5222d'}
                  />
                </div>
              ))}
            </div>
          </Card>

          <Card title="话题转换" className="shadow-sm">
            <List
              dataSource={analysis.topic_transitions}
              renderItem={(transition: TopicTransition) => (
                <List.Item>
                  <div className="w-full">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">从: {transition.from_topic}</span>
                      <span className="text-gray-500">→</span>
                      <span className="text-gray-600">到: {transition.to_topic}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      触发者: {transition.triggered_by}
                    </p>
                  </div>
                </List.Item>
              )}
            />
          </Card>

          <Card title="共识与分歧" className="shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-medium mb-2 text-green-600">达成共识</h3>
                <List
                  dataSource={analysis.consensus_points}
                  renderItem={(point: string) => (
                    <List.Item>
                      <span className="text-gray-700">{point}</span>
                    </List.Item>
                  )}
                />
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2 text-red-600">存在分歧</h3>
                <List
                  dataSource={analysis.disagreement_points}
                  renderItem={(point: string) => (
                    <List.Item>
                      <span className="text-gray-700">{point}</span>
                    </List.Item>
                  )}
                />
              </div>
            </div>
          </Card>
        </div>
      ) : (
        <Card className="text-center py-8">
          <p className="text-gray-500 mb-4">
            点击上方按钮分析会议内容
          </p>
        </Card>
      )}
    </div>
  );
}; 