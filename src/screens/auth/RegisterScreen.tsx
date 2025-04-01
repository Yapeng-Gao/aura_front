import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import ScreenContainer from '../../components/common/ScreenContainer';
import Button from '../../components/common/Button';
import InputField from '../../components/common/InputField';
import theme from '../../theme';

const RegisterScreen: React.FC = () => {
  const [username, setUsername] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleRegister = () => {
    // 简单的表单验证
    if (!username || !email || !password || !confirmPassword) {
      setError('请填写所有必填字段');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }
    
    setLoading(true);
    setError('');
    
    // 模拟注册请求
    setTimeout(() => {
      setLoading(false);
      // 这里将来会集成实际的注册API
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
          <Text style={styles.tagline}>创建您的账户</Text>
        </View>

        <View style={styles.formContainer}>
          <InputField
            label="用户名"
            placeholder="请输入用户名"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />

          <InputField
            label="邮箱"
            placeholder="请输入您的邮箱"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <InputField
            label="密码"
            placeholder="请输入密码"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
          />

          <InputField
            label="确认密码"
            placeholder="请再次输入密码"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={true}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Button
            title="注册"
            onPress={handleRegister}
            variant="primary"
            size="large"
            loading={loading}
            fullWidth={true}
            style={styles.registerButton}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>已有账号？</Text>
          <Button
            title="立即登录"
            onPress={() => {/* 导航到登录页面 */}}
            variant="text"
            size="medium"
            style={styles.loginButton}
          />
        </View>

        <View style={styles.termsContainer}>
          <Text style={styles.termsText}>
            注册即表示您同意我们的
            <Text style={styles.termsLink}> 服务条款 </Text>
            和
            <Text style={styles.termsLink}> 隐私政策</Text>
          </Text>
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
    marginBottom: theme.spacing.xl,
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
  registerButton: {
    marginTop: theme.spacing.lg,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  footerText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
    marginRight: theme.spacing.sm,
  },
  loginButton: {
    marginLeft: theme.spacing.xs,
  },
  termsContainer: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  termsText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  termsLink: {
    color: theme.colors.primary,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.typography.fontSize.sm,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
});

export default RegisterScreen;
