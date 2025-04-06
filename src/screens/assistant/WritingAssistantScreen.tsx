import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import ScreenContainer from '../../components/common/ScreenContainer';
import Card from '../../components/common/Card';
import theme from '../../theme';
import Button from '../../components/common/Button';
import apiService from '../../services/api';
import { WritingTemplate } from '../../types/assistant';
import * as Clipboard from 'expo-clipboard';

const WritingAssistantScreen: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<WritingTemplate[]>([
    {
      id: 'email',
      name: '邮件模板',
      description: '生成专业的商务邮件',
      category: 'business',
      icon: '📧'
    },
    {
      id: 'report',
      name: '报告模板',
      description: '生成工作报告和总结',
      category: 'business',
      icon: '📊'
    },
    {
      id: 'proposal',
      name: '提案模板',
      description: '生成项目提案和计划',
      category: 'business',
      icon: '📝'
    },
    {
      id: 'social',
      name: '社交媒体',
      description: '生成社交媒体文案',
      category: 'marketing',
      icon: '📱'
    },
  ]);

  useEffect(() => {
    // 加载模板
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const fetchedTemplates = await apiService.writing.getTemplates();
      if (fetchedTemplates && fetchedTemplates.length > 0) {
        setTemplates(fetchedTemplates);
      }
    } catch (error) {
      console.error('加载模板失败:', error);
      // 保留默认模板
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    // 清除之前生成的内容
    setGeneratedContent(null);
  };

  const getTemplatePrompt = () => {
    if (!selectedTemplate) return '';
    const template = templates.find(t => t.id === selectedTemplate);
    return template ? template.name : '';
  };

  const handleGenerate = async () => {
    if (!selectedTemplate || !inputText.trim()) {
      Alert.alert('提示', '请选择模板并输入内容');
      return;
    }

    setLoading(true);
    try {
      // 调用API生成内容
      const response = await apiService.writing.generateText(inputText, selectedTemplate);
      
      if (response && response.text) {
        setGeneratedContent(response.text);
      } else {
        throw new Error('无法生成内容');
      }
    } catch (error) {
      console.error('生成内容失败:', error);
      Alert.alert('错误', '生成内容失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setInputText('');
    setSelectedTemplate(null);
    setGeneratedContent(null);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await Clipboard.setStringAsync(text);
      Alert.alert('成功', '内容已复制到剪贴板');
    } catch (error) {
      console.error('复制失败:', error);
      Alert.alert('错误', '复制到剪贴板失败');
    }
  };

  const handlePolishText = async () => {
    if (!generatedContent) return;
    
    setLoading(true);
    try {
      const response = await apiService.writing.polishText(generatedContent);
      if (response && response.text) {
        setGeneratedContent(response.text);
        Alert.alert('成功', '文本已优化');
      }
    } catch (error) {
      console.error('优化文本失败:', error);
      Alert.alert('错误', '优化文本失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleGrammarCheck = async () => {
    if (!generatedContent) return;
    
    setLoading(true);
    try {
      const response = await apiService.writing.checkGrammar(generatedContent);
      if (response) {
        setGeneratedContent(response.corrected_text);
        if (response.has_errors) {
          Alert.alert('语法检查完成', `已修复${response.error_count}处错误`);
        } else {
          Alert.alert('语法检查完成', '未发现语法错误');
        }
      }
    } catch (error) {
      console.error('语法检查失败:', error);
      Alert.alert('错误', '语法检查失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>正在处理...</Text>
        </View>
      );
    }

    if (generatedContent) {
      return (
        <Card title="生成的内容" style={styles.card}>
          <ScrollView style={styles.generatedContentContainer}>
            <Text style={styles.generatedContent}>{generatedContent}</Text>
          </ScrollView>
          <View style={styles.actionButtonsContainer}>
            <Button
              title="复制内容"
              variant="secondary"
              size="medium"
              onPress={() => copyToClipboard(generatedContent)}
              style={styles.actionButton}
            />
            <Button
              title="重新开始"
              variant="primary"
              size="medium"
              onPress={handleReset}
              style={styles.actionButton}
            />
          </View>
        </Card>
      );
    }

    return (
      <>
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
                <Text style={styles.templateTitle}>{template.name}</Text>
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
          <Button
            title="生成内容"
            variant="primary"
            size="medium"
            onPress={handleGenerate}
            disabled={!inputText.trim() || !selectedTemplate}
            style={styles.generateButton}
          />
        </Card>

        <Card title="写作助手功能" style={styles.card}>
          <TouchableOpacity style={styles.assistantFeature} onPress={handlePolishText}>
            <Text style={styles.featureTitle}>智能润色</Text>
            <Text style={styles.featureDescription}>优化文章表达，提升写作质量</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.assistantFeature} onPress={handleGrammarCheck}>
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
      </>
    );
  };

  return (
    <ScreenContainer
      title="写作助手"
      backgroundColor={theme.colors.background}
      showBackButton
    >
      <ScrollView style={styles.container}>
        {renderContent()}
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
    fontWeight: 500,
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
    marginTop: theme.spacing.md,
  },
  assistantFeature: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  featureTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: 500,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  featureDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  loadingContainer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
  },
  generatedContentContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    maxHeight: 300,
  },
  generatedContent: {
    fontSize: theme.typography.fontSize.md,
    lineHeight: 24,
    color: theme.colors.textPrimary,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.md,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
  },
});

export default WritingAssistantScreen; 