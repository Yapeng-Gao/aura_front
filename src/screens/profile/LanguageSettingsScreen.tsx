import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, useColorScheme } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import ScreenContainer from '../../components/common/ScreenContainer';
import theme from '../../theme';
import { RootStackParamList } from '../../navigation/types';
import { SupportedLanguages } from '../../localization/i18n';
import useTranslation from '../../hooks/useTranslation';

type LanguageSettingsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'LanguageSettings'>;

interface LanguageOption {
  key: SupportedLanguages;
  label: string;
}

const LanguageSettingsScreen: React.FC = () => {
  const navigation = useNavigation<LanguageSettingsScreenNavigationProp>();
  const { t, currentLanguage, changeLanguage } = useTranslation();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  // 语言选项 - 使用语言包内的语言名称，而不是取决于当前语言的翻译
  const languageOptions: LanguageOption[] = [
    { key: SupportedLanguages.EN, label: 'English' },
    { key: SupportedLanguages.ZH, label: '简体中文' },
  ];

  // 选择语言
  const selectLanguage = (language: SupportedLanguages) => {
    changeLanguage(language);
    Alert.alert(
      t('common.success'),
      t('settings.languages.changeSuccess'),
      [{ text: t('common.confirm') }]
    );
  };

  return (
    <ScreenContainer
      title={t('settings.languages.title')}
      backgroundColor={isDarkMode ? theme.dark.colors.background : theme.colors.background}
      showBackButton
    >
      <View style={styles.container}>
        {languageOptions.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.languageOption,
              currentLanguage === option.key && styles.selectedOption,
              isDarkMode && styles.languageOptionDark,
              currentLanguage === option.key && isDarkMode && styles.selectedOptionDark
            ]}
            onPress={() => selectLanguage(option.key)}
          >
            <Text
              style={[
                styles.languageLabel,
                currentLanguage === option.key && styles.selectedLabel,
                isDarkMode && styles.languageLabelDark,
                currentLanguage === option.key && isDarkMode && styles.selectedLabelDark
              ]}
            >
              {option.label}
            </Text>
            {currentLanguage === option.key && (
              <View style={[styles.checkmark, isDarkMode && styles.checkmarkDark]}>
                <Text style={styles.checkmarkText}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}

        <Text style={[styles.helpText, isDarkMode && styles.helpTextDark]}>
          {t('settings.languages.helpText')}
        </Text>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.md,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  languageOptionDark: {
    backgroundColor: theme.dark.colors.surface,
    borderColor: theme.dark.colors.border,
  },
  selectedOption: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
  },
  selectedOptionDark: {
    borderColor: theme.dark.colors.primary,
  },
  languageLabel: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textPrimary,
  },
  languageLabelDark: {
    color: theme.dark.colors.textPrimary,
  },
  selectedLabel: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  selectedLabelDark: {
    color: theme.dark.colors.primary,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkDark: {
    backgroundColor: theme.dark.colors.primary,
  },
  checkmarkText: {
    color: 'white',
    fontWeight: 'bold',
  },
  helpText: {
    marginTop: theme.spacing.lg,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  helpTextDark: {
    color: theme.dark.colors.textSecondary,
  },
});

export default LanguageSettingsScreen; 