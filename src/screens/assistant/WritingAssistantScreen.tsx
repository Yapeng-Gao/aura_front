import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, RefreshControl, Share } from 'react-native';
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
import Dropdown from '../../components/common/Dropdown';

// 缓存键
const TEMPLATES_CACHE_KEY = 'writing_templates_cache';
const RECENT_DOCS_CACHE_KEY = 'writing_recent_docs';
const SUGGESTIONS_CACHE_KEY = 'writing_suggestions_cache';

// 支持的语言
const SUPPORTED_LANGUAGES = [
  { label: '中文', value: 'zh' },
  { label: 'English', value: 'en' },
  { label: '日本語', value: 'ja' },
  { label: '한국어', value: 'ko' },
  { label: 'Español', value: 'es' },
  { label: 'Français', value: 'fr' },
];

// 关键词高亮正则表达式
const HIGHLIGHT_PATTERNS = {
  redundant: /(\b(事实上|实际上|确实|的确|显然|明显地|很明显|无疑|毫无疑问|众所周知|大家都知道)\b)/g,
  weak: /(\b(可能|也许|似乎|好像|或许|大概|看起来|应该|兴许|差不多)\b)/g,
  passive: /(被.+(?:了|的))/g,
  jargon: /(\b(赋能|抓手|闭环|打通|落地|沉淀|反哺|赛道|壁垒|对标|拉通|颗粒度|组合拳|差异化|去中心化|私域流量)\b)/g
};

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
  
  // 添加新的状态变量
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState('zh');
  const [isAutoSaveEnabled, setIsAutoSaveEnabled] = useState(true);
  const [highlightedContent, setHighlightedContent] = useState<string | null>(null);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const inputRef = useRef<TextInput>(null);
  const lastInputRef = useRef<string>('');
  
  // 从Redux获取用户信息
  const { user } = useAppSelector((state: any) => state.auth);

  // 使用useFocusEffect而不是useEffect以便每次屏幕获得焦点时刷新
  useFocusEffect(
    useCallback(() => {
      // 加载模板
      fetchTemplates();
      // 加载最近的文档
      loadRecentDocuments();
      // 加载保存的建议
      loadSavedSuggestions();
      // 加载用户偏好设置
      loadUserPreferences();
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

  const loadUserPreferences = async () => {
    try {
      const autoSavePref = await AsyncStorage.getItem('writing_autosave_pref');
      if (autoSavePref !== null) {
        setIsAutoSaveEnabled(JSON.parse(autoSavePref));
      }
      
      const langPref = await AsyncStorage.getItem('writing_language_pref');
      if (langPref) {
        setSelectedLanguage(langPref);
      }
    } catch (error) {
      console.error('加载用户偏好设置失败:', error);
    }
  };

  const saveUserPreferences = async () => {
    try {
      await AsyncStorage.setItem('writing_autosave_pref', JSON.stringify(isAutoSaveEnabled));
      await AsyncStorage.setItem('writing_language_pref', selectedLanguage);
    } catch (error) {
      console.error('保存用户偏好设置失败:', error);
    }
  };

  // 加载保存的建议
  const loadSavedSuggestions = async () => {
    try {
      const cachedSuggestions = await AsyncStorage.getItem(SUGGESTIONS_CACHE_KEY);
      if (cachedSuggestions) {
        setSuggestions(JSON.parse(cachedSuggestions));
      }
    } catch (error) {
      console.error('加载建议失败:', error);
    }
  };

  // 获取智能建议
  const getSuggestions = async (text: string) => {
    if (!text || text.length < 10) return;
    
    try {
      // 避免频繁API调用，使用简单的节流
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
      
      // 如果内容与上次相似度高，不再请求
      if (lastInputRef.current && similarity(text, lastInputRef.current) > 0.9) {
        return;
      }
      
      const newTimeout = setTimeout(async () => {
        const response = await apiService.writing.getSuggestions(text, selectedLanguage);
        if (response && response.suggestions) {
          setSuggestions(response.suggestions);
          await AsyncStorage.setItem(SUGGESTIONS_CACHE_KEY, JSON.stringify(response.suggestions));
          lastInputRef.current = text;
        }
      }, 1000);
      
      setTypingTimeout(newTimeout as unknown as NodeJS.Timeout);
    } catch (error) {
      console.error('获取建议失败:', error);
    }
  };

  // 计算文本相似度的简单函数
  const similarity = (s1: string, s2: string): number => {
    let longer = s1.length >= s2.length ? s1 : s2;
    let shorter = s1.length >= s2.length ? s2 : s1;
    
    if (longer.length === 0) {
      return 1.0;
    }
    
    return (longer.length - editDistance(longer, shorter)) / longer.length;
  };

  // 计算编辑距离
  const editDistance = (s1: string, s2: string): number => {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();
    
    const costs = [];
    for (let i = 0; i <= s1.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= s2.length; j++) {
        if (i === 0) {
          costs[j] = j;
        } else if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
      if (i > 0) {
        costs[s2.length] = lastValue;
      }
    }
    return costs[s2.length];
  };

  // 应用建议到输入
  const applySuggestion = (suggestion: string) => {
    setInputText(inputText + ' ' + suggestion);
    // 清除建议列表，避免用户被大量建议分散注意力
    setSuggestions([]);
  };

  // 高亮关键词
  const highlightKeywords = (text: string): React.ReactNode => {
    if (!text) return null;
    
    // 计算字数和阅读时间
    const words = text.trim().split(/\s+/).length;
    setWordCount(words);
    setReadingTime(Math.ceil(words / 200)); // 假设平均阅读速度为每分钟200词
    
    // 如果文本过长，先不处理高亮，避免性能问题
    if (text.length > 5000) return <Text style={styles.generatedContent}>{text}</Text>;
    
    let lastIndex = 0;
    const elements: React.ReactNode[] = [];
    
    // 处理每种高亮模式
    Object.entries(HIGHLIGHT_PATTERNS).forEach(([type, pattern]) => {
      const matches = Array.from(text.matchAll(pattern));
      matches.forEach(match => {
        const index = match.index || 0;
        if (index >= lastIndex) {
          // 添加非高亮部分
          elements.push(<Text key={`text-${lastIndex}`}>{text.substring(lastIndex, index)}</Text>);
          
          // 添加高亮部分
          const styleToApply = type === 'redundant' 
            ? styles.redundantHighlight 
            : type === 'weak' 
              ? styles.weakHighlight 
              : type === 'passive' 
                ? styles.passiveHighlight 
                : styles.jargonHighlight;
          
          elements.push(
            <Text key={`highlight-${index}`} style={styleToApply}>
              {match[0]}
            </Text>
          );
          
          lastIndex = index + match[0].length;
        }
      });
    });
    
    // 添加剩余部分
    if (lastIndex < text.length) {
      elements.push(<Text key={`text-${lastIndex}`}>{text.substring(lastIndex)}</Text>);
    }
    
    return elements.length > 0 ? elements : <Text>{text}</Text>;
  };

  // 处理输入变化
  const handleInputChange = (text: string) => {
    setInputText(text);
    
    // 获取智能建议
    getSuggestions(text);
    
    // 如果启用了自动保存
    if (isAutoSaveEnabled && currentDocumentId && text.trim().length > 0) {
      // 使用节流避免频繁保存
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
      
      const newTimeout = setTimeout(() => {
        saveDocument(text, true);
      }, 3000);
      
      setTypingTimeout(newTimeout as unknown as NodeJS.Timeout);
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
      // 调用API生成内容，添加语言参数
      const response = await apiService.writing.generateText(
        inputText, 
        selectedTemplate,
        {
          style: styleOption,
          length: lengthOption,
          language: selectedLanguage // 添加语言参数
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
            template_id: selectedTemplate || undefined,
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
          template_id: selectedTemplate || undefined,
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

  const exportAsText = async () => {
    if (!generatedContent) return;
    
    try {
      // 分享文本
      await Share.share({
        message: generatedContent,
        title: documentTitle || '写作助手导出文档'
      });
    } catch (error) {
      console.error('导出文件失败:', error);
      Toast.show({
        type: 'error',
        text1: '导出失败',
        text2: '请稍后重试'
      });
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
        <>
          <Card title={`生成的内容 (${wordCount}字 · 阅读时间约${readingTime}分钟)`} style={styles.card}>
            <ScrollView style={styles.generatedContentContainer}>
              <Text style={styles.generatedContent}>
                {highlightKeywords(generatedContent)}
              </Text>
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
                title="导出文档"
                variant="secondary"
                size="medium"
                onPress={exportAsText}
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
            <View style={styles.actionButtonsContainer}>
              <Button
                title="重新开始"
                variant="primary"
                size="medium"
                onPress={handleReset}
                style={styles.actionButton}
              />
            </View>
          </Card>
          
          <Card title="高亮说明" style={styles.card}>
            <View style={styles.highlightLegendContainer}>
              <View style={styles.highlightLegendItem}>
                <View style={[styles.highlightSample, styles.redundantHighlight]} />
                <Text style={styles.highlightLegendText}>冗余词语</Text>
              </View>
              <View style={styles.highlightLegendItem}>
                <View style={[styles.highlightSample, styles.weakHighlight]} />
                <Text style={styles.highlightLegendText}>模糊表达</Text>
              </View>
              <View style={styles.highlightLegendItem}>
                <View style={[styles.highlightSample, styles.passiveHighlight]} />
                <Text style={styles.highlightLegendText}>被动语态</Text>
              </View>
              <View style={styles.highlightLegendItem}>
                <View style={[styles.highlightSample, styles.jargonHighlight]} />
                <Text style={styles.highlightLegendText}>行业术语</Text>
              </View>
            </View>
          </Card>
        </>
      );
    }

    return (
      <>
        <Card title="写作语言" style={styles.card}>
          <Dropdown
            options={SUPPORTED_LANGUAGES}
            value={selectedLanguage}
            onValueChange={(value: string) => {
              setSelectedLanguage(value);
              saveUserPreferences();
            }}
            placeholder="选择语言"
            style={styles.dropdown}
          />
        </Card>
      
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
            ref={inputRef}
            style={styles.input}
            placeholder="请输入您的写作需求..."
            value={inputText}
            onChangeText={handleInputChange}
            multiline
            numberOfLines={4}
          />
          
          {suggestions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              <Text style={styles.suggestionsTitle}>智能建议:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {suggestions.map((suggestion, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.suggestionItem}
                    onPress={() => applySuggestion(suggestion)}
                  >
                    <Text style={styles.suggestionText}>{suggestion}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
          
          <View style={styles.optionsContainer}>
            <View style={styles.optionItem}>
              <Text style={styles.optionLabel}>风格:</Text>
              <Dropdown
                options={[
                  { label: '正式', value: 'formal' },
                  { label: '非正式', value: 'informal' },
                  { label: '专业', value: 'professional' },
                  { label: '创意', value: 'creative' },
                ]}
                value={styleOption}
                onValueChange={setStyleOption}
                placeholder="选择风格"
                style={styles.optionDropdown}
              />
            </View>
            
            <View style={styles.optionItem}>
              <Text style={styles.optionLabel}>篇幅:</Text>
              <Dropdown
                options={[
                  { label: '短', value: 'short' },
                  { label: '中', value: 'medium' },
                  { label: '长', value: 'long' },
                ]}
                value={lengthOption}
                onValueChange={setLengthOption}
                placeholder="选择篇幅"
                style={styles.optionDropdown}
              />
            </View>
          </View>
          
          <View style={styles.autoSaveContainer}>
            <Text style={styles.autoSaveText}>自动保存</Text>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                isAutoSaveEnabled ? styles.toggleButtonActive : {}
              ]}
              onPress={() => {
                setIsAutoSaveEnabled(!isAutoSaveEnabled);
                saveUserPreferences();
              }}
            >
              <View style={[
                styles.toggleThumb,
                isAutoSaveEnabled ? styles.toggleThumbActive : {}
              ]} />
            </TouchableOpacity>
          </View>
          
          <Button
            title="生成内容"
            variant="primary"
            size="medium"
            onPress={handleGenerate}
            disabled={!inputText.trim() || !selectedTemplate}
            style={styles.generateButton}
          />
        </Card>

        <Card title="最近文档" style={styles.card}>
          {recentDocuments.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recentDocsContainer}>
              {recentDocuments.map((doc) => (
                <TouchableOpacity
                  key={doc.id}
                  style={styles.recentDocItem}
                  onPress={() => loadDocument(doc.id)}
                >
                  <Text style={styles.recentDocTitle}>{doc.title}</Text>
                  <Text style={styles.recentDocDate}>{new Date(doc.updated_at).toLocaleDateString()}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.emptyText}>暂无最近文档</Text>
          )}
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
  suggestionsContainer: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  suggestionsTitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  suggestionItem: {
    backgroundColor: `${theme.colors.primary}15`,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  suggestionText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.md,
  },
  optionItem: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
  },
  optionLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  optionDropdown: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.sm,
  },
  autoSaveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: theme.spacing.md,
  },
  autoSaveText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginRight: theme.spacing.sm,
  },
  toggleButton: {
    width: 50,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.border,
    padding: 2,
  },
  toggleButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.colors.white,
    position: 'absolute',
    left: 2,
    top: 2,
  },
  toggleThumbActive: {
    left: 28,
  },
  recentDocsContainer: {
    flexDirection: 'row',
  },
  recentDocItem: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginRight: theme.spacing.md,
    width: 160,
  },
  recentDocTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: '500',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  recentDocDate: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  emptyText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  dropdown: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  highlightLegendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  highlightLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginBottom: theme.spacing.sm,
  },
  highlightSample: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: theme.spacing.xs,
  },
  highlightLegendText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  redundantHighlight: {
    backgroundColor: '#FFD6D6',
    color: '#D32F2F',
  },
  weakHighlight: {
    backgroundColor: '#FFF9C4',
    color: '#F57F17',
  },
  passiveHighlight: {
    backgroundColor: '#BBDEFB',
    color: '#1976D2',
  },
  jargonHighlight: {
    backgroundColor: '#E1BEE7',
    color: '#7B1FA2',
  },
});

export default WritingAssistantScreen; 