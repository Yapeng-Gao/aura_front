import React from 'react';
import {View, Text, StyleSheet, Image, Alert} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {AuthStackParamList} from '../../navigation/types';
import ScreenContainer from '../../components/common/ScreenContainer';
import Button from '../../components/common/Button';
import InputField from '../../components/common/InputField';
import theme from '../../theme';
import authService from '../../services/auth-service';

type ForgotPasswordScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'ForgotPassword'>;

const ForgotPasswordScreen: React.FC = () => {
    const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();
    const [email, setEmail] = React.useState('');
    const [error, setError] = React.useState('');
    const [loading, setLoading] = React.useState(false);

    const handleForgetPassword = async () => {
        if (!email) {
            setError('请输入邮箱地址');
            return;
        }

        try {
            setLoading(true);
            setError('');

            const success = await authService.requestPasswordForget({email});
            if (success) {
                Alert.alert(
                    '成功',
                    '重置密码链接已发送到您的邮箱，请查收',
                    [{text: '确定', onPress: () => navigation.navigate('ForgotPassword')}]
                );
            }
        } catch (error) {
            setError('请求重置密码失败，请稍后重试');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScreenContainer
            title="忘记密码"
            backgroundColor={theme.colors.background}
            hideHeader
        >
            <View style={styles.content}>
                <View style={styles.logoContainer}>
                    <Text style={styles.appName}>Aura</Text>
                </View>

                <Text style={styles.title}>忘记密码</Text>
                <Text style={styles.subtitle}>请输入您的邮箱地址，我们将发送重置密码链接</Text>

                <InputField
                    label="邮箱"
                    value={email}
                    onChangeText={setEmail}
                    placeholder="请输入您的邮箱"
                    keyboardType="email-address"
                    autoCapitalize="none"
                />

                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                <Button
                    title="发送重置链接"
                    onPress={handleForgetPassword}
                    loading={loading}
                    style={styles.button}
                />

                <Button
                    title="返回登录"
                    onPress={() => navigation.navigate('Login')}
                    variant="text"
                    size="medium"
                    style={styles.backButton}
                />
            </View>
        </ScreenContainer>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        paddingVertical: 20,
        paddingHorizontal: 20,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    appName: {
        fontSize: 32,
        fontWeight: 'bold',
        color: theme.colors.primary,
        marginBottom: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.primary,
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: theme.colors.secondary,
        marginBottom: 30,
    },
    button: {
        marginTop: 20,
    },
    backButton: {
        marginTop: 10,
    },
    errorText: {
        color: theme.colors.error,
        marginTop: 10,
        textAlign: 'center',
    },
});

export default ForgotPasswordScreen;
