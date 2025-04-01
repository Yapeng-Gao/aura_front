import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import ScreenContainer from '../../components/common/ScreenContainer';
import Button from '../../components/common/Button';
import InputField from '../../components/common/InputField';
import theme from '../../theme';

const ForgotPasswordScreen: React.FC = () => {
  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState(false);

  const handleResetPassword = () => {
    // 简单的表单验证
    if (!email) {
      setError('请输入您的邮箱');
      return;
    }
    
    setLoading(true);
    setError('');
    
    // 模拟重置密码请求
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      // 这里将来会集成实际的重置密码API
    }, 1500);
  };

  return (
    <ScreenContainer
      scrollable={true}
      paddingHorizontal={true}
      backgroundColor={theme.colors.background}
    >
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../../assets/images/logo-placeholder.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>Aura</Text>
          <Text style={styles.tagline}>找回您的密码</Text>
        </View>

        {!success ? (
          <View style={styles.formContainer}>
            <Text style={styles.instructionText}>
              请输入您注册时使用的邮箱，我们将向您发送重置密码的链接。
            </Text>

            <InputField
              label="邮箱"
              placeholder="请输入您的邮箱"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Button
              title="发送重置链接"
              onPress={handleResetPassword}
              variant="primary"
              size="large"
              loading={loading}
              fullWidth={true}
              style={styles.resetButton}
            />
          </View>
        ) : (
          <View style={styles.successContainer}>
            <Text style={styles.successTitle}>邮件已发送</Text>
            <Text style={styles.successText}>
              重置密码的链接已发送到您的邮箱，请查收并按照邮件中的指示操作。
            </Text>
            <Button
              title="返回登录"
              onPress={() => {/* 导航到登录页面 */}}
              variant="primary"
              size="large"
              fullWidth={true}
              style={styles.backButton}
            />
          </View>
        )}

        <View style={styles.footer}>
          <Button
            title="返回登录"
            onPress={() => {/* 导航到登录页面 */}}
            variant="text"
            size="medium"
          />
        </View>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: theme.spacing.md,
  },
  appName: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  tagline: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
  },
  formContainer: {
    marginBottom: theme.spacing.xl,
  },
  instructionText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  resetButton: {
    marginTop: theme.spacing.lg,
  },
  successContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
  },
  successTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.success,
    marginBottom: theme.spacing.md,
  },
  successText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  backButton: {
    marginTop: theme.spacing.md,
  },
  footer: {
    alignItems: 'center',
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.typography.fontSize.sm,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
});

export default ForgotPasswordScreen;
