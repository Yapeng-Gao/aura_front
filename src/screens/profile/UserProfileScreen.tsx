import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import ScreenContainer from '../../components/common/ScreenContainer';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import ListItem from '../../components/common/ListItem';
import theme from '../../theme';

const UserProfileScreen: React.FC = () => {
  // 模拟用户数据
  const user = {
    id: '1',
    username: '张明',
    email: 'zhangming@example.com',
    avatar: require('../../../assets/images/avatar-placeholder.png'),
    membershipType: 'Pro',
    membershipExpiry: '2025-12-31',
    joinDate: '2023-05-15',
    preferences: {
      theme: '跟随系统',
      language: '简体中文',
      notifications: true,
    }
  };

  return (
    <ScreenContainer
      title="个人资料"
      backgroundColor={theme.colors.background}
      rightIcon={<Text style={styles.editText}>编辑</Text>}
      onRightPress={() => {/* 导航到编辑资料页面 */}}
    >
      <ScrollView style={styles.container}>
        <View style={styles.profileHeader}>
          <Image source={user.avatar} style={styles.avatar} />
          <View style={styles.profileInfo}>
            <Text style={styles.username}>{user.username}</Text>
            <Text style={styles.email}>{user.email}</Text>
            <View style={styles.membershipBadge}>
              <Text style={styles.membershipText}>{user.membershipType}</Text>
            </View>
          </View>
        </View>

        <Card title="会员信息" style={styles.card}>
          <View style={styles.membershipInfo}>
            <View style={styles.membershipItem}>
              <Text style={styles.membershipLabel}>会员类型</Text>
              <Text style={styles.membershipValue}>{user.membershipType}</Text>
            </View>
            <View style={styles.membershipItem}>
              <Text style={styles.membershipLabel}>到期日期</Text>
              <Text style={styles.membershipValue}>{user.membershipExpiry}</Text>
            </View>
            <Button
              title="升级会员"
              variant="primary"
              size="medium"
              style={styles.upgradeButton}
              onPress={() => {/* 导航到会员升级页面 */}}
            />
          </View>
        </Card>

        <Card title="账户设置" style={styles.card}>
          <ListItem
            title="个人信息"
            subtitle="更新您的个人资料信息"
            rightIcon={<Text style={styles.arrowIcon}>›</Text>}
            onPress={() => {/* 导航到个人信息页面 */}}
          />
          <ListItem
            title="安全设置"
            subtitle="密码和安全选项"
            rightIcon={<Text style={styles.arrowIcon}>›</Text>}
            onPress={() => {/* 导航到安全设置页面 */}}
          />
          <ListItem
            title="通知设置"
            subtitle="管理应用通知"
            rightIcon={<Text style={styles.arrowIcon}>›</Text>}
            onPress={() => {/* 导航到通知设置页面 */}}
          />
          <ListItem
            title="隐私设置"
            subtitle="管理数据和隐私选项"
            rightIcon={<Text style={styles.arrowIcon}>›</Text>}
            onPress={() => {/* 导航到隐私设置页面 */}}
            divider={false}
          />
        </Card>

        <Card title="应用设置" style={styles.card}>
          <ListItem
            title="主题"
            subtitle={user.preferences.theme}
            rightIcon={<Text style={styles.arrowIcon}>›</Text>}
            onPress={() => {/* 导航到主题设置页面 */}}
          />
          <ListItem
            title="语言"
            subtitle={user.preferences.language}
            rightIcon={<Text style={styles.arrowIcon}>›</Text>}
            onPress={() => {/* 导航到语言设置页面 */}}
            divider={false}
          />
        </Card>

        <Card title="关于" style={styles.card}>
          <ListItem
            title="帮助中心"
            rightIcon={<Text style={styles.arrowIcon}>›</Text>}
            onPress={() => {/* 导航到帮助中心页面 */}}
          />
          <ListItem
            title="隐私政策"
            rightIcon={<Text style={styles.arrowIcon}>›</Text>}
            onPress={() => {/* 导航到隐私政策页面 */}}
          />
          <ListItem
            title="服务条款"
            rightIcon={<Text style={styles.arrowIcon}>›</Text>}
            onPress={() => {/* 导航到服务条款页面 */}}
            divider={false}
          />
        </Card>

        <Button
          title="退出登录"
          variant="outline"
          size="large"
          style={styles.logoutButton}
          onPress={() => {/* 处理退出登录 */}}
        />

        <Text style={styles.versionText}>Aura v1.0.0</Text>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  email: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
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
    fontWeight: theme.typography.fontWeight.medium,
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
  membershipValue: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textPrimary,
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
});

export default UserProfileScreen;
