import React, {useState} from 'react';
import {View, Text, StyleSheet, Image, Alert} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, {AxiosError} from 'axios';
import {useNavigation} from '@react-navigation/native';
import {apiClient, AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY} from '../../services/api';
import {useDispatch} from 'react-redux';
import ScreenContainer from '../../components/common/ScreenContainer';
import Button from '../../components/common/Button';
import InputField from '../../components/common/InputField';
import theme from '../../theme';
import {loginSuccess} from '../../store/slices/authSlice';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../navigation/types';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface AuthResponse {
    message?: string;
    data?: {
        user: {
            user_id: string;
            email: string;
            username: string;
        }
        access_token: string;
        refresh_token: string;
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
            const response = await apiClient.post<AuthResponse>('/auth/login', {
                email: email,
                password: password
            });
            console.log(response);

            if (response) {

                const user = response.user;
                const access_token = response.access_token;
                const refresh_token = response.refresh_token;


                // 保存令牌到AsyncStorage
                await AsyncStorage.setItem(AUTH_TOKEN_KEY, access_token);
                await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refresh_token);

                // 更新Redux状态
                dispatch(loginSuccess({user, access_token, refresh_token}));

                // 导航到首页
                navigation.navigate('Home');
            }
        } catch (error: any) {
            console.log(error);
            const errorMessage = error.response?.data?.message || '登录失败，请检查您的凭证';
            setError(errorMessage);
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