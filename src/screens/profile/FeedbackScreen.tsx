import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, useColorScheme } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigation';
import Header from '../../components/common/Header';
import FeedbackForm from '../../components/FeedbackForm';
import useTranslation from '../../hooks/useTranslation';
import theme from '../../theme';
import apiService from '../../services/api';
import Icon from 'react-native-vector-icons/Ionicons';

type FeedbackScreenProps = StackScreenProps<RootStackParamList, 'Feedback'>;

const FeedbackScreen: React.FC<FeedbackScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const [submitting, setSubmitting] = useState(false);

  // 记录页面访问活动
  useEffect(() => {
    const recordPageVisit = async () => {
      try {
        await apiService.analytics.recordActivity({
          activity_type: '页面访问',
          module: 'feedback',
          action: 'view',
          resource_type: 'screen',
          resource_id: 'feedback',
          details: {
            screen: 'FeedbackScreen'
          }
        });
      } catch (error) {
        console.error('Failed to record activity:', error);
      }
    };
    
    recordPageVisit();
  }, []);

  // 处理反馈提交
  const handleSubmitFeedback = async (data: {
    type: 'bug' | 'feature' | 'question' | 'other';
    title: string;
    description: string;
    contactInfo?: string;
  }) => {
    try {
      setSubmitting(true);
      
      // 使用API提交反馈
      await apiService.feedback.createFeedback({
        type: data.type,
        title: data.title,
        content: data.description, // 注意字段名称从description映射到content
        contactInfo: data.contactInfo
      });
      
      // 记录提交反馈活动
      await apiService.analytics.recordActivity({
        activity_type: '提交反馈',
        module: 'feedback',
        action: 'create',
        resource_type: 'feedback',
        details: {
          type: data.type,
          title: data.title
        }
      });
      
      return Promise.resolve();
    } catch (error) {
      console.error(t('settings.feedback.submitError'), error);
      Alert.alert(
        t('common.error'),
        t('settings.feedback.submitError'),
        [{ text: t('common.confirm') }]
      );
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={[
      styles.container,
      isDarkMode && { backgroundColor: theme.dark.colors.background }
    ]}>
      <Header 
        title={t('settings.feedback.title')}
        leftIcon={<Icon name="chevron-back" size={24} color={isDarkMode ? theme.dark.colors.textPrimary : theme.colors.textPrimary} />}
        onLeftPress={() => navigation.goBack()}
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <FeedbackForm onSubmit={handleSubmitFeedback} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.md,
  },
});

export default FeedbackScreen; 