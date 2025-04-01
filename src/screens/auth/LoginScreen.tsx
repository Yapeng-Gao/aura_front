import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import ScreenContainer from '../../components/common/ScreenContainer';
import Button from '../../components/common/Button';
import InputField from '../../components/common/InputField';
import theme from '../../theme';

const LoginScreen: React.FC = () => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleLogin = () => {
    setLoading(true);
    setError('');
    
    // 模拟登录请求
    setTimeout(() => {
      setLoading(false);
      // 这里将来会集成实际的登录API
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
          <Text style={styles.tagline}>您的智能生活助手</Text>
        </View>

        <View style={styles.formContainer}>
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
            placeholder="请输入您的密码"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Button
            title="登录"
            onPress={handleLogin}
            variant="primary"
            size="large"
            loading={loading}
            fullWidth={true}
            style={styles.loginButton}
          />

          <Button
            title="忘记密码？"
            onPress={() => {/* 导航到忘记密码页面 */}}
            variant="text"
            size="medium"
            style={styles.forgotPasswordButton}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>还没有账号？</Text>
          <Button
            title="立即注册"
            onPress={() => {/* 导航到注册页面 */}}
            variant="outline"
            size="medium"
            style={styles.registerButton}
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
    width: 100,
    height: 100,
    marginBottom: theme.spacing.md,
  },
  appName: {
    fontSize: theme.typography.fontSize.xxxl,
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
  loginButton: {
    marginTop: theme.spacing.lg,
  },
  forgotPasswordButton: {
    alignSelf: 'center',
    marginTop: theme.spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
    marginRight: theme.spacing.sm,
  },
  registerButton: {
    marginLeft: theme.spacing.xs,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.typography.fontSize.sm,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
});

export default LoginScreen;
