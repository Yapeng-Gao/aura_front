import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, Image, Alert, ImageStyle } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import ScreenContainer from '../../components/common/ScreenContainer';
import apiService from '../../services/api'; // 确认路径是否正确
import { AuthStackParamList } from '../../navigation/types';
import InputField from '../../components/common/InputField';
import Button from '../../components/common/Button';
import theme from '../../theme';
import axios, { AxiosError } from 'axios'; // 引入 AxiosError
import { useTranslation } from 'react-i18next';

type RegisterScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Register'>;

// --- 定义后端成功注册响应中 `data` 字段的预期结构 (可选) ---
// --- 注册成功后后端可能只返回一个简单的消息，或者新创建的用户信息 ---
// --- 根据你后端接口实际返回的数据调整此接口，如果只返回成功状态码，可以不定义 ---
interface RegisterResponseData {
  message?: string; // 例如 "用户创建成功"
  data?: {         // 或者返回新用户的信息
    user_id: string | number;
    username: string;
    email: string;
    // ...
  };
  // 根据实际情况添加其他可能的字段
}

// --- 定义后端错误响应的结构 (复用之前的定义) ---
interface ApiErrorResponse {
  status?: string;
  code?: number;
  message?: string;
  errors?: Array<{ code: string; field?: string; message: string }>;
}

interface Props {
  navigation: RegisterScreenNavigationProp;
}

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [username, setUsername] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const { t } = useTranslation();

  const validateEmail = (email: string) => {
    // 基本的邮箱格式校验 (可选，但推荐)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    // 密码必须至少8个字符，包含大小写字母、数字和特殊字符
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@.$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleRegister = async () => {
    if (!username || !email || !password || !confirmPassword) {
      setError(t('register.requiredFields'));
      return;
    }

    if (!validateEmail(email)) {
      setError(t('register.invalidEmail'));
      return;
    }

    if (!validatePassword(password)) {
      setError(t('register.passwordRequirements'));
      return;
    }

    if (password !== confirmPassword) {
      setError(t('register.passwordsDontMatch'));
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await apiService.post('/auth/register', {
        username,
        email,
        password,
      });
      console.log(response.data);
      if (response.data.code === 200) {
        // 注册成功，跳转到登录页面
        navigation.navigate('Login');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || t('register.error'));
    } finally {
      setLoading(false);
    }
  };

  // --- 组件的 JSX 结构基本保持不变 ---
  // --- 确保 Button 的 onPress 和 loading 属性绑定正确 ---
  // --- 确保 Button 添加了 disabled={loading} ---
  // --- 为 "立即登录" 按钮的 onPress 添加导航逻辑 (或注释占位符) ---
  return (
      <ScreenContainer
        title={t('auth.register')}
        backgroundColor={theme.colors.background}
        hideHeader={false}
      >
        <View style={styles.container}>
          <View style={styles.logoContainer}>
            <Image
                source={require('../../../assets/images/register.png')}
                style={styles.logo as ImageStyle}
                resizeMode="contain"
            />
          </View>

          {/* 表单 */}
          <View style={styles.formContainer}>
            <InputField
                label="用户名"
                placeholder="请输入用户名"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none" // 用户名通常不需要自动大写
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
                placeholder="请输入密码 (至少6位)" // 提示用户密码要求
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

            {/* 显示错误信息 */}
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Button
                title="注册"
                onPress={handleRegister} // 使用更新后的异步函数
                variant="primary"
                size="large"
                loading={loading} // 绑定加载状态
                fullWidth={true}
                style={styles.registerButton}
                disabled={loading} // 请求时禁用按钮
            />
          </View>

          {/* 页脚 */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>已有账号？</Text>
            <Button
                title="立即登录"
                onPress={() => {
                  navigation.navigate('Login');
                  console.log('应导航到登录页面');
                }}
                variant="text"
                size="medium"
                style={styles.loginButton}
                disabled={loading} // 注册进行中时也可禁用 (可选)
            />
          </View>

          {/* 服务条款 */}
          <View style={styles.termsContainer}>
            <Text style={styles.termsText}>
              注册即表示您同意我们的
              <Text style={styles.termsLink} onPress={() => Alert.alert('提示', '应打开服务条款页面')}> 服务条款 </Text>
              和
              <Text style={styles.termsLink} onPress={() => Alert.alert('提示', '应打开隐私政策页面')}> 隐私政策</Text>
            </Text>
          </View>
        </View>
      </ScreenContainer>
  );
};

// --- 样式 (styles) 保持不变 ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  logo: {
    width: 120,
    height: 120,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: theme.spacing.lg,
    color: theme.colors.textPrimary,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: 'normal',
    marginBottom: theme.spacing.xl,
    color: theme.colors.textSecondary,
  },
  formContainer: {
    marginBottom: theme.spacing.xl, // 表单和页脚间距
  },
  registerButton: {
    marginTop: theme.spacing.lg, // 确认密码和注册按钮间距
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg, // 页脚和服务条款间距
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
    paddingHorizontal: theme.spacing.xl, // 左右留白
  },
  termsText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: theme.typography.fontSize.sm * 1.5, // 增加行高使链接更易点击
  },
  termsLink: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.medium, // 让链接稍微突出
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.typography.fontSize.sm,
    marginTop: theme.spacing.xs, // 错误信息与下方按钮间距
    marginBottom: theme.spacing.sm, // 错误信息与下方按钮间距
    textAlign: 'center',
  },
});

export default RegisterScreen;