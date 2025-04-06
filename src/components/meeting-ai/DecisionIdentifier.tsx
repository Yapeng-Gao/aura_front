import React, { useState } from 'react';
import { Button, Card, List, Tag, message } from 'antd';
import { MeetingAIService } from '../../services/meeting-ai-service';
import { AdvancedSummary } from '../../types/meeting';

interface Props {
  meetingId: string;
  existingDecisions?: string[];
}

export const DecisionIdentifier: React.FC<Props> = ({
  meetingId,
  existingDecisions
}) => {
  const [loading, setLoading] = useState(false);
  const [decisions, setDecisions] = useState<string[] | undefined>(existingDecisions);

  const identifyDecisions = async () => {
    try {
      setLoading(true);
      const result = await MeetingAIService.getInstance().generateAdvancedSummary(meetingId);
      setDecisions(result.implied_decisions);
      message.success('决策识别完成');
    } catch (error) {
      message.error('识别决策失败');
      console.error('识别决策失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDecisionType = (decision: string): string => {
    // 基于决策内容判断类型
    if (decision.toLowerCase().includes('approve') || decision.toLowerCase().includes('同意')) {
      return 'approval';
    } else if (decision.toLowerCase().includes('reject') || decision.toLowerCase().includes('拒绝')) {
      return 'rejection';
    } else if (decision.toLowerCase().includes('postpone') || decision.toLowerCase().includes('延期')) {
      return 'postponement';
    } else if (decision.toLowerCase().includes('delegate') || decision.toLowerCase().includes('委派')) {
      return 'delegation';
    } else {
      return 'general';
    }
  };

  const getDecisionColor = (type: string): string => {
    switch (type) {
      case 'approval':
        return 'green';
      case 'rejection':
        return 'red';
      case 'postponement':
        return 'orange';
      case 'delegation':
        return 'blue';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">决策识别</h2>
        <Button 
          type="primary" 
          onClick={identifyDecisions} 
          loading={loading}
        >
          识别会议决策
        </Button>
      </div>

      {decisions ? (
        <div className="space-y-4">
          <Card title="识别到的决策" className="shadow-sm">
            <List
              dataSource={decisions}
              renderItem={(decision: string) => {
                const type = getDecisionType(decision);
                return (
                  <List.Item>
                    <div className="w-full">
                      <div className="flex items-start gap-2">
                        <Tag color={getDecisionColor(type)}>
                          {type === 'approval' ? '批准' :
                           type === 'rejection' ? '拒绝' :
                           type === 'postponement' ? '延期' :
                           type === 'delegation' ? '委派' : '一般决策'}
                        </Tag>
                        <span className="text-gray-700">{decision}</span>
                      </div>
                    </div>
                  </List.Item>
                );
              }}
            />
          </Card>

          <Card title="决策统计" className="shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(
                decisions.reduce((acc, decision) => {
                  const type = getDecisionType(decision);
                  acc[type] = (acc[type] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)
              ).map(([type, count]) => (
                <div key={type} className="flex justify-between items-center">
                  <span className="text-gray-600">
                    {type === 'approval' ? '批准决策' :
                     type === 'rejection' ? '拒绝决策' :
                     type === 'postponement' ? '延期决策' :
                     type === 'delegation' ? '委派决策' : '一般决策'}:
                  </span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      ) : (
        <Card className="text-center py-8">
          <p className="text-gray-500 mb-4">
            点击上方按钮识别会议决策
          </p>
        </Card>
      )}
    </div>
  );
}; 