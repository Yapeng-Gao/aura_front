import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import ScreenContainer from '../../components/common/ScreenContainer';
import theme from '../../theme';

const PersonalInfoScreen: React.FC = () => {
  return (
    <ScreenContainer
      title="个人信息"
      backgroundColor={theme.colors.background}
    >
      <ScrollView style={styles.container}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>基本信息</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>用户名</Text>
            <Text style={styles.value}>张明</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>邮箱</Text>
            <Text style={styles.value}>zhangming@example.com</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>手机号</Text>
            <Text style={styles.value}>138****8000</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>账号信息</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>注册时间</Text>
            <Text style={styles.value}>2024-01-01</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>最后登录</Text>
            <Text style={styles.value}>2024-03-27 14:30</Text>
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