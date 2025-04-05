import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useColorScheme } from 'react-native';
import ScreenContainer from '../../components/common/ScreenContainer';
import theme from '../../theme';
import { useNavigation } from '@react-navigation/native';
import useTranslation from '../../hooks/useTranslation';
import ListItem from '../../components/common/ListItem';
import Icon from 'react-native-vector-icons/Ionicons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/types';

type HelpSupportScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const HelpSupportScreen: React.FC = () => {
  const navigation = useNavigation<HelpSupportScreenNavigationProp>();
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  return (
    <ScreenContainer
      title={t('profile.helpSupport')}
      backgroundColor={isDarkMode ? theme.dark.colors.background : theme.colors.background}
      showBackButton
    >
      <ScrollView style={styles.container}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>
            {t('help.faq')}
          </Text>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={[styles.menuTitle, isDarkMode && styles.menuTitleDark]}>
              {t('help.deviceConnectionIssues')}
            </Text>
            <Text style={[styles.arrow, isDarkMode && styles.arrowDark]}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={[styles.menuTitle, isDarkMode && styles.menuTitleDark]}>
              {t('help.accountIssues')}
            </Text>
            <Text style={[styles.arrow, isDarkMode && styles.arrowDark]}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={[styles.menuTitle, isDarkMode && styles.menuTitleDark]}>
              {t('help.paymentIssues')}
            </Text>
            <Text style={[styles.arrow, isDarkMode && styles.arrowDark]}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>
            {t('help.contactSupport')}
          </Text>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={[styles.menuTitle, isDarkMode && styles.menuTitleDark]}>
              {t('help.onlineSupport')}
            </Text>
            <Text style={[styles.arrow, isDarkMode && styles.arrowDark]}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={[styles.menuTitle, isDarkMode && styles.menuTitleDark]}>
              {t('help.phoneSupport')}
            </Text>
            <Text style={[styles.arrow, isDarkMode && styles.arrowDark]}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={[styles.menuTitle, isDarkMode && styles.menuTitleDark]}>
              {t('help.emailSupport')}
            </Text>
            <Text style={[styles.arrow, isDarkMode && styles.arrowDark]}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>
            {t('help.other')}
          </Text>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={[styles.menuTitle, isDarkMode && styles.menuTitleDark]}>
              {t('help.userAgreement')}
            </Text>
            <Text style={[styles.arrow, isDarkMode && styles.arrowDark]}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={[styles.menuTitle, isDarkMode && styles.menuTitleDark]}>
              {t('help.privacyPolicy')}
            </Text>
            <Text style={[styles.arrow, isDarkMode && styles.arrowDark]}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={[styles.menuTitle, isDarkMode && styles.menuTitleDark]}>
              {t('help.feedback')}
            </Text>
            <Text style={[styles.arrow, isDarkMode && styles.arrowDark]}>›</Text>
          </TouchableOpacity>
        </View>

        <ListItem
          title={t('settings.feedback.title')}
          leftIcon={<Icon name="chatbubble-ellipses-outline" size={24} color={isDarkMode ? theme.dark.colors.textPrimary : theme.colors.textPrimary} />}
          onPress={() => navigation.navigate('Feedback')}
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
  sectionTitleDark: {
    color: theme.dark.colors.textPrimary,
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
  }
});

export default HelpSupportScreen; 