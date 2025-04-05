import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ScreenContainer from '../../components/common/ScreenContainer';
import theme from '../../theme';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

// FAQ项目类型
interface FAQItem {
  id: string;
  question: string;
  answer: string;
  expanded: boolean;
}

const HelpCenterScreen: React.FC = () => {
  const navigation = useNavigation();
  
  // 常见问题列表
  const [faqs, setFaqs] = useState<FAQItem[]>([
    {
      id: '1',
      question: '如何创建我的第一个笔记？',
      answer: '点击效率标签，选择"笔记"功能，然后点击右下角的"+"按钮创建新笔记。您可以添加标题、内容、标签，并选择保存位置。',
      expanded: false
    },
    {
      id: '2',
      question: '如何连接智能设备？',
      answer: '进入"物联网"标签，点击"添加设备"，然后按照向导进行操作。确保您的设备已开启并处于配对模式。支持的设备列表可在设置中查看。',
      expanded: false
    },
    {
      id: '3',
      question: '如何设置会议提醒？',
      answer: '在"效率"标签中选择"日历"，创建新事件并选择"会议"类型。您可以设置提醒时间、邀请参与者，并启用自动记录功能。',
      expanded: false
    },
    {
      id: '4',
      question: '我的数据是如何保护的？',
      answer: 'Aura采用端到端加密保护您的个人数据。所有敏感信息都经过加密存储，且不会与第三方共享。您可以在"设置"中查看和管理您的数据权限。',
      expanded: false
    },
    {
      id: '5',
      question: '如何升级到专业版？',
      answer: '前往"我的"页面，点击"会员升级"。您可以查看不同会员等级的功能比较，并选择最适合您需求的套餐进行订阅。',
      expanded: false
    }
  ]);

  // 切换FAQ展开状态
  const toggleFAQ = (id: string) => {
    setFaqs(faqs.map(faq => 
      faq.id === id ? { ...faq, expanded: !faq.expanded } : faq
    ));
  };

  return (
    <ScreenContainer
      title="帮助中心"
      backgroundColor={theme.colors.background}
    >
      <ScrollView style={styles.container}>
        <Text style={styles.sectionTitle}>常见问题</Text>
        
        <View style={styles.faqContainer}>
          {faqs.map(faq => (
            <TouchableOpacity 
              key={faq.id} 
              style={styles.faqItem}
              onPress={() => toggleFAQ(faq.id)}
              activeOpacity={0.7}
            >
              <View style={styles.faqHeader}>
                <Text style={styles.faqQuestion}>{faq.question}</Text>
                <Icon 
                  name={faq.expanded ? 'chevron-up' : 'chevron-down'} 
                  size={24} 
                  color={theme.colors.primary} 
                />
              </View>
              
              {faq.expanded && (
                <Text style={styles.faqAnswer}>{faq.answer}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
        
        <Text style={styles.sectionTitle}>联系我们</Text>
        
        <Card style={styles.contactCard}>
          <View style={styles.contactItem}>
            <Icon name="email-outline" size={24} color={theme.colors.primary} />
            <View style={styles.contactInfo}>
              <Text style={styles.contactTitle}>电子邮件</Text>
              <Text style={styles.contactValue}>support@aura-app.com</Text>
            </View>
          </View>
          
          <View style={styles.contactItem}>
            <Icon name="phone-outline" size={24} color={theme.colors.primary} />
            <View style={styles.contactInfo}>
              <Text style={styles.contactTitle}>客服热线</Text>
              <Text style={styles.contactValue}>400-888-8888</Text>
              <Text style={styles.contactNote}>工作时间：周一至周五 9:00-18:00</Text>
            </View>
          </View>
          
          <View style={styles.contactItem}>
            <Icon name="wechat" size={24} color={theme.colors.primary} />
            <View style={styles.contactInfo}>
              <Text style={styles.contactTitle}>微信公众号</Text>
              <Text style={styles.contactValue}>Aura智能助手</Text>
            </View>
          </View>
        </Card>
        
        <Button
          title="提交反馈"
          variant="outline"
          size="large"
          onPress={() => console.log('提交反馈')}
          style={styles.feedbackButton}
        />
        
        <Button
          title="查看用户手册"
          variant="text"
          size="medium"
          onPress={() => console.log('查看用户手册')}
          style={styles.manualButton}
        />
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  faqContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
  },
  faqItem: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: '500',
    color: theme.colors.textPrimary,
    flex: 1,
  },
  faqAnswer: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
    lineHeight: 22,
  },
  contactCard: {
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.md,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  contactInfo: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  contactTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: '500',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  contactValue: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
  },
  contactNote: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    opacity: 0.7,
    marginTop: theme.spacing.xs,
  },
  feedbackButton: {
    marginBottom: theme.spacing.md,
  },
  manualButton: {
    marginBottom: theme.spacing.xxl,
  },
});

export default HelpCenterScreen; 