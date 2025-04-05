import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  useColorScheme,
  Alert,
  ActivityIndicator
} from 'react-native';
import Card from './common/Card';
import Button from './common/Button';
import theme from '../theme';
import useTranslation from '../hooks/useTranslation';

type FeedbackType = 'bug' | 'feature' | 'question' | 'other';

interface FeedbackFormProps {
  onSubmit?: (data: {
    type: FeedbackType;
    title: string;
    description: string;
    contactInfo?: string;
  }) => Promise<void>;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({ onSubmit }) => {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  
  // 表单状态
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('bug');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  
  // 提交状态
  const [submitting, setSubmitting] = useState(false);
  
  // 表单验证
  const isFormValid = title.trim().length > 0 && description.trim().length > 0;
  
  // 反馈类型选项
  const feedbackTypes: { type: FeedbackType; label: string; icon: string }[] = [
    { type: 'bug', label: t('settings.feedback.bugReport'), icon: '🐞' },
    { type: 'feature', label: t('settings.feedback.featureRequest'), icon: '💡' },
    { type: 'question', label: t('settings.feedback.question'), icon: '❓' },
    { type: 'other', label: t('settings.feedback.other'), icon: '💬' },
  ];
  
  // 处理提交
  const handleSubmit = async () => {
    if (!isFormValid) return;
    
    try {
      setSubmitting(true);
      
      if (onSubmit) {
        await onSubmit({
          type: feedbackType,
          title,
          description,
          contactInfo: contactInfo.trim() || undefined,
        });
      } else {
        // 模拟提交
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      
      // 重置表单
      setTitle('');
      setDescription('');
      setContactInfo('');
      
      // 显示成功消息
      Alert.alert(
        t('settings.feedback.submitSuccess'),
        t('settings.feedback.submitSuccessMessage'),
        [{ text: t('common.confirm') }]
      );
    } catch (error) {
      Alert.alert(
        t('common.error'),
        t('settings.feedback.submitError'),
        [{ text: t('common.confirm') }]
      );
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <Card title={t('settings.feedback.title')} style={styles.card}>
      <View style={styles.container}>
        {/* 反馈类型选择 */}
        <Text style={[styles.label, isDarkMode && styles.labelDark]}>
          {t('settings.feedback.feedbackType')}
        </Text>
        <View style={styles.typeContainer}>
          {feedbackTypes.map(item => (
            <TouchableOpacity
              key={item.type}
              style={[
                styles.typeButton,
                feedbackType === item.type && styles.selectedTypeButton,
                isDarkMode && styles.typeButtonDark,
                feedbackType === item.type && isDarkMode && styles.selectedTypeButtonDark,
              ]}
              onPress={() => setFeedbackType(item.type)}
            >
              <Text style={styles.typeButtonIcon}>{item.icon}</Text>
              <Text 
                style={[
                  styles.typeButtonText,
                  feedbackType === item.type && styles.selectedTypeButtonText,
                  isDarkMode && styles.typeButtonTextDark,
                ]}
                numberOfLines={1}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* 反馈标题 */}
        <Text style={[styles.label, isDarkMode && styles.labelDark]}>
          {t('settings.feedback.title')} *
        </Text>
        <TextInput
          style={[
            styles.input,
            isDarkMode && styles.inputDark,
          ]}
          placeholder={t('settings.feedback.titlePlaceholder')}
          placeholderTextColor={isDarkMode ? theme.dark.colors.textSecondary : theme.colors.textSecondary}
          value={title}
          onChangeText={setTitle}
          maxLength={100}
        />
        
        {/* 反馈描述 */}
        <Text style={[styles.label, isDarkMode && styles.labelDark]}>
          {t('settings.feedback.description')} *
        </Text>
        <TextInput
          style={[
            styles.textArea,
            isDarkMode && styles.inputDark,
          ]}
          placeholder={t('settings.feedback.descriptionPlaceholder')}
          placeholderTextColor={isDarkMode ? theme.dark.colors.textSecondary : theme.colors.textSecondary}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
        />
        
        {/* 联系方式 */}
        <Text style={[styles.label, isDarkMode && styles.labelDark]}>
          {t('settings.feedback.contactInfo')}
        </Text>
        <TextInput
          style={[
            styles.input,
            isDarkMode && styles.inputDark,
          ]}
          placeholder={t('settings.feedback.contactInfoPlaceholder')}
          placeholderTextColor={isDarkMode ? theme.dark.colors.textSecondary : theme.colors.textSecondary}
          value={contactInfo}
          onChangeText={setContactInfo}
          keyboardType="email-address"
        />
        
        <Text style={[styles.helperText, isDarkMode && styles.helperTextDark]}>
          {t('settings.feedback.requiredFields')}
        </Text>
        
        {/* 提交按钮 */}
        <Button
          title={submitting ? t('settings.feedback.submitting') : t('settings.feedback.submit')}
          variant="primary"
          size="large"
          onPress={handleSubmit}
          disabled={!isFormValid || submitting}
          style={styles.submitButton}
          leftIcon={submitting ? <ActivityIndicator size="small" color="white" /> : undefined}
        />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: theme.spacing.md,
  },
  container: {
    padding: theme.spacing.md,
  },
  label: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  labelDark: {
    color: theme.dark.colors.textPrimary,
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.spacing.md,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  typeButtonDark: {
    backgroundColor: theme.dark.colors.surface,
    borderColor: theme.dark.colors.border,
  },
  selectedTypeButton: {
    backgroundColor: `${theme.colors.primary}20`, // 20% opacity
    borderColor: theme.colors.primary,
  },
  selectedTypeButtonDark: {
    backgroundColor: `${theme.dark.colors.primary}30`, // 30% opacity
    borderColor: theme.dark.colors.primary,
  },
  typeButtonIcon: {
    fontSize: 16,
    marginRight: theme.spacing.xs,
  },
  typeButtonText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textPrimary,
  },
  typeButtonTextDark: {
    color: theme.dark.colors.textPrimary,
  },
  selectedTypeButtonText: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  inputDark: {
    backgroundColor: theme.dark.colors.surface,
    borderColor: theme.dark.colors.border,
    color: theme.dark.colors.textPrimary,
  },
  textArea: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
    height: 120,
  },
  helperText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  helperTextDark: {
    color: theme.dark.colors.textSecondary,
  },
  submitButton: {
    marginTop: theme.spacing.sm,
  },
});

export default FeedbackForm; 