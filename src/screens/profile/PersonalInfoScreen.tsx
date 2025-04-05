import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import ScreenContainer from '../../components/common/ScreenContainer';
import Button from '../../components/common/Button';
import theme from '../../theme';
import apiService from '../../services/api';

const PersonalInfoScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    phoneNumber: '',
    registrationDate: '',
    lastLogin: ''
  });

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      setLoading(true);
      const data = await apiService.user.getProfile();
      
      if (data) {
        setUserData({
          username: data.name || '',
          email: data.email || '',
          phoneNumber: data.phoneNumber || '',
          registrationDate: formatDate(data.createdAt) || '',
          lastLogin: formatDate(data.lastLoginAt) || ''
        });
      }
      setError(null);
    } catch (err) {
      console.error('获取用户信息失败:', err);
      setError('获取用户信息失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  const maskPhoneNumber = (phone: string) => {
    if (!phone || phone.length < 8) return phone;
    return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
  };

  if (loading) {
    return (
      <ScreenContainer
        title="个人信息"
        backgroundColor={theme.colors.background}
        showBackButton
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      title="个人信息"
      backgroundColor={theme.colors.background}
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
              onPress={fetchUserInfo}
              style={styles.retryButton} 
            />
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>基本信息</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>用户名</Text>
            <Text style={styles.value}>{userData.username}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>邮箱</Text>
            <Text style={styles.value}>{userData.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>手机号</Text>
            <Text style={styles.value}>{maskPhoneNumber(userData.phoneNumber)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>账号信息</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>注册时间</Text>
            <Text style={styles.value}>{userData.registrationDate}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>最后登录</Text>
            <Text style={styles.value}>{userData.lastLogin}</Text>
          </View>
        </View>
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
  section: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  label: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
  },
  value: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textPrimary,
  },
});

export default PersonalInfoScreen; 