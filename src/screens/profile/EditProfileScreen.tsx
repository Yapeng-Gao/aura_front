import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, ActivityIndicator, Alert, useColorScheme } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useDispatch } from 'react-redux';
import ScreenContainer from '../../components/common/ScreenContainer';
import Button from '../../components/common/Button';
import theme from '../../theme';
import apiService from '../../services/api';
import { updateUserProfile } from '../../store/slices/authSlice';
import { RootStackParamList } from '../../navigation/types';
import AvatarUploader from '../../components/profile/AvatarUploader';
import userService from "@/services/user-service";

type EditProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'EditProfile'>;

const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation<EditProfileScreenNavigationProp>();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const userData = await userService.getProfile();
      
      if (userData) {
        setUsername(userData.name || '');
        setEmail(userData.email || '');
        setPhone(userData.phoneNumber || '');
        setUserData(userData);
      }
      setError(null);
    } catch (err) {
      console.error('获取用户资料失败:', err);
      setError('获取用户资料失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updatedData = await apiService.user.updateProfile({
        name: username,
        phone_number: phone
      });
      
      if (updatedData) {
        // 更新Redux状态
        dispatch(updateUserProfile({
          username
        }));
        
        Alert.alert('成功', '个人资料已更新');
        navigation.goBack();
      }
    } catch (err) {
      console.error('更新用户资料失败:', err);
      Alert.alert('错误', '更新个人资料失败，请稍后重试');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ScreenContainer
        title="编辑个人资料"
        backgroundColor={isDarkMode ? theme.dark.colors.background : theme.colors.background}
        showBackButton
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, isDarkMode && styles.textDark]}>加载中...</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      title="编辑个人资料"
      backgroundColor={isDarkMode ? theme.dark.colors.background : theme.colors.background}
      showBackButton
    >
      <ScrollView style={styles.container}>
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <Button 
              title="重试" 
              variant="primary" 
              size="small" 
              onPress={fetchUserProfile}
              style={styles.retryButton} 
            />
          </View>
        )}

        <View style={styles.avatarContainer}>
          <AvatarUploader
            currentImageUrl={userData?.profileImage}
            defaultImage={require('../../../assets/images/avatar-placeholder.png')}
            size="large"
            onImageUpdated={(newImageUrl) => {
              // 这里可以更新本地状态，但实际更新已经在组件内部通过dispatch处理
              console.log('头像已更新:', newImageUrl);
            }}
          />
          <Text style={[styles.avatarHelper, isDarkMode && styles.textDark]}>点击头像进行更换</Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, isDarkMode && styles.textDark]}>用户名</Text>
          <TextInput
            style={[
              styles.input, 
              isDarkMode && styles.inputDark,
              { color: isDarkMode ? theme.dark.colors.textPrimary : theme.colors.textPrimary }
            ]}
            value={username}
            onChangeText={setUsername}
            placeholder="请输入用户名"
            placeholderTextColor={isDarkMode ? theme.dark.colors.textSecondary : theme.colors.textSecondary}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, isDarkMode && styles.textDark]}>邮箱</Text>
          <TextInput
            style={[
              styles.input, 
              isDarkMode && styles.inputDark,
              { color: isDarkMode ? theme.dark.colors.textPrimary : theme.colors.textPrimary }
            ]}
            value={email}
            onChangeText={setEmail}
            placeholder="请输入邮箱"
            placeholderTextColor={isDarkMode ? theme.dark.colors.textSecondary : theme.colors.textSecondary}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={false} // 邮箱不可编辑，需要特殊流程修改
          />
          <Text style={[styles.helperText, isDarkMode && styles.textDark]}>邮箱地址不可直接修改，如需修改请联系客服</Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, isDarkMode && styles.textDark]}>手机号</Text>
          <TextInput
            style={[
              styles.input, 
              isDarkMode && styles.inputDark,
              { color: isDarkMode ? theme.dark.colors.textPrimary : theme.colors.textPrimary }
            ]}
            value={phone}
            onChangeText={setPhone}
            placeholder="请输入手机号"
            placeholderTextColor={isDarkMode ? theme.dark.colors.textSecondary : theme.colors.textSecondary}
            keyboardType="phone-pad"
          />
        </View>

        <Button
          title={saving ? "保存中..." : "保存"}
          variant="primary"
          size="large"
          onPress={handleSave}
          style={styles.saveButton}
          disabled={saving}
        />
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  avatarHelper: {
    marginTop: theme.spacing.sm,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  errorContainer: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.error + '20', // 20% opacity
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorText: {
    color: theme.colors.error,
    flex: 1,
    fontSize: theme.typography.fontSize.md,
  },
  retryButton: {
    marginLeft: theme.spacing.md,
  },
  formGroup: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textPrimary,
    borderWidth: 1,
    borderColor: theme.colors.border,
    height: 48,
  },
  helperText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  saveButton: {
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.xxl,
  },
  textDark: {
    color: theme.dark.colors.textSecondary,
  },
  inputDark: {
    backgroundColor: theme.dark.colors.surface,
    borderColor: theme.dark.colors.border,
  },
});

export default EditProfileScreen; 