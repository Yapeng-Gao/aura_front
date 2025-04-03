import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import ScreenContainer from '../../components/common/ScreenContainer';
import Card from '../../components/common/Card';
import theme from '../../theme';

const MeetingAssistantScreen: React.FC = () => {
  const [selectedMeeting, setSelectedMeeting] = useState<string | null>(null);

  // 模拟会议数据
  const meetings = [
    {
      id: '1',
      title: '产品团队周会',
      time: '今天 10:00',
      duration: '1小时',
      participants: 8,
      status: 'upcoming',
    },
    {
      id: '2',
      title: '客户演示会议',
      time: '今天 14:30',
      duration: '45分钟',
      participants: 5,
      status: 'upcoming',
    },
    {
      id: '3',
      title: '项目评审会',
      time: '昨天 15:00',
      duration: '2小时',
      participants: 12,
      status: 'completed',
    },
  ];

  const handleMeetingPress = (meetingId: string) => {
    setSelectedMeeting(meetingId);
    // TODO: 导航到会议详情页面
  };

  return (
    <ScreenContainer
      title="会议助手"
      backgroundColor={theme.colors.background}
      showBackButton
    >
      <ScrollView style={styles.container}>
        <Card title="今日会议" style={styles.card}>
          {meetings.map((meeting) => (
            <TouchableOpacity
              key={meeting.id}
              style={[
                styles.meetingItem,
                selectedMeeting === meeting.id && styles.selectedMeeting,
              ]}
              onPress={() => handleMeetingPress(meeting.id)}
            >
              <View style={styles.meetingHeader}>
                <Text style={styles.meetingTitle}>{meeting.title}</Text>
                <Text style={[
                  styles.meetingStatus,
                  meeting.status === 'completed' && styles.completedStatus
                ]}>
                  {meeting.status === 'upcoming' ? '即将开始' : '已完成'}
                </Text>
              </View>
              <View style={styles.meetingInfo}>
                <Text style={styles.meetingTime}>{meeting.time}</Text>
                <Text style={styles.meetingDuration}>{meeting.duration}</Text>
                <Text style={styles.meetingParticipants}>{meeting.participants} 人参与</Text>
              </View>
            </TouchableOpacity>
          ))}
        </Card>

        <Card title="会议助手功能" style={styles.card}>
          <TouchableOpacity style={styles.assistantFeature}>
            <Text style={styles.featureTitle}>会议纪要生成</Text>
            <Text style={styles.featureDescription}>自动生成会议纪要，包含关键讨论点和行动项目</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.assistantFeature}>
            <Text style={styles.featureTitle}>会议提醒</Text>
            <Text style={styles.featureDescription}>智能提醒会议时间，自动发送会议链接</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.assistantFeature}>
            <Text style={styles.featureTitle}>参会确认</Text>
            <Text style={styles.featureDescription}>自动收集参会确认，统计参会人数</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.assistantFeature}>
            <Text style={styles.featureTitle}>会议总结</Text>
            <Text style={styles.featureDescription}>生成会议总结报告，包含重要决策和后续任务</Text>
          </TouchableOpacity>
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
  card: {
    marginBottom: theme.spacing.md,
  },
  meetingItem: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  selectedMeeting: {
    backgroundColor: `${theme.colors.primary}10`,
  },
  meetingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  meetingTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium as any,
    color: theme.colors.textPrimary,
  },
  meetingStatus: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary,
  },
  completedStatus: {
    color: theme.colors.textSecondary,
  },
  meetingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  meetingTime: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginRight: theme.spacing.md,
  },
  meetingDuration: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginRight: theme.spacing.md,
  },
  meetingParticipants: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  assistantFeature: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  featureTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium as any,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  featureDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
});

export default MeetingAssistantScreen; 