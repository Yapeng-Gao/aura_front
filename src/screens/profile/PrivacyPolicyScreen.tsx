import React from 'react';
import { ScrollView, Text, StyleSheet } from 'react-native';
import ScreenContainer from '../../components/common/ScreenContainer';
import theme from '../../theme';

const PrivacyPolicyScreen: React.FC = () => {
  return (
    <ScreenContainer
      title="隐私政策"
      backgroundColor={theme.colors.background}
    >
      <ScrollView style={styles.container}>
        <Text style={styles.title}>隐私政策</Text>
        <Text style={styles.lastUpdated}>最后更新: 2023年4月1日</Text>
        
        <Text style={styles.sectionTitle}>1. 信息收集</Text>
        <Text style={styles.paragraph}>
          我们收集的个人信息类型取决于您如何使用Aura应用。当您使用我们的服务时，我们可能会收集以下类型的信息：
        </Text>
        <Text style={styles.bulletPoint}>• 账户信息：当您创建Aura账户时，我们会收集您的姓名、电子邮件地址、电话号码和密码。</Text>
        <Text style={styles.bulletPoint}>• 个人资料信息：您选择在个人资料中提供的任何信息，如头像、个人简介等。</Text>
        <Text style={styles.bulletPoint}>• 设备信息：我们会收集有关您使用的设备的信息，包括硬件型号、操作系统版本、唯一设备标识符和网络信息。</Text>
        <Text style={styles.bulletPoint}>• 使用数据：我们收集有关您如何使用Aura的信息，如您访问的功能、您的交互方式以及您花费的时间。</Text>
        <Text style={styles.bulletPoint}>• 语音数据：当您使用语音助手功能时，我们会临时处理您的语音数据以提供服务。</Text>
        
        <Text style={styles.sectionTitle}>2. 信息使用</Text>
        <Text style={styles.paragraph}>
          我们使用收集的信息来：
        </Text>
        <Text style={styles.bulletPoint}>• 提供、维护和改进我们的服务</Text>
        <Text style={styles.bulletPoint}>• 开发新的服务和功能</Text>
        <Text style={styles.bulletPoint}>• 了解您如何使用我们的服务</Text>
        <Text style={styles.bulletPoint}>• 个性化您的体验</Text>
        <Text style={styles.bulletPoint}>• 与您沟通</Text>
        
        <Text style={styles.sectionTitle}>3. 信息共享</Text>
        <Text style={styles.paragraph}>
          我们不会出售您的个人信息。我们可能在以下情况下共享您的信息：
        </Text>
        <Text style={styles.bulletPoint}>• 经您同意</Text>
        <Text style={styles.bulletPoint}>• 与我们的服务提供商</Text>
        <Text style={styles.bulletPoint}>• 出于法律原因</Text>
        <Text style={styles.bulletPoint}>• 在业务转让的情况下</Text>
        
        <Text style={styles.sectionTitle}>4. 数据安全</Text>
        <Text style={styles.paragraph}>
          我们采取技术和组织措施来保护您的个人信息免受丢失、滥用和未经授权的访问、披露、更改和破坏。
        </Text>
        
        <Text style={styles.sectionTitle}>5. 您的权利</Text>
        <Text style={styles.paragraph}>
          根据您所在地区的适用法律，您可能拥有以下权利：
        </Text>
        <Text style={styles.bulletPoint}>• 访问您的个人信息</Text>
        <Text style={styles.bulletPoint}>• 更正不准确的信息</Text>
        <Text style={styles.bulletPoint}>• 删除您的信息</Text>
        <Text style={styles.bulletPoint}>• 限制或反对处理</Text>
        <Text style={styles.bulletPoint}>• 数据可携带性</Text>
        
        <Text style={styles.sectionTitle}>6. 联系我们</Text>
        <Text style={styles.paragraph}>
          如果您对我们的隐私政策有任何问题或疑虑，请联系我们：
        </Text>
        <Text style={styles.contactInfo}>电子邮件：privacy@aura-app.com</Text>
        <Text style={styles.contactInfo}>地址：北京市海淀区科学院南路2号</Text>
        
        <Text style={styles.footer}>
          我们可能会不时更新此隐私政策。我们会通过在此页面上发布新的隐私政策来通知您任何更改。
        </Text>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  lastUpdated: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.md,
  },
  paragraph: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textPrimary,
    lineHeight: 22,
    marginBottom: theme.spacing.md,
  },
  bulletPoint: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textPrimary,
    lineHeight: 22,
    marginBottom: theme.spacing.sm,
    paddingLeft: theme.spacing.md,
  },
  contactInfo: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  footer: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.xxl,
    fontStyle: 'italic',
  },
});

export default PrivacyPolicyScreen; 