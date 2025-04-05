import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation, RouteProp, CompositeNavigationProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import ScreenContainer from '../../components/common/ScreenContainer';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import theme from '../../theme';
import apiService from '../../services/api';
import { RootStackParamList, AssistantStackParamList } from '../../navigation/types';

// 定义路由参数和导航类型
type MeetingDetailNavigationProp = StackNavigationProp<RootStackParamList, 'MeetingDetail'>;
type MeetingDetailRouteProp = RouteProp<RootStackParamList, 'MeetingDetail'>;

// 会议详情类型
interface MeetingDetail {
  meeting_id: string;
  title: string;
  status: 'active' | 'completed';
  start_time: string;
  end_time?: string;
  duration?: string;
  participants: Array<{
    user_id: string;
    name: string;
    role?: string;
  }>;
  summary?: string;
  action_items?: Array<{
    id: string;
    description: string;
    assignee?: string;
    due_date?: string;
  }>;
}

const MeetingDetailScreen: React.FC = () => {
  const route = useRoute<MeetingDetailRouteProp>();
  const navigation = useNavigation<MeetingDetailNavigationProp>();
  const { meetingId } = route.params;
  
  const [meeting, setMeeting] = useState<MeetingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  
  useEffect(() => {
    fetchMeetingDetails();
  }, [meetingId]);
  
  const fetchMeetingDetails = async () => {
    setLoading(true);
    try {
      // 假设API提供了根据ID获取会议详情的方法
      const response = await apiService.productivity.getMeeting(meetingId);
      if (response) {
        setMeeting(response);
      }
    } catch (error) {
      console.error('获取会议详情失败:', error);
      // 设置模拟数据
      setMeeting({
        meeting_id: meetingId,
        title: '产品团队周会',
        status: 'active',
        start_time: new Date().toISOString(),
        participants: [
          { user_id: '1', name: '张三', role: '产品经理' },
          { user_id: '2', name: '李四', role: '开发工程师' },
          { user_id: '3', name: '王五', role: '设计师' },
        ],
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleEndMeeting = async () => {
    setLoading(true);
    try {
      await apiService.productivity.endMeeting(meetingId);
      
      // 更新会议状态
      if (meeting) {
        setMeeting({
          ...meeting,
          status: 'completed',
          end_time: new Date().toISOString(),
        });
      }
      
      Alert.alert('成功', '会议已结束');
    } catch (error) {
      console.error('结束会议失败:', error);
      Alert.alert('错误', '结束会议失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };
  
  const handleGenerateSummary = async () => {
    setGeneratingSummary(true);
    try {
      const response = await apiService.productivity.getMeetingSummary(meetingId);
      
      if (response && response.summary) {
        // 更新会议摘要
        if (meeting) {
          setMeeting({
            ...meeting,
            summary: response.summary,
            action_items: response.action_items || [],
          });
        }
      }
    } catch (error) {
      console.error('生成会议纪要失败:', error);
      Alert.alert('错误', '生成会议纪要失败，请稍后重试');
      
      // 设置模拟摘要数据
      if (meeting) {
        setMeeting({
          ...meeting,
          summary: '讨论了产品下一阶段的开发计划，重点关注用户体验改进和新功能开发。团队同意优先实现AI助手功能，其次是日程管理和智能家居集成。',
          action_items: [
            { id: '1', description: '完成AI助手功能需求文档', assignee: '张三', due_date: '2025-04-10' },
            { id: '2', description: '准备UI设计初稿', assignee: '王五', due_date: '2025-04-12' },
            { id: '3', description: '评估技术可行性', assignee: '李四', due_date: '2025-04-15' },
          ],
        });
      }
    } finally {
      setGeneratingSummary(false);
    }
  };
  
  if (loading) {
    return (
      <ScreenContainer
        title="会议详情"
        backgroundColor={theme.colors.background}
        showBackButton
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      </ScreenContainer>
    );
  }
  
  if (!meeting) {
    return (
      <ScreenContainer
        title="会议详情"
        backgroundColor={theme.colors.background}
        showBackButton
      >
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>无法加载会议详情</Text>
          <Button
            title="返回"
            variant="primary"
            size="medium"
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          />
        </View>
      </ScreenContainer>
    );
  }
  
  return (
    <ScreenContainer
      title={meeting.title}
      backgroundColor={theme.colors.background}
      showBackButton
    >
      <ScrollView style={styles.container}>
        {/* 会议状态卡片 */}
        <Card style={styles.card}>
          <View style={styles.statusContainer}>
            <View style={styles.statusInfo}>
              <Text style={styles.statusLabel}>状态</Text>
              <Text style={[
                styles.statusValue,
                meeting.status === 'active' ? styles.activeStatus : styles.completedStatus
              ]}>
                {meeting.status === 'active' ? '进行中' : '已结束'}
              </Text>
            </View>
            
            <View style={styles.statusInfo}>
              <Text style={styles.statusLabel}>开始时间</Text>
              <Text style={styles.statusValue}>
                {new Date(meeting.start_time).toLocaleString('zh-CN')}
              </Text>
            </View>
            
            {meeting.end_time && (
              <View style={styles.statusInfo}>
                <Text style={styles.statusLabel}>结束时间</Text>
                <Text style={styles.statusValue}>
                  {new Date(meeting.end_time).toLocaleString('zh-CN')}
                </Text>
              </View>
            )}
            
            {meeting.status === 'active' && (
              <Button
                title="结束会议"
                variant="primary"
                size="medium"
                onPress={handleEndMeeting}
                style={styles.actionButton}
              />
            )}
          </View>
        </Card>
        
        {/* 参会人员卡片 */}
        <Card title="参会人员" style={styles.card}>
          {meeting.participants.map((participant) => (
            <View key={participant.user_id} style={styles.participantItem}>
              <Text style={styles.participantName}>{participant.name}</Text>
              {participant.role && (
                <Text style={styles.participantRole}>{participant.role}</Text>
              )}
            </View>
          ))}
        </Card>
        
        {/* 会议纪要卡片 */}
        <Card title="会议纪要" style={styles.card}>
          {meeting.summary ? (
            <View>
              <Text style={styles.summaryText}>{meeting.summary}</Text>
              
              {meeting.action_items && meeting.action_items.length > 0 && (
                <View style={styles.actionItemsContainer}>
                  <Text style={styles.actionItemsTitle}>行动项目</Text>
                  {meeting.action_items.map((item) => (
                    <View key={item.id} style={styles.actionItem}>
                      <Text style={styles.actionItemDescription}>{item.description}</Text>
                      <View style={styles.actionItemMeta}>
                        {item.assignee && (
                          <Text style={styles.actionItemAssignee}>负责人: {item.assignee}</Text>
                        )}
                        {item.due_date && (
                          <Text style={styles.actionItemDueDate}>截止日期: {item.due_date}</Text>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ) : (
            <View style={styles.noSummaryContainer}>
              <Text style={styles.noSummaryText}>
                {meeting.status === 'active'
                  ? '会议进行中，会议结束后可生成纪要'
                  : '尚未生成会议纪要'}
              </Text>
              
              {meeting.status === 'completed' && (
                <Button
                  title="生成会议纪要"
                  variant="primary"
                  size="medium"
                  onPress={handleGenerateSummary}
                  loading={generatingSummary}
                  style={styles.generateButton}
                />
              )}
            </View>
          )}
        </Card>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  errorText: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.error,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  backButton: {
    minWidth: 120,
  },
  card: {
    marginBottom: theme.spacing.md,
  },
  statusContainer: {
    padding: theme.spacing.md,
  },
  statusInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  statusLabel: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
    fontWeight: 500,
  },
  statusValue: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textPrimary,
    fontWeight: 500,
  },
  activeStatus: {
    color: theme.colors.success,
  },
  completedStatus: {
    color: theme.colors.info,
  },
  actionButton: {
    alignSelf: 'flex-end',
    marginTop: theme.spacing.sm,
  },
  participantItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  participantName: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textPrimary,
    fontWeight: 500,
  },
  participantRole: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  noSummaryContainer: {
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  noSummaryText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  generateButton: {
    minWidth: 150,
  },
  summaryText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textPrimary,
    lineHeight: 24,
    padding: theme.spacing.md,
  },
  actionItemsContainer: {
    marginTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
    padding: theme.spacing.md,
  },
  actionItemsTitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textPrimary,
    fontWeight: 700,
    marginBottom: theme.spacing.md,
  },
  actionItem: {
    backgroundColor: `${theme.colors.info}10`,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  actionItemDescription: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  actionItemMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  actionItemAssignee: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  actionItemDueDate: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
});

export default MeetingDetailScreen; 