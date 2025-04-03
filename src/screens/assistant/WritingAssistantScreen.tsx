import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import ScreenContainer from '../../components/common/ScreenContainer';
import Card from '../../components/common/Card';
import theme from '../../theme';

const WritingAssistantScreen: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const templates = [
    {
      id: 'email',
      title: '邮件模板',
      description: '生成专业的商务邮件',
      icon: '📧',
    },
    {
      id: 'report',
      title: '报告模板',
      description: '生成工作报告和总结',
      icon: '📊',
    },
    {
      id: 'proposal',
      title: '提案模板',
      description: '生成项目提案和计划',
      icon: '📝',
    },
    {
      id: 'social',
      title: '社交媒体',
      description: '生成社交媒体文案',
      icon: '📱',
    },
  ];

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    // TODO: 根据模板类型设置不同的提示词
  };

  const handleGenerate = () => {
    if (inputText.trim()) {
      // TODO: 调用AI生成内容
      console.log('生成内容:', inputText);
    }
  };

  return (
    <ScreenContainer
      title="写作助手"
      backgroundColor={theme.colors.background}
    >
      <ScrollView style={styles.container}>
        <Card title="选择模板" style={styles.card}>
          <View style={styles.templateGrid}>
            {templates.map((template) => (
              <TouchableOpacity
                key={template.id}
                style={[
                  styles.templateItem,
                  selectedTemplate === template.id && styles.selectedTemplate,
                ]}
                onPress={() => handleTemplateSelect(template.id)}
              >
                <Text style={styles.templateIcon}>{template.icon}</Text>
                <Text style={styles.templateTitle}>{template.title}</Text>
                <Text style={styles.templateDescription}>{template.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        <Card title="输入提示" style={styles.card}>
          <TextInput
            style={styles.input}
            placeholder="请输入您的写作需求..."
            value={inputText}
            onChangeText={setInputText}
            multiline
            numberOfLines={4}
          />
          <TouchableOpacity
            style={[
              styles.generateButton,
              !inputText.trim() && styles.disabledButton,
            ]}
            onPress={handleGenerate}
            disabled={!inputText.trim()}
          >
            <Text style={styles.generateButtonText}>生成内容</Text>
          </TouchableOpacity>
        </Card>

        <Card title="写作助手功能" style={styles.card}>
          <TouchableOpacity style={styles.assistantFeature}>
            <Text style={styles.featureTitle}>智能润色</Text>
            <Text style={styles.featureDescription}>优化文章表达，提升写作质量</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.assistantFeature}>
            <Text style={styles.featureTitle}>语法检查</Text>
            <Text style={styles.featureDescription}>检查并修正语法错误</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.assistantFeature}>
            <Text style={styles.featureTitle}>风格转换</Text>
            <Text style={styles.featureDescription}>转换文章风格，适应不同场景</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.assistantFeature}>
            <Text style={styles.featureTitle}>内容扩写</Text>
            <Text style={styles.featureDescription}>根据关键词扩展相关内容</Text>
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
  templateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  templateItem: {
    width: '48%',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    alignItems: 'center',
  },
  selectedTemplate: {
    backgroundColor: `${theme.colors.primary}10`,
    borderColor: theme.colors.primary,
    borderWidth: 1,
  },
  templateIcon: {
    fontSize: 32,
    marginBottom: theme.spacing.sm,
  },
  templateTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium as any,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  templateDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textPrimary,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  generateButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  disabledButton: {
    backgroundColor: theme.colors.textDisabled,
  },
  generateButtonText: {
    color: theme.colors.onPrimary,
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium as any,
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

export default WritingAssistantScreen; 