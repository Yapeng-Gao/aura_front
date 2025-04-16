import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/types';
import ScreenContainer from '../../components/common/ScreenContainer';
import Button from '../../components/common/Button';
import InputField from '../../components/common/InputField';
import theme from '../../theme';
import authService from '../../services/auth-service';

type ResetPasswordScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'ResetPassword'>;

const ResetPasswordScreen: React.FC = () => {
  const navigation = useNavigation<ResetPasswordScreenNavigationProp>();
  const route = useRoute();
  const { token } = route.params as { token: string };

  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      setError('请输入新密码和确认密码');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const success = await authService.confirmPasswordReset({
        token,
        newPassword
      });

      if (success) {
        Alert.alert(
          '成功',
          '密码重置成功，请使用新密码登录',
          [{ text: '确定', onPress: () => navigation.navigate('Login') }]
        );
      }
    } catch (error) {
      setError('重置密码失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer
      title="重置密码"
      backgroundColor={theme.colors.background}
      hideHeader
    >
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.appName}>Aura</Text>
        </View>

        <Text style={styles.title}>重置密码</Text>
        <Text style={styles.subtitle}>请输入您的新密码</Text>

        <InputField
          label="新密码"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
          placeholder="请输入新密码"
        />

        <InputField
          label="确认密码"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          placeholder="请再次输入新密码"
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Button
          title="重置密码"
          onPress={handleResetPassword}
          loading={loading}
          style={styles.button}
        />

        <Button
          title="返回登录"
          onPress={() => navigation.navigate('Login')}
          variant="secondary"
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

export default ResetPasswordScreen; 