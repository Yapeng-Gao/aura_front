import React from 'react';
import { View, Text, StyleSheet, Image, Alert } from 'react-native'; // 引入 Alert
import axios, { AxiosError } from 'axios'; // 引入 AxiosError

// --- 导入你的 API 服务 ---
// 注意：注册通常不需要 AUTH_TOKEN_KEY 或 REFRESH_TOKEN_KEY，因为用户此时还没有令牌
import apiService from '../../utils/api'; // 确认路径是否正确

import ScreenContainer from '../../components/common/ScreenContainer';
import Button from '../../components/common/Button';
import InputField from '../../components/common/InputField';
import theme from '../../theme';
// import { useNavigation } from '@react-navigation/native'; // 如果你使用了导航库

// --- 定义后端成功注册响应中 `data` 字段的预期结构 (可选) ---
// --- 注册成功后后端可能只返回一个简单的消息，或者新创建的用户信息 ---
// --- 根据你后端接口实际返回的数据调整此接口，如果只返回成功状态码，可以不定义 ---
interface RegisterResponseData {
  message?: string; // 例如 "用户创建成功"
  user?: {         // 或者返回新用户的信息
    id: string | number;
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


const RegisterScreen: React.FC = () => {
  const [username, setUsername] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  // const navigation = useNavigation(); // 获取导航对象

  const handleRegister = async () => { // 标记为 async
    // --- 前端表单验证 (保留) ---
    if (!username || !email || !password || !confirmPassword) {
      setError('请填写所有必填字段');
      return;
    }
    // 基本的邮箱格式校验 (可选，但推荐)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('请输入有效的邮箱地址');
      return;
    }
    // 密码强度校验 (可选，建议在后端做更严格的校验)
    if (password.length < 6) { // 示例：最小长度为6
      setError('密码长度至少为6位');
      return;
    }
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }
    // --- 结束前端验证 ---

    setLoading(true);
    setError('');

    try {
      // --- 使用 apiService.post 发起注册请求 ---
      // 传递注册接口的路径 (相对于 api.ts 中 baseURL 的路径)
      // 传递包含注册信息的对象 { username, email, password }
      // **注意：通常不需要发送 confirmPassword 到后端**
      // 这里的 <RegisterResponseData> 是可选的，取决于你是否需要处理成功响应中的具体数据
      const responseData = await apiService.post<RegisterResponseData>(
          '/auth/register', // <-- 确认你的注册接口路径是否为此，如果不同请修改
          {
            username: username,
            email: email,
            password: password,
          }
      );

      // --- 注册成功 ---
      console.log('注册成功:', responseData); // responseData 可能是 undefined 或包含 { message: ... } 等

      // 1. 显示成功提示
      Alert.alert(
          '注册成功',
          responseData?.message || '您的账户已创建成功，请登录。', // 使用后端返回的消息或默认消息
          [
            { text: '好的', onPress: () => {
                // 2. 导航到登录页面
                // navigation.navigate('Login'); // 替换为你的登录页面路由名称
                console.log('应导航到登录页面'); // 导航占位符
              } }
          ]
      );

      // 3. 可选：清空表单 (如果导航后页面状态会重置，则非必须)
      // setUsername('');
      // setEmail('');
      // setPassword('');
      // setConfirmPassword('');

    } catch (err: any) { // 捕获 Axios 错误和其他错误
      console.error('注册失败:', err);

      let errorMessage = '注册失败，请稍后重试。'; // 默认错误信息

      // 检查是否是 Axios 错误
      if (axios.isAxiosError(err)) {
        const axiosError = err as AxiosError<ApiErrorResponse>;

        // 尝试从后端响应中获取错误信息
        // **重要**: `axiosError.response.data.message` 这个路径需要根据你后端实际返回的错误结构调整
        if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        }
        // 处理特定错误状态码
        else if (axiosError.response?.status === 409) { // 409 Conflict 通常表示资源已存在
          // 后端可能在 message 中明确是邮箱还是用户名冲突，或者你需要检查 errors 字段
          // 这里提供一个通用提示
          errorMessage = '邮箱或用户名已被注册，请尝试其他名称。';
          // 如果后端返回更详细的 errors 数组，可以这样处理：
          // if (axiosError.response?.data?.errors && axiosError.response.data.errors.length > 0) {
          //   errorMessage = axiosError.response.data.errors[0].message; // 显示第一个错误
          // }
        } else if (axiosError.response?.status === 400) { // 400 Bad Request 通常表示输入校验失败
          errorMessage = '输入信息有误，请检查。';
          // 同样可以检查 errors 字段获取更具体信息
        } else if (!axiosError.response) {
          // 网络错误
          errorMessage = '无法连接到服务器，请检查您的网络连接。';
        }
        // 可以根据需要添加更多状态码的处理...

      } else if (err instanceof Error) {
        // 处理其他类型的错误
        errorMessage = err.message;
      }

      setError(errorMessage); // 在界面上显示错误信息

    } finally {
      // 无论成功或失败，都要结束加载状态
      setLoading(false);
    }
  };

  // --- 组件的 JSX 结构基本保持不变 ---
  // --- 确保 Button 的 onPress 和 loading 属性绑定正确 ---
  // --- 确保 Button 添加了 disabled={loading} ---
  // --- 为 "立即登录" 按钮的 onPress 添加导航逻辑 (或注释占位符) ---
  return (
      <ScreenContainer
          scrollable={true} // 注册表单可能较长，允许滚动
          paddingHorizontal={true}
          backgroundColor={theme.colors.background}
      >
        <View style={styles.container}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image
                source={require('../../../assets/images/logo-placeholder.png')} // 确认路径
                style={styles.logo}
                resizeMode="contain"
            />
            <Text style={styles.appName}>Aura</Text>
            <Text style={styles.tagline}>创建您的账户</Text>
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
                  // navigation.navigate('Login'); // TODO: 导航到登录页面
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
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl, // 增加垂直内边距给滚动留空间
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl, // Logo 和表单间距
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