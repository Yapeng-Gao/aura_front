import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosError } from 'axios';
import { useNavigation } from '@react-navigation/native';
import apiService, { AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY } from '../../services/api';
import { useDispatch } from 'react-redux';
import ScreenContainer from '../../components/common/ScreenContainer';
import Button from '../../components/common/Button';
import InputField from '../../components/common/InputField';
import theme from '../../theme';
import { loginSuccess } from '../../store/slices/authSlice'; // 导入你定义的登录成功 action
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface LoginResponseData {
    access_token: string;
    refresh_token?: string;
    user?: {
        id: string | number;
        name: string; // Assuming backend might return 'name' based on register endpoint
        email: string;
    };
}

// Keep a general error structure, but detailed logging will reveal the exact structure
interface ApiErrorResponse {
    status?: string;
    code?: number;
    message?: string;
    errors?: any; // Use 'any' or a more specific type if known (e.g., object or array)
    detail?: any; // Add 'detail' based on the previous error example
}


const LoginScreen: React.FC = () => {
    const [email, setEmail] = React.useState(''); // Assuming input is email
    const [password, setPassword] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');
    const navigation = useNavigation();
    const dispatch = useDispatch(); // 获取 dispatch 函数

    const handleLogin = async () => {
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
            // --- Make the request ---
            // IMPORTANT: Based on the previous 422 error, try sending 'email'
            // If this still fails, the detailed log below will show what the backend received
            // and what it responded with.
            const responseData = await apiService.client.post<LoginResponseData>(
                '/auth/login',
                {
                    email: email,
                    password: password
                }
            );
            console.log(responseData);
            // --- Login Success ---
            if (!responseData || !responseData.access_token) {
                console.error('登录响应缺少 access_token:', responseData);
                throw new Error('登录响应无效，请稍后重试。');
            }
            console.log('登录成功:', responseData);
            console.log('DEBUG: AUTH_TOKEN_KEY Before Use:', AUTH_TOKEN_KEY);
            await AsyncStorage.setItem(AUTH_TOKEN_KEY, responseData.access_token);
            console.log('访问令牌 (Access Token) 存储成功');

            if (responseData.refresh_token) {
                console.log('DEBUG: REFRESH_TOKEN_KEY Before Use:', REFRESH_TOKEN_KEY); // <--- 添加这行调试
                await AsyncStorage.setItem(REFRESH_TOKEN_KEY, responseData.refresh_token);
                console.log('刷新令牌 (Refresh Token) 存储成功');
            } else {
                console.log('DEBUG: REFRESH_TOKEN_KEY Before Remove:', REFRESH_TOKEN_KEY);
                await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
            }

            if (responseData.user) {
                try {
                    await AsyncStorage.setItem('@user_info', JSON.stringify(responseData.user));
                } catch (e) {
                    console.warn("无法存储用户信息:", e);
                }
            }
            
            // 创建符合Redux期望格式的用户对象
            const user = responseData.user ? {
                id: responseData.user.id.toString(),
                email: responseData.user.email,
                username: responseData.user.name || responseData.user.email.split('@')[0] // 如果没有name，使用邮箱的用户名部分
            } : {
                id: 'temp-id', // 临时ID，稍后可以通过获取用户信息API更新
                email: email,
                username: email.split('@')[0]
            };
            
            // --- 3. Dispatch Redux action 来更新认证状态 ---
            dispatch(loginSuccess({
                token: responseData.access_token,
                refreshToken: responseData.refresh_token || '',
                user: user
            }));
            // --- 结束 Redux Dispatch ---
            navigation.navigate('Main');
            // Alert.alert('登录成功', `欢迎回来${responseData.user?.name ? ', ' + responseData.user.name : ''}！`);


        } catch (err: any) {
            console.error('登录失败:', err); // Keep the original error log

            let errorMessage = '登录失败，请检查您的凭据或网络连接。'; // More specific default

            if (axios.isAxiosError(err)) {
                const axiosError = err as AxiosError<ApiErrorResponse>; // Use the defined interface

                // --- DETAILED LOGGING ---
                if (axiosError.response) {
                    console.error('--- 后端错误响应 ---');
                    console.error('状态码 (Status Code):', axiosError.response.status);
                    // Log the raw data received from the backend
                    console.error('响应数据 (Response Data):', JSON.stringify(axiosError.response.data, null, 2));
                    // Log the request config's data to see what was SENT
                    if(axiosError.config?.data) {
                        try {
                            // Axios request data might be a string, try parsing
                            console.error('发送的数据 (Sent Data):', JSON.stringify(JSON.parse(axiosError.config.data), null, 2));
                        } catch {
                            // If not JSON, log as is
                            console.error('发送的数据 (Sent Data):', axiosError.config.data);
                        }
                    }
                    console.error('--- 结束后端错误响应 ---');
                } else if (axiosError.request) {
                    console.error('请求已发出但未收到响应:', axiosError.request);
                    errorMessage = '无法连接到服务器，请检查网络。';
                } else {
                    console.error('Axios 配置或请求设置错误:', axiosError.message);
                    errorMessage = '发起请求时出错。';
                }
                // --- END DETAILED LOGGING ---


                // --- Attempt to extract user-friendly message ---
                if (axiosError.response?.data) {
                    const responseData = axiosError.response.data;

                    // 1. Check for FastAPI/Pydantic style 'detail' array
                    if (responseData.detail && Array.isArray(responseData.detail) && responseData.detail.length > 0) {
                        const firstError = responseData.detail[0];
                        if (firstError.msg) {
                            // Try to make it slightly more readable if loc is present
                            if (firstError.loc && Array.isArray(firstError.loc) && firstError.loc.length > 1) {
                                errorMessage = `字段 '${firstError.loc[firstError.loc.length - 1]}'： ${firstError.msg}`;
                            } else {
                                errorMessage = firstError.msg;
                            }
                        } // Fallback to generic message if no msg field
                    }
                    // 2. Check for common 'errors' object (e.g., Laravel)
                    else if (typeof responseData.errors === 'object' && responseData.errors !== null && Object.keys(responseData.errors).length > 0) {
                        const errorFields = Object.keys(responseData.errors);
                        const firstFieldErrors = responseData.errors[errorFields[0]];
                        if (Array.isArray(firstFieldErrors) && firstFieldErrors.length > 0) {
                            errorMessage = firstFieldErrors[0];
                        } else if (typeof firstFieldErrors === 'string') {
                            errorMessage = firstFieldErrors;
                        } else if (responseData.message) { // Use top-level message if errors field is weird
                            errorMessage = responseData.message;
                        }
                    }
                    // 3. Check for a top-level 'message'
                    else if (responseData.message && typeof responseData.message === 'string') {
                        errorMessage = responseData.message;
                    }
                    // 4. Use status code for generic messages if nothing else found
                    else if (axiosError.response?.status === 422) {
                        errorMessage = '输入信息无效或格式不正确。'; // Generic 422
                    } else if (axiosError.response?.status === 401) {
                        errorMessage = '邮箱或密码错误。'; // Generic 401
                    } else if (axiosError.response?.status === 400) {
                        errorMessage = '请求格式错误。'; // Generic 400
                    }
                }
                // Keep the network error message if it was set earlier
                else if (!axiosError.response && axiosError.request) {
                    errorMessage = '无法连接到服务器，请检查网络。';
                }


            } else if (err instanceof Error) {
                errorMessage = err.message; // Handle standard JS errors
            }

            setError(errorMessage); // Show the best possible error message to the user

        } finally {
            setLoading(false);
        }
    };

    // --- JSX remains the same ---
    return (
        <ScreenContainer
            scrollable={true}
            paddingHorizontal={true}
            backgroundColor={theme.colors.background}
        >
            <View style={styles.container}>
                {/* Logo Area */}
                <View style={styles.logoContainer}>
                    <Image
                        source={require('../../../assets/images/logo-placeholder.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <Text style={styles.appName}>Aura</Text>
                    <Text style={styles.tagline}>您的智能生活助手</Text>
                </View>

                {/* Form Area */}
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
                        disabled={loading}
                    />
                    <Button
                        title="忘记密码？"
                        onPress={() => {
                            navigation.navigate('ForgotPassword'); // Ensure 'ForgotPassword' screen exists in navigator
                        }}
                        variant="text"
                        size="medium"
                        style={styles.forgotPasswordButton}
                        disabled={loading}
                    />
                </View>

                {/* Footer Area */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>还没有账号？</Text>
                    <Button
                        title="立即注册"
                        onPress={() => {
                            navigation.navigate('Register'); // Ensure 'Register' screen exists
                        }}
                        variant="outline"
                        size="medium"
                        style={styles.registerButton}
                        disabled={loading}
                    />
                </View>
            </View>
        </ScreenContainer>
    );
};

// --- Styles remain the same ---
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
        marginBottom: theme.spacing.sm,
        textAlign: 'center',
    },
});

export default LoginScreen;