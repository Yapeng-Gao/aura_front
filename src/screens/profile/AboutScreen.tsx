import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, useColorScheme } from 'react-native';
import ScreenContainer from '../../components/common/ScreenContainer';
import theme from '../../theme';
import useTranslation from '../../hooks/useTranslation';

const AboutScreen: React.FC = () => {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  
  const handleCheckUpdate = () => {
    // TODO: 实现检查更新逻辑
    console.log(t('about.checkingForUpdates'));
  };

  const handleOpenWebsite = () => {
    Linking.openURL('https://www.example.com');
  };

  return (
    <ScreenContainer
      title={t('profile.about')}
      backgroundColor={isDarkMode ? theme.dark.colors.background : theme.colors.background}
      showBackButton
    >
      <ScrollView style={styles.container}>
        <View style={styles.section}>
          <View style={styles.appInfo}>
            <Text style={[styles.appName, isDarkMode && styles.appNameDark]}>Aura</Text>
            <Text style={[styles.appVersion, isDarkMode && styles.appVersionDark]}>
              {t('about.version')} 1.0.0
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.menuItem} onPress={handleCheckUpdate}>
            <Text style={[styles.menuTitle, isDarkMode && styles.menuTitleDark]}>
              {t('about.checkForUpdates')}
            </Text>
            <Text style={[styles.arrow, isDarkMode && styles.arrowDark]}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={handleOpenWebsite}>
            <Text style={[styles.menuTitle, isDarkMode && styles.menuTitleDark]}>
              {t('about.officialWebsite')}
            </Text>
            <Text style={[styles.arrow, isDarkMode && styles.arrowDark]}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>
            {t('about.copyright')}
          </Text>
          <Text style={[styles.copyright, isDarkMode && styles.copyrightDark]}>
            © 2024 Aura. {t('about.allRightsReserved')}
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
  appNameDark: {
    color: theme.dark.colors.textPrimary,
  },
  appVersion: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
  },
  appVersionDark: {
    color: theme.dark.colors.textSecondary,
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
  menuTitleDark: {
    color: theme.dark.colors.textPrimary,
  },
  arrow: {
    fontSize: 24,
    color: theme.colors.textSecondary,
  },
  arrowDark: {
    color: theme.dark.colors.textSecondary,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  sectionTitleDark: {
    color: theme.dark.colors.textPrimary,
  },
  copyright: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  copyrightDark: {
    color: theme.dark.colors.textSecondary,
  },
});

export default AboutScreen; 