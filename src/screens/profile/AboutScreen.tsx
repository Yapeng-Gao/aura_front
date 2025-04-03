import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import ScreenContainer from '../../components/common/ScreenContainer';
import theme from '../../theme';

const AboutScreen: React.FC = () => {
  const handleCheckUpdate = () => {
    // TODO: 实现检查更新逻辑
    console.log('检查更新');
  };

  const handleOpenWebsite = () => {
    Linking.openURL('https://www.example.com');
  };

  return (
    <ScreenContainer
      title="关于"
      backgroundColor={theme.colors.background}
    >
      <ScrollView style={styles.container}>
        <View style={styles.section}>
          <View style={styles.appInfo}>
            <Text style={styles.appName}>Aura</Text>
            <Text style={styles.appVersion}>版本 1.0.0</Text>
          </View>
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.menuItem} onPress={handleCheckUpdate}>
            <Text style={styles.menuTitle}>检查更新</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={handleOpenWebsite}>
            <Text style={styles.menuTitle}>官方网站</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>版权信息</Text>
          <Text style={styles.copyright}>
            © 2024 Aura. All rights reserved.
          </Text>
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
  appInfo: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  appName: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  appVersion: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  menuTitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textPrimary,
  },
  arrow: {
    fontSize: 24,
    color: theme.colors.textSecondary,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  copyright: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});

export default AboutScreen; 