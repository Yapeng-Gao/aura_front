import React from 'react';
import { View, Text, StyleSheet, Image, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosError } from 'axios'; // 导入 AxiosError 类型，因为 apiService 内部使用 axios
import { useNavigation } from '@react-navigation/native';
// --- 导入你的 API 服务和常量 ---
import apiService, { AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY } from '../../utils/api'; // 确认路径是否正确

import ScreenContainer from '../../components/common/ScreenContainer';
import Button from '../../components/common/Button';
import InputField from '../../components/common/InputField';
import theme from '../../theme';
// import { useNavigation } from '@react-navigation/native'; // 如果你使用了导航库

// --- 定义后端成功登录响应中 `data` 字段的预期结构 ---
// --- 重要：根据你后端接口实际返回的数据调整此接口 ---
interface LoginResponseData {
    accessToken: string;         // 访问令牌 (可能原名叫 token，这里改为 accessToken 以匹配刷新逻辑)
    refreshToken?: string;        // 刷新令牌 (可选, 取决于你的后端实现)
    user?: {                    // 用户信息 (可选)
        id: string | number;
        name: string;
        email: string;
        // ... 其他用户字段
    };
}

// --- 定义后端错误响应的结构 (如果后端错误格式统一) ---
interface ApiErrorResponse {
    status?: string; // 例如 'error'
    code?: number;   // 例如 401, 500
    message?: string; // 错误信息
    errors?: Array<{ code: string; field?: string; message: string }>; // 更详细的字段错误 (可选)
}


const LoginScreen: React.FC = () => {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');
    // const navigation = useNavigation(); // 获取导航对象
    // 2. 获取 navigation 对象
    const navigation = useNavigation();
    const handleLogin = async () => {
        // 基础的前端校验 (保留)
        if (!email || !password) {
            setError('邮箱和密码不能为空');
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('请输入有效的邮箱地址');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // --- 使用 apiService.post 发起登录请求 ---
            // 传递预期的响应数据类型 <LoginResponseData>
            // 传递登录接口的路径 (相对于 api.ts 中 baseURL 的路径)
            // 传递包含登录凭证的对象 { email, password }
            const responseData = await apiService.post<LoginResponseData>(
                '/auth/login', // <-- 确认你的登录接口路径是否为此，如果不同请修改
                {
                    email: email,
                    password: password,
                }
            );

            // --- 登录成功 ---
            // responseData 现在是后端 ApiResponse 中 `data` 字段的内容
            // 添加一个检查，确保响应中确实包含了 accessToken
            if (!responseData || !responseData.accessToken) {
                console.error('登录响应缺少 accessToken:', responseData);
                // 抛出一个错误，让下面的 catch 块处理用户提示
                throw new Error('登录响应无效，请稍后重试。');
            }

            console.log('登录成功:', responseData);

            // 1. 使用导入的 KEY 存储认证令牌
            await AsyncStorage.setItem(AUTH_TOKEN_KEY, responseData.accessToken);
            console.log('访问令牌 (Access Token) 存储成功');

            // 如果后端返回了刷新令牌，也存储它
            if (responseData.refreshToken) {
                await AsyncStorage.setItem(REFRESH_TOKEN_KEY, responseData.refreshToken);
                console.log('刷新令牌 (Refresh Token) 存储成功');
            } else {
                // 如果后端在登录时不返回 refreshToken，确保清除掉可能存在的旧 refreshToken
                await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
            }

            // 2. 可选：存储用户信息 (如果后端返回了用户信息)
            if (responseData.user) {
                try {
                    // 将用户信息对象转换为 JSON 字符串存储
                    await AsyncStorage.setItem('@user_info', JSON.stringify(responseData.user));
                } catch (e) {
                    // 存储用户信息失败不是关键错误，打印警告即可
                    console.warn("无法存储用户信息:", e);
                }
            }

            // 3. 更新全局应用状态 (推荐，例如使用 Context API 或 Redux)
            // dispatch(loginSuccess(responseData.user)); // 假设有 Redux action

            // 4. 导航到应用的主界面
            // navigation.navigate('MainAppTabs'); // 替换为你的主屏幕/导航器名称
            Alert.alert('登录成功', `欢迎回来${responseData.user ? ', ' + responseData.user.name : ''}！`); // 临时替代导航

        } catch (err: any) { // 捕获 Axios 错误和其他错误
            console.error('登录失败:', err);

            let errorMessage = '登录失败，请稍后重试。'; // 默认错误信息

            // 检查是否是 Axios 错误
            if (axios.isAxiosError(err)) {
                const axiosError = err as AxiosError<ApiErrorResponse>; // 类型断言以获取更详细的类型信息

                // 尝试从后端响应中获取错误信息
                // **重要**: `axiosError.response.data.message` 这个路径需要根据你后端实际返回的错误结构调整
                if (axiosError.response?.data?.message) {
                    errorMessage = axiosError.response.data.message;
                }
                    // 如果是 401 错误 (未授权)，通常表示用户名或密码错误
                // 注意：`api.ts` 中的拦截器会尝试处理 401，但如果刷新失败或没有刷新令牌，错误最终会在这里被捕获
                else if (axiosError.response?.status === 401) {
                    errorMessage = '邮箱或密码错误，请重试。';
                }
                // 可以为其他常见的 HTTP 状态码提供特定的用户提示
                else if (axiosError.response?.status === 400) {
                    errorMessage = '请求无效，请检查输入。'; // 例如：请求格式错误
                }
                // 如果没有 `axiosError.response`，通常是网络问题
                else if (!axiosError.response) {
                    errorMessage = '无法连接到服务器，请检查您的网络连接。';
                }
                // 可以根据需要添加更多状态码的处理...

            } else if (err instanceof Error) {
                // 处理其他类型的错误，例如上面手动抛出的 new Error('登录响应无效...')
                errorMessage = err.message;
            }

            setError(errorMessage); // 在界面上显示错误信息

        } finally {
            // 无论成功或失败，都要结束加载状态
            setLoading(false);
        }
    };

    // --- 组件的 JSX 结构保持不变 ---
    return (
        <ScreenContainer
            scrollable={true}
            paddingHorizontal={true}
            backgroundColor={theme.colors.background}
        >
            <View style={styles.container}>
                {/* Logo 区域 */}
                <View style={styles.logoContainer}>
                    <Image
                        source={require('../../../assets/images/logo-placeholder.png')} // 确认图片路径正确
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <Text style={styles.appName}>Aura</Text>
                    <Text style={styles.tagline}>您的智能生活助手</Text>
                </View>

                {/* 表单区域 */}
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

                    {/* 显示错误信息 */}
                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    <Button
                        title="登录"
                        onPress={handleLogin} // 使用更新后的异步函数
                        variant="primary"
                        size="large"
                        loading={loading} // 由 state 控制加载状态
                        fullWidth={true}
                        style={styles.loginButton}
                        disabled={loading} // 请求进行中时禁用按钮
                    />

                    <Button
                        title="忘记密码？"
                        onPress={() => {
                            navigation.navigate('ForgotPassword');
                        }}
                        variant="text"
                        size="medium"
                        style={styles.forgotPasswordButton}
                        disabled={loading} // 请求进行中时也可禁用 (可选)
                    />
                </View>

                {/* 底部区域 */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>还没有账号？</Text>
                    <Button
                        title="立即注册"
                        onPress={() => {
                            // 使用 navigation.navigate 跳转
                            // 'Register' 必须是你导航器中注册 RegisterScreen 时使用的名称
                            navigation.navigate('Register'); // <-- 修改这里
                        }}
                        variant="outline"
                        size="medium"
                        style={styles.registerButton}
                        disabled={loading} // 请求进行中时也可禁用 (可选)
                    />
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
        marginBottom: theme.spacing.sm, // 给错误信息下方也加点间距
        textAlign: 'center',
    },
});

export default LoginScreen;