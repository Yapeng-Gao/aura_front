import React from 'react';
import { ScrollView, Text, StyleSheet } from 'react-native';
import ScreenContainer from '../../components/common/ScreenContainer';
import theme from '../../theme';

const TermsOfServiceScreen: React.FC = () => {
  return (
    <ScreenContainer
      title="服务条款"
      backgroundColor={theme.colors.background}
    >
      <ScrollView style={styles.container}>
        <Text style={styles.title}>服务条款</Text>
        <Text style={styles.lastUpdated}>最后更新: 2023年4月1日</Text>
        
        <Text style={styles.paragraph}>
          请仔细阅读这些条款和条件，它们规定了您访问和使用Aura智能生活助手应用程序（以下简称"Aura"或"应用"）的条款。通过下载、安装或使用Aura，您同意受这些条款的约束。如果您不同意这些条款，请不要下载、安装或使用应用。
        </Text>
        
        <Text style={styles.sectionTitle}>1. 账户注册与安全</Text>
        <Text style={styles.paragraph}>
          使用Aura的某些功能可能需要您创建一个账户。您需要提供准确、完整的信息，并在信息变更时进行更新。您负责维护您账户的保密性，并对通过您的账户进行的所有活动负责。您同意立即通知我们任何未经授权使用您账户的情况。
        </Text>
        
        <Text style={styles.sectionTitle}>2. 使用许可</Text>
        <Text style={styles.paragraph}>
          在您遵守这些条款的前提下，我们授予您有限的、非独占的、不可转让的许可，允许您在您拥有或控制的设备上下载、安装和使用应用程序。此许可仅用于您的个人、非商业用途。
        </Text>
        
        <Text style={styles.sectionTitle}>3. 使用限制</Text>
        <Text style={styles.paragraph}>
          您同意不会：
        </Text>
        <Text style={styles.bulletPoint}>• 以任何方式修改、改编或更改应用程序</Text>
        <Text style={styles.bulletPoint}>• 删除或更改应用程序中的任何版权、商标或其他专有权利通知</Text>
        <Text style={styles.bulletPoint}>• 使用应用程序创建或传播恶意内容</Text>
        <Text style={styles.bulletPoint}>• 尝试通过任何手段规避应用程序的技术措施</Text>
        <Text style={styles.bulletPoint}>• 使用爬虫、机器人或其他自动手段访问应用程序</Text>
        <Text style={styles.bulletPoint}>• 干扰或中断应用程序的服务器或网络</Text>
        
        <Text style={styles.sectionTitle}>4. 内容与隐私</Text>
        <Text style={styles.paragraph}>
          您理解通过使用应用程序，您可能会遇到可能被视为冒犯性、不雅或令人反感的内容。我们不对任何用户生成的内容负责。您对通过应用程序提交、发布或展示的任何内容负全部责任。
        </Text>
        <Text style={styles.paragraph}>
          我们尊重您的隐私。我们的隐私政策解释了我们如何收集、使用和共享您的信息。
        </Text>
        
        <Text style={styles.sectionTitle}>5. 第三方服务</Text>
        <Text style={styles.paragraph}>
          应用程序可能包含链接到第三方网站或服务的链接。这些链接仅为方便您而提供，我们不控制这些网站或服务的内容、隐私政策或做法，也不为其背书。
        </Text>
        
        <Text style={styles.sectionTitle}>6. 知识产权</Text>
        <Text style={styles.paragraph}>
          应用程序及其全部内容、功能和外观归我们或我们的许可方所有，受国际版权、商标、专利、商业秘密和其他知识产权或专有权利法律的保护。保留所有权利。
        </Text>
        
        <Text style={styles.sectionTitle}>7. 免责声明</Text>
        <Text style={styles.paragraph}>
          应用程序"按原样"和"按可用性"提供，不作任何明示或暗示的保证。我们不保证应用程序将满足您的要求，或不会中断，或没有错误，或缺陷将被纠正。
        </Text>
        
        <Text style={styles.sectionTitle}>8. 责任限制</Text>
        <Text style={styles.paragraph}>
          在适用法律允许的最大范围内，我们不对因使用或无法使用应用程序而导致的任何直接、间接、偶然、特殊、示范性或后果性损害负责。
        </Text>
        
        <Text style={styles.sectionTitle}>9. 条款变更</Text>
        <Text style={styles.paragraph}>
          我们保留随时修改这些条款的权利。如果我们进行重大更改，我们将通过应用程序或向您发送电子邮件通知您。您在这些更改后继续使用应用程序构成对修订条款的接受。
        </Text>
        
        <Text style={styles.sectionTitle}>10. 适用法律</Text>
        <Text style={styles.paragraph}>
          这些条款受中华人民共和国法律管辖，不考虑法律冲突原则。
        </Text>
        
        <Text style={styles.sectionTitle}>11. 联系我们</Text>
        <Text style={styles.paragraph}>
          如果您对这些条款有任何问题，请联系我们：
        </Text>
        <Text style={styles.contactInfo}>电子邮件：legal@aura-app.com</Text>
        <Text style={styles.contactInfo}>地址：北京市海淀区科学院南路2号</Text>
        
        <Text style={styles.footer}>
          通过使用Aura，您确认您已阅读、理解并同意受这些服务条款的约束。
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

export default TermsOfServiceScreen; 