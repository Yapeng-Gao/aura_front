import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ScreenContainer from '../../components/common/ScreenContainer';
import Card from '../../components/common/Card';
import theme from '../../theme';
import Button from '../../components/common/Button';
import apiService from '../../services/api';
import { WritingTemplate } from '../../types/assistant';
import * as Clipboard from 'expo-clipboard';
import Toast from 'react-native-toast-message';
import ErrorBoundary from '../../components/common/ErrorBoundary';
import { useAppSelector } from '../../hooks/useRedux';

// 缓存键
const TEMPLATES_CACHE_KEY = 'writing_templates_cache';
const RECENT_DOCS_CACHE_KEY = 'writing_recent_docs';

const WritingAssistantScreen: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
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
    }
  ]);
  
  // 添加新的状态
  const [recentDocuments, setRecentDocuments] = useState<any[]>([]);
  const [currentDocumentId, setCurrentDocumentId] = useState<string | null>(null);
  const [documentTitle, setDocumentTitle] = useState('');
  const [styleOption, setStyleOption] = useState('formal');
  const [lengthOption, setLengthOption] = useState('medium');
  const [isSaving, setIsSaving] = useState(false);
  const [showTemplates, setShowTemplates] = useState(true);
  
  // 从Redux获取用户信息
  const { user } = useAppSelector(state => state.auth);

  // 使用useFocusEffect而不是useEffect以便每次屏幕获得焦点时刷新
  useFocusEffect(
    useCallback(() => {
      // 加载模板
      fetchTemplates();
      // 加载最近的文档
      loadRecentDocuments();
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTemplates()
      .then(() => loadRecentDocuments())
      .finally(() => setRefreshing(false));
  }, []);

  const fetchTemplates = async () => {
    try {
      // 首先尝试从缓存加载
      const cachedTemplates = await AsyncStorage.getItem(TEMPLATES_CACHE_KEY);
      if (cachedTemplates) {
        setTemplates(JSON.parse(cachedTemplates));
      }
      
      // 然后尝试从服务器获取最新数据
      const fetchedTemplates = await apiService.writing.getTemplates();
      if (fetchedTemplates && fetchedTemplates.length > 0) {
        setTemplates(fetchedTemplates);
        // 更新缓存
        await AsyncStorage.setItem(TEMPLATES_CACHE_KEY, JSON.stringify(fetchedTemplates));
      }
    } catch (error) {
      console.error('加载模板失败:', error);
      // 如果服务器请求失败但有缓存数据，就继续使用缓存数据
      // 如果都没有，则使用默认模板
      Toast.show({
        type: 'error',
        text1: '无法连接到服务器',
        text2: '正在使用缓存数据'
      });
    }
  };

  const loadRecentDocuments = async () => {
    try {
      // 从服务器加载最近的文档
      const docs = await apiService.writing.getRecentDocuments();
      if (docs && docs.length > 0) {
        setRecentDocuments(docs);
        // 缓存最近的文档
        await AsyncStorage.setItem(RECENT_DOCS_CACHE_KEY, JSON.stringify(docs));
      } else {
        // 如果服务器没有数据，尝试从缓存加载
        const cachedDocs = await AsyncStorage.getItem(RECENT_DOCS_CACHE_KEY);
        if (cachedDocs) {
          setRecentDocuments(JSON.parse(cachedDocs));
        }
      }
    } catch (error) {
      console.error('加载最近文档失败:', error);
      // 尝试从缓存加载
      try {
        const cachedDocs = await AsyncStorage.getItem(RECENT_DOCS_CACHE_KEY);
        if (cachedDocs) {
          setRecentDocuments(JSON.parse(cachedDocs));
        }
      } catch (e) {
        console.error('从缓存加载文档失败:', e);
      }
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    // 清除之前生成的内容
    setGeneratedContent(null);
    // 显示输入表单
    setShowTemplates(false);
    
    // 如果模板有提示词模板，可以将其显示在输入框作为提示
    const template = templates.find(t => t.id === templateId);
    if (template && template.prompt_template) {
      // 替换模板中的占位符为通用说明
      let placeholderPrompt = template.prompt_template
        .replace(/{purpose}/g, "[目的]")
        .replace(/{recipient}/g, "[收件人]")
        .replace(/{subject}/g, "[主题]")
        .replace(/{topic}/g, "[主题]")
        .replace(/{report_type}/g, "[报告类型]")
        .replace(/{focus}/g, "[关注点]")
        .replace(/{article_type}/g, "[文章类型]")
        .replace(/{content}/g, "[内容]")
        .replace(/{platform}/g, "[平台]")
        .replace(/{post_type}/g, "[文案类型]")
        .replace(/{project}/g, "[项目]")
        .replace(/{proposal_type}/g, "[提案类型]")
        .replace(/{audience}/g, "[目标受众]")
        .replace(/{genre}/g, "[文学流派]")
        .replace(/{creative_type}/g, "[创作类型]")
        .replace(/{theme}/g, "[主题]")
        .replace(/{academic_type}/g, "[学术文档类型]")
        .replace(/{method}/g, "[研究方法]");
      
      setInputText(placeholderPrompt);
      
      // 设置默认文档标题
      setDocumentTitle(`${template.name} - ${new Date().toLocaleDateString()}`);
    }
  };

  const handleBackToTemplates = () => {
    // 如果有未保存的内容，询问用户
    if (generatedContent && !currentDocumentId) {
      Alert.alert(
        '未保存的内容',
        '您有未保存的内容，确定要返回吗？',
        [
          { text: '取消', style: 'cancel' },
          { text: '不保存并返回', onPress: () => {
            setShowTemplates(true);
            setGeneratedContent(null);
          }}
        ]
      );
    } else {
      setShowTemplates(true);
    }
  };

  const handleGenerate = async () => {
    if (!selectedTemplate || !inputText.trim()) {
      Alert.alert('提示', '请选择模板并输入内容');
      return;
    }

    setLoading(true);
    try {
      // 调用API生成内容
      const response = await apiService.writing.generateText(
        inputText, 
        selectedTemplate,
        {
          style: styleOption,
          length: lengthOption
        }
      );
      
      if (response && response.text) {
        setGeneratedContent(response.text);
        // 自动保存为草稿
        await saveDocument(response.text, true);
      } else {
        throw new Error('无法生成内容');
      }
    } catch (error) {
      console.error('生成内容失败:', error);
      Toast.show({
        type: 'error',
        text1: '生成失败',
        text2: '请检查您的网络连接并重试'
      });
    } finally {
      setLoading(false);
    }
  };

  const saveDocument = async (content: string, isDraft: boolean = false) => {
    if (!documentTitle.trim()) {
      Toast.show({
        type: 'info',
        text1: '请先输入文档标题'
      });
      return;
    }

    setIsSaving(true);
    try {
      // 如果有现有文档ID，则更新
      if (currentDocumentId) {
        await apiService.writing.updateDocument(
          currentDocumentId,
          {
            title: documentTitle,
            content: content,
            template_id: selectedTemplate,
            is_draft: isDraft
          }
        );
        Toast.show({
          type: 'success',
          text1: '文档已更新'
        });
      } else {
        // 否则创建新文档
        const result = await apiService.writing.saveDocument({
          title: documentTitle,
          content: content,
          template_id: selectedTemplate,
          is_draft: isDraft
        });
        if (result && result.id) {
          setCurrentDocumentId(result.id);
          Toast.show({
            type: 'success',
            text1: '文档已保存'
          });
          // 更新最近文档列表
          await loadRecentDocuments();
        }
      }
    } catch (error) {
      console.error('保存文档失败:', error);
      Toast.show({
        type: 'error',
        text1: '保存失败',
        text2: '请检查您的网络连接并重试'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    Alert.alert(
      '确认重置',
      '这将清除当前所有内容。您确定要重置吗？',
      [
        { text: '取消', style: 'cancel' },
        { text: '确认', onPress: () => {
          setInputText('');
          setSelectedTemplate(null);
          setGeneratedContent(null);
          setCurrentDocumentId(null);
          setDocumentTitle('');
          setShowTemplates(true);
        }}
      ]
    );
  };

  const copyToClipboard = async (text: string) => {
    try {
      await Clipboard.setStringAsync(text);
      Toast.show({
        type: 'success',
        text1: '已复制到剪贴板'
      });
    } catch (error) {
      console.error('复制失败:', error);
      Toast.show({
        type: 'error',
        text1: '复制失败'
      });
    }
  };

  const handlePolishText = async () => {
    if (!generatedContent) return;
    
    setLoading(true);
    try {
      const response = await apiService.writing.polishText(generatedContent, { style: styleOption });
      if (response && response.polished_text) {
        setGeneratedContent(response.polished_text);
        // 自动保存更新
        if (currentDocumentId) {
          await saveDocument(response.polished_text);
        }
        Toast.show({
          type: 'success',
          text1: '文本已优化'
        });
      }
    } catch (error) {
      console.error('优化文本失败:', error);
      Toast.show({
        type: 'error',
        text1: '优化失败',
        text2: '请稍后重试'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGrammarCheck = async () => {
    if (!generatedContent) return;
    
    setLoading(true);
    try {
      const response = await apiService.writing.checkGrammar(generatedContent);
      if (response && response.analysis) {
        const original = generatedContent;
        Toast.show({
          type: 'info',
          text1: '语法检查完成',
          text2: '请查看分析结果'
        });
        Alert.alert(
          '语法检查结果',
          response.analysis,
          [
            { text: '关闭', style: 'cancel' }
          ],
          { cancelable: true }
        );
      }
    } catch (error) {
      console.error('语法检查失败:', error);
      Toast.show({
        type: 'error',
        text1: '语法检查失败',
        text2: '请稍后重试'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadDocument = async (documentId: string) => {
    setLoading(true);
    try {
      const doc = await apiService.writing.getDocument(documentId);
      if (doc) {
        setCurrentDocumentId(doc.id);
        setDocumentTitle(doc.title);
        setSelectedTemplate(doc.template_id || null);
        setGeneratedContent(doc.content);
        setShowTemplates(false);
      }
    } catch (error) {
      console.error('加载文档失败:', error);
      Toast.show({
        type: 'error',
        text1: '加载文档失败',
        text2: '请稍后重试'
      });
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
          <View style={styles.actionButtonsContainer}>
            <Button
              title="润色优化"
              variant="secondary"
              size="medium"
              onPress={handlePolishText}
              style={styles.actionButton}
            />
            <Button
              title="语法检查"
              variant="secondary"
              size="medium"
              onPress={handleGrammarCheck}
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

        <Card title="写作助手简介" style={styles.card}>
          <Text style={styles.introText}>
            写作助手可以帮助您快速生成各类文本内容，包括邮件、报告、文章、社交媒体文案等。
            选择一个模板，输入您的需求，系统将为您生成高质量的内容。
            生成后，您还可以使用润色、语法检查等功能进一步优化文本。
          </Text>
        </Card>
      </>
    );
  };

  return (
    <ErrorBoundary>
      <ScreenContainer
        title="写作助手"
        backgroundColor={theme.colors.background}
        showBackButton
      >
        <ScrollView 
          style={styles.container}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <Text style={styles.title}>写作助手</Text>
          {renderContent()}
        </ScrollView>
        <Toast />
      </ScreenContainer>
    </ErrorBoundary>
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
    fontWeight: '500',
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
  introText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
    lineHeight: 22,
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
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
});

export default WritingAssistantScreen; 