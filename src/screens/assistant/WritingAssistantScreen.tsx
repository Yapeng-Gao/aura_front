import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import ScreenContainer from '../../components/common/ScreenContainer';
import Card from '../../components/common/Card';
import theme from '../../theme';
import Button from '../../components/common/Button';
import apiService from '../../services/api';

const WritingAssistantScreen: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const templates = [
    {
      id: 'email',
      title: '邮件模板',
      description: '生成专业的商务邮件',
      icon: '📧',
      prompt: '请帮我撰写一封商务邮件，主题是：',
    },
    {
      id: 'report',
      title: '报告模板',
      description: '生成工作报告和总结',
      icon: '📊',
      prompt: '请帮我撰写一份工作报告，关于：',
    },
    {
      id: 'proposal',
      title: '提案模板',
      description: '生成项目提案和计划',
      icon: '📝',
      prompt: '请帮我撰写一份项目提案，关于：',
    },
    {
      id: 'social',
      title: '社交媒体',
      description: '生成社交媒体文案',
      icon: '📱',
      prompt: '请帮我撰写一条社交媒体文案，关于：',
    },
  ];

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    // 清除之前生成的内容
    setGeneratedContent(null);
  };

  const getTemplatePrompt = () => {
    if (!selectedTemplate) return '';
    const template = templates.find(t => t.id === selectedTemplate);
    return template ? template.prompt : '';
  };

  const handleGenerate = async () => {
    if (!selectedTemplate || !inputText.trim()) {
      Alert.alert('提示', '请选择模板并输入内容');
      return;
    }

    setLoading(true);
    try {
      // 获取模板提示词
      const templatePrompt = getTemplatePrompt();
      const prompt = `${templatePrompt}${inputText}`;
      
      // 调用API生成内容
      const response = await apiService.creative.generateText(prompt);
      
      if (response && response.text) {
        setGeneratedContent(response.text);
      } else {
        throw new Error('无法生成内容');
      }
    } catch (error) {
      console.error('生成内容失败:', error);
      Alert.alert('错误', '生成内容失败，请稍后重试');
      
      // 设置模拟生成的内容（仅为演示）
      const mockGeneratedContent = getMockContent();
      setGeneratedContent(mockGeneratedContent);
    } finally {
      setLoading(false);
    }
  };
  
  const getMockContent = () => {
    switch(selectedTemplate) {
      case 'email':
        return `尊敬的客户：\n\n感谢您对我们产品的关注和支持。关于您提到的${inputText}，我们非常重视并已安排专人进行处理。\n\n我们的团队将在24小时内给您详细的解决方案，如有任何疑问，请随时联系我。\n\n此致\n敬礼\n奥拉科技 客户服务部`;
      
      case 'report':
        return `${inputText}工作报告\n\n一、项目背景\n本报告总结了过去一个月在${inputText}方面的工作进展、遇到的挑战以及后续计划。\n\n二、工作内容\n1. 完成了需求分析和用户调研\n2. 制定了详细的项目计划\n3. 初步完成了原型设计\n\n三、存在问题\n1. 项目时间较紧\n2. 资源配置需要优化\n\n四、下一步计划\n1. 完成设计评审\n2. 开始开发工作\n3. 进行初步测试`;
      
      case 'proposal':
        return `${inputText}项目提案\n\n一、项目背景\n随着市场需求的变化，我们提出${inputText}项目，旨在解决当前行业面临的挑战。\n\n二、项目目标\n1. 提高用户满意度20%\n2. 降低运营成本15%\n3. 扩大市场份额10%\n\n三、实施计划\n1. 第一阶段（1-2月）：需求分析与设计\n2. 第二阶段（3-4月）：开发与测试\n3. 第三阶段（5-6月）：部署与推广\n\n四、预期收益\n该项目预计投资回报率为150%，将显著提升公司竞争力。`;
      
      case 'social':
        return `#${inputText}# 想要提升生活品质？奥拉智能家居新品发布，让科技融入生活的每一个角落！即日起购买任意产品，立享8折优惠，更有机会赢取智能音箱！💫 详情请关注我们的官方网站 aura.tech`;
      
      default:
        return `关于${inputText}的内容已生成完毕。这里是生成的详细内容，包含了您需要的所有信息和建议。希望这对您有所帮助！`;
    }
  };

  const handleReset = () => {
    setInputText('');
    setSelectedTemplate(null);
    setGeneratedContent(null);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>正在生成内容...</Text>
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
              onPress={() => {
                // 实际应用中应该调用剪贴板API
                Alert.alert('成功', '内容已复制到剪贴板');
              }}
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