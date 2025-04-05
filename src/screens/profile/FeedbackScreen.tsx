import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, useColorScheme } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigation';
import Header from '../../components/common/Header';
import FeedbackForm from '../../components/FeedbackForm';
import useTranslation from '../../hooks/useTranslation';
import theme from '../../theme';
import api from '../../services/api';
import Icon from 'react-native-vector-icons/Ionicons';

type FeedbackScreenProps = StackScreenProps<RootStackParamList, 'Feedback'>;

const FeedbackScreen: React.FC<FeedbackScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const [submitting, setSubmitting] = useState(false);

  // 处理反馈提交
  const handleSubmitFeedback = async (data: {
    type: 'bug' | 'feature' | 'question' | 'other';
    title: string;
    description: string;
    contactInfo?: string;
  }) => {
    try {
      setSubmitting(true);
      
      // 这里我们可以调用API提交反馈
      // 如果API尚未实现，我们可以模拟一个提交流程
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // API调用示例（如果已实现）
      // await api.submitFeedback({
      //   feedbackType: data.type,
      //   title: data.title,
      //   content: data.description,
      //   contactEmail: data.contactInfo
      // });
      
      return Promise.resolve();
    } catch (error) {
      console.error('Failed to submit feedback:', error);
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