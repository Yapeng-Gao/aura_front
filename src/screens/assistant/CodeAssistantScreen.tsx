import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import ScreenContainer from '../../components/common/ScreenContainer';
import Card from '../../components/common/Card';
import theme from '../../theme';

const CodeAssistantScreen: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);

  const languages = [
    {
      id: 'typescript',
      name: 'TypeScript',
      icon: '📘',
      description: '类型安全的 JavaScript',
    },
    {
      id: 'javascript',
      name: 'JavaScript',
      icon: '📙',
      description: '动态编程语言',
    },
    {
      id: 'python',
      name: 'Python',
      icon: '🐍',
      description: '简洁优雅的编程语言',
    },
    {
      id: 'java',
      name: 'Java',
      icon: '☕',
      description: '面向对象的编程语言',
    },
  ];

  const handleLanguageSelect = (languageId: string) => {
    setSelectedLanguage(languageId);
  };

  const handleGenerate = () => {
    if (inputText.trim()) {
      // TODO: 调用AI生成代码
      console.log('生成代码:', inputText);
    }
  };

  return (
    <ScreenContainer
      title="代码助手"
      backgroundColor={theme.colors.background}
    >
      <ScrollView style={styles.container}>
        <Card title="选择编程语言" style={styles.card}>
          <View style={styles.languageGrid}>
            {languages.map((language) => (
              <TouchableOpacity
                key={language.id}
                style={[
                  styles.languageItem,
                  selectedLanguage === language.id && styles.selectedLanguage,
                ]}
                onPress={() => handleLanguageSelect(language.id)}
              >
                <Text style={styles.languageIcon}>{language.icon}</Text>
                <Text style={styles.languageName}>{language.name}</Text>
                <Text style={styles.languageDescription}>{language.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        <Card title="代码生成" style={styles.card}>
          <TextInput
            style={styles.input}
            placeholder="描述您想要生成的代码..."
            value={inputText}
            onChangeText={setInputText}
            multiline
            numberOfLines={4}
          />
          <TouchableOpacity
            style={[
              styles.generateButton,
              !inputText.trim() && styles.disabledButton,
            ]}
            onPress={handleGenerate}
            disabled={!inputText.trim()}
          >
            <Text style={styles.generateButtonText}>生成代码</Text>
          </TouchableOpacity>
        </Card>

        <Card title="代码助手功能" style={styles.card}>
          <TouchableOpacity style={styles.assistantFeature}>
            <Text style={styles.featureTitle}>代码优化</Text>
            <Text style={styles.featureDescription}>优化代码性能，提升代码质量</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.assistantFeature}>
            <Text style={styles.featureTitle}>代码重构</Text>
            <Text style={styles.featureDescription}>重构代码结构，提高可维护性</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.assistantFeature}>
            <Text style={styles.featureTitle}>单元测试</Text>
            <Text style={styles.featureDescription}>生成单元测试用例</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.assistantFeature}>
            <Text style={styles.featureTitle}>代码解释</Text>
            <Text style={styles.featureDescription}>解释代码逻辑，生成注释</Text>
          </TouchableOpacity>
        </Card>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.md,
  },
  card: {
    marginBottom: theme.spacing.md,
  },
  languageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  languageItem: {
    width: '48%',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    alignItems: 'center',
  },
  selectedLanguage: {
    backgroundColor: `${theme.colors.primary}10`,
    borderColor: theme.colors.primary,
    borderWidth: 1,
  },
  languageIcon: {
    fontSize: 32,
    marginBottom: theme.spacing.sm,
  },
  languageName: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium as any,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  languageDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textPrimary,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  generateButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  disabledButton: {
    backgroundColor: theme.colors.textDisabled,
  },
  generateButtonText: {
    color: theme.colors.onPrimary,
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium as any,
  },
  assistantFeature: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  featureTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium as any,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  featureDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
});

export default CodeAssistantScreen; 