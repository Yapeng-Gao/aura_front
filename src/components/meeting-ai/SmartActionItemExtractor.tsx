import React, { useState } from 'react';
import { Button, Card, List, Tag, Progress, message } from 'antd';
import { MeetingAIService } from '../../services/meeting-ai-service';
import { SmartActionItems, SmartActionItem } from '../../types/meeting';

interface Props {
  meetingId: string;
  existingItems?: SmartActionItems;
}

export const SmartActionItemExtractor: React.FC<Props> = ({
  meetingId,
  existingItems
}) => {
  const [loading, setLoading] = useState(false);
  const [actionItems, setActionItems] = useState<SmartActionItems | undefined>(existingItems);

  const extractActionItems = async () => {
    try {
      setLoading(true);
      const result = await MeetingAIService.getInstance().extractSmartActionItems(meetingId);
      setActionItems(result);
      message.success('智能行动项目提取成功');
    } catch (error) {
      message.error('提取智能行动项目失败');
      console.error('提取智能行动项目失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'red';
      case 'medium':
        return 'orange';
      case 'low':
        return 'green';
      default:
        return 'blue';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">智能行动项目</h2>
        <Button 
          type="primary" 
          onClick={extractActionItems} 
          loading={loading}
        >
          提取智能行动项目
        </Button>
      </div>

      {actionItems ? (
        <div className="space-y-4">
          <Card title="行动项目总结" className="shadow-sm">
            <p className="text-gray-700">{actionItems.summary}</p>
          </Card>

          <Card title="优先级分布" className="shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(actionItems.priority_distribution).map(([priority, count]) => (
                <div key={priority} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">{priority}:</span>
                    <span className="font-medium">{count}</span>
                  </div>
                  <Progress 
                    percent={Math.round((count / actionItems.items.length) * 100)}
                    strokeColor={getPriorityColor(priority)}
                  />
                </div>
              ))}
            </div>
          </Card>

          <Card title="行动项目列表" className="shadow-sm">
            <List
              dataSource={actionItems.items}
              renderItem={(item: SmartActionItem) => (
                <List.Item>
                  <div className="w-full space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium">{item.content}</p>
                        <p className="text-gray-500 text-sm mt-1">{item.context}</p>
                      </div>
                      <Tag color={getPriorityColor(item.priority)}>
                        {item.priority}
                      </Tag>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>负责人: {item.assignee}</span>
                      {item.due_date && (
                        <span>截止日期: {new Date(item.due_date).toLocaleDateString()}</span>
                      )}
                      <span>AI推荐置信度: {(item.confidence * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </div>
      ) : (
        <Card className="text-center py-8">
          <p className="text-gray-500 mb-4">
            点击上方按钮提取智能行动项目
          </p>
        </Card>
      )}
    </div>
  );
}; 