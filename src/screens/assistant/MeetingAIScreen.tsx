import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
// @ts-ignore
import { useRoute, useNavigation } from '@react-navigation/native';
import { MeetingAIService } from '../../services/meeting-ai-service';
import { MeetingService } from '../../services/meeting-service';
import { Meeting, MeetingAIAnalysis } from '../../types/meeting';
import { AdvancedSummaryGenerator } from '../../components/meeting-ai/AdvancedSummaryGenerator';
// @ts-ignore
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import Toast from 'react-native-toast-message';

const Tab = createMaterialTopTabNavigator();

export const MeetingAIScreen: React.FC = () => {
  // @ts-ignore - 暂时忽略route类型检查
  const route = useRoute();
  // @ts-ignore - 暂时忽略navigation类型检查
  const navigation = useNavigation();
  const meetingId = route.params?.meetingId as string;
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<MeetingAIAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMeetingData();
  }, [meetingId]);

  const loadMeetingData = async () => {
    if (!meetingId) {
      Toast.show({
        type: 'error',
        text1: '缺少会议ID',
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // 加载会议基本信息
      const meetingData = await MeetingService.getInstance().getMeeting(meetingId);
      setMeeting(meetingData);
      
      // 尝试加载AI分析结果
      try {
        const analysisData = await MeetingAIService.getInstance().getAIAnalysis(meetingId);
        setAiAnalysis(analysisData);
      } catch (analyticError) {
        console.warn('无法加载AI分析数据:', analyticError);
        // 如果AI分析数据加载失败，但会议数据正常，我们可以继续
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: '加载会议数据失败',
      });
      console.error('加载会议数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1890ff" />
      </View>
    );
  }

  if (!meeting) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>会议不存在</Text>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>返回会议列表</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 目前我们只实现高级总结分析界面，其他功能暂时不实现
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>{'< 返回'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{meeting.title}</Text>
      </View>

      <AdvancedSummaryGenerator 
        meetingId={meetingId}
        existingSummary={aiAnalysis?.advanced_summary}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    paddingRight: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#1890ff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  button: {
    backgroundColor: '#1890ff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  buttonText: {
    color: '#fff',
  },
}); 