import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator, useColorScheme, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useDispatch } from 'react-redux';
import ScreenContainer from '../../components/common/ScreenContainer';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import ListItem from '../../components/common/ListItem';
import AvatarUploader from '../../components/profile/AvatarUploader';
import ProfileCompletionCard from '../../components/profile/ProfileCompletionCard';
import ProfileActionRow from '../../components/profile/ProfileActionRow';
import AchievementsCard from '../../components/profile/AchievementsCard';
import theme from '../../theme';
import { logout } from '../../store/slices/authSlice';
import { RootStackParamList } from '../../navigation/types';
import apiService from '../../services/api';
import useTranslation from '../../hooks/useTranslation';

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList>;

interface UserProfile {
  userId: string;
  username: string;
  email: string;
  phoneNumber?: string;
  profileImage?: string;
  avatar?: any; // 本地图片资源，用于加载失败时显示默认头像
  membershipType: string;
  membershipExpiry: string;
  joinDate: string;
  preferences: {
    theme: string;
    language: string;
    notifications: boolean;
  }
}

const UserProfileScreen: React.FC = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const { t } = useTranslation();
  const [user, setUser] = useState<UserProfile>({
    userId: '',
    username: '',
    email: '',
    avatar: require('../../../assets/images/avatar-placeholder.png'),
    membershipType: '',
    membershipExpiry: '',
    joinDate: '',
    preferences: {
      theme: '',
      language: '',
      notifications: false,
    }
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const userData = await apiService.user.getProfile();
      
      if (userData) {
        setUser({
          userId: userData.userId || '',
          username: userData.name || '',
          email: userData.email || '',
          phoneNumber: userData.phoneNumber,
          profileImage: userData.profileImage,
          avatar: require('../../../assets/images/avatar-placeholder.png'), // 保留默认头像以备加载失败
          membershipType: userData.subscription?.plan || 'Free',
          membershipExpiry: userData.subscription?.expiresAt || '未设置',
          joinDate: userData.createdAt || '',
          preferences: {
            theme: userData.preferences?.theme || '跟随系统',
            language: userData.preferences?.language || '简体中文',
            notifications: userData.preferences?.notifications?.push || false,
          }
        });
      }
      setError(null);
    } catch (err) {
      console.error('获取用户资料失败:', err);
      setError('获取用户资料失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      t('auth.logout'),
      t('auth.logoutConfirm'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.confirm'),
          onPress: () => {
            dispatch(logout());
            navigation.reset({
              index: 0,
              routes: [{ name: 'Auth' }],
            });
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <ScreenContainer title={t('profile.title')} 
        backgroundColor={isDarkMode ? theme.dark.colors.background : theme.colors.background}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, isDarkMode && styles.loadingTextDark]}>{t('common.loading')}</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      title={t('profile.title')}
      backgroundColor={isDarkMode ? theme.dark.colors.background : theme.colors.background}
      rightIcon={<Text style={styles.editText}>{t('common.edit')}</Text>}
      onRightPress={() => navigation.navigate('EditProfile')}
    >
      <ScrollView style={styles.container}>
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <Button 
              title={t('common.retry')}
              variant="primary" 
              size="small" 
              onPress={fetchUserProfile}
              style={styles.retryButton} 
            />
          </View>
        )}

        <ProfileCompletionCard user={user} />

        <ProfileActionRow
          actions={[
            { icon: "🔒", label: t('profile.security'), screen: "SecuritySettings", color: theme.colors.info },
            { icon: "🔔", label: t('profile.notifications'), screen: "NotificationSettings", color: theme.colors.warning },
            { icon: "📊", label: t('profile.analytics'), screen: "UserAnalytics", color: theme.colors.success },
            { icon: "💬", label: t('settings.feedback.title'), screen: "Feedback", color: theme.colors.primary }
          ]}
        />

        <TouchableOpacity
          style={[styles.profileHeader, isDarkMode && styles.profileHeaderDark]}
          onPress={() => navigation.navigate('PersonalInfo')}
          activeOpacity={0.7}
        >
          <AvatarUploader
            currentImageUrl={user.profileImage}
            defaultImage={user.avatar}
            size="large"
            onImageUpdated={(newImageUrl) => {
              setUser(prev => ({
                ...prev,
                profileImage: newImageUrl
              }));
            }}
          />
          <View style={styles.profileInfo}>
            <Text style={[styles.username, isDarkMode && styles.usernameDark]}>{user.username}</Text>
            <Text style={[styles.email, isDarkMode && styles.emailDark]}>{user.email}</Text>
            <View style={styles.membershipBadge}>
              <Text style={styles.membershipText}>{user.membershipType}</Text>
            </View>
          </View>
        </TouchableOpacity>

        <Card title={t('profile.membership.membershipInfo')} style={styles.card}>
          <View style={styles.membershipInfo}>
            <View style={styles.membershipItem}>
              <Text style={[styles.membershipLabel, isDarkMode && styles.membershipLabelDark]}>
                {t('profile.membership.membershipType')}
              </Text>
              <Text style={[styles.membershipValue, isDarkMode && styles.membershipValueDark]}>
                {user.membershipType}
              </Text>
            </View>
            <View style={styles.membershipItem}>
              <Text style={[styles.membershipLabel, isDarkMode && styles.membershipLabelDark]}>
                {t('profile.membership.expiryDate')}
              </Text>
              <Text style={[styles.membershipValue, isDarkMode && styles.membershipValueDark]}>
                {user.membershipExpiry}
              </Text>
            </View>
            <Button
              title={t('profile.membership.upgradeMembership')}
              variant="primary"
              size="medium"
              style={styles.upgradeButton}
              onPress={() => navigation.navigate('MembershipUpgrade')}
            />
          </View>
        </Card>

        <AchievementsCard
          achievements={[
            {
              icon: "🌟",
              title: t('achievements.activeUser'),
              progress: 18,
              total: 30,
              unlocked: false
            },
            {
              icon: "📝",
              title: t('achievements.contentCreator'),
              progress: 5,
              total: 5,
              unlocked: true
            }
          ]}
          onSeeAll={() => {
            Alert.alert(
              t('achievements.featureDeveloperTitle'), 
              t('achievements.featureDeveloperMessage')
            );
          }}
        />

        <Card title={t('profile.accountSettings')} style={styles.card}>
          <View style={styles.settingsContainer}>
            <ListItem
              title={t('profile.personalInfo')}
              leftIcon={<Text>👤</Text>}
              onPress={() => navigation.navigate('PersonalInfo')}
            />
            <ListItem
              title={t('settings.feedback.title')}
              leftIcon={<Text>💬</Text>}
              onPress={() => navigation.navigate('Feedback')}
            />
            <ListItem
              title={t('profile.analytics')}
              leftIcon={<Text>📊</Text>}
              onPress={() => navigation.navigate('UserAnalytics')}
            />
            <ListItem
              title={t('profile.securitySettings')}
              leftIcon={<Text>🔒</Text>}
              onPress={() => navigation.navigate('SecuritySettings')}
            />
            <ListItem
              title={t('profile.notificationSettings')}
              leftIcon={<Text>🔔</Text>}
              onPress={() => navigation.navigate('NotificationSettings')}
            />
            <ListItem
              title={t('profile.language')}
              leftIcon={<Text>🌐</Text>}
              onPress={() => navigation.navigate('LanguageSettings')}
            />
            <ListItem
              title={t('profile.darkMode')}
              leftIcon={<Text>🌙</Text>}
              onPress={() => navigation.navigate('ThemeSettings')}
            />
            <ListItem
              title={t('profile.privacySettings')}
              leftIcon={<Text>🛡️</Text>}
              onPress={() => navigation.navigate('PrivacySettings')}
            />
            <ListItem
              title={t('profile.helpSupport')}
              leftIcon={<Text>❓</Text>}
              onPress={() => navigation.navigate('HelpSupport')}
            />
            <ListItem
              title={t('profile.about')}
              leftIcon={<Text>ℹ️</Text>}
              onPress={() => navigation.navigate('About')}
              divider={false}
            />
          </View>
        </Card>

        <Button
          title={t('auth.logout')}
          variant="outline"
          size="large"
          style={styles.logoutButton}
          onPress={handleLogout}
        />
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  loadingTextDark: {
    color: theme.dark.colors.textSecondary,
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
  editText: {
    color: theme.colors.primary,
    fontSize: theme.typography.fontSize.md,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  profileHeaderDark: {
    backgroundColor: theme.dark.colors.surface,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: theme.spacing.lg,
  },
  profileInfo: {
    flex: 1,
  },
  username: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  usernameDark: {
    color: theme.dark.colors.textPrimary,
  },
  email: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  emailDark: {
    color: theme.dark.colors.textSecondary,
  },
  membershipBadge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    alignSelf: 'flex-start',
  },
  membershipText: {
    color: theme.colors.onPrimary,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: 'medium',
  },
  card: {
    marginBottom: theme.spacing.md,
  },
  membershipInfo: {
    padding: theme.spacing.md,
  },
  membershipItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  membershipLabel: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
  },
  membershipLabelDark: {
    color: theme.dark.colors.textSecondary,
  },
  membershipValue: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: 'medium',
    color: theme.colors.textPrimary,
  },
  membershipValueDark: {
    color: theme.dark.colors.textPrimary,
  },
  upgradeButton: {
    marginTop: theme.spacing.sm,
  },
  arrowIcon: {
    fontSize: 24,
    color: theme.colors.textSecondary,
  },
  logoutButton: {
    marginVertical: theme.spacing.lg,
  },
  versionText: {
    textAlign: 'center',
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xxl,
  },
  settingsContainer: {
    padding: theme.spacing.md,
  },
});

export default UserProfileScreen;
