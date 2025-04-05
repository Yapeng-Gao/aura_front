import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ScreenContainer from '../../components/common/ScreenContainer';
import Card from '../../components/common/Card';
import theme from '../../theme';

const AssistantHomeScreen: React.FC = () => {
  const navigation = useNavigation();

  const assistants = [
    {
      id: 'ai',
      title: 'AI助手',
      description: '智能对话和问答',
      icon: '🤖',
      screen: 'AIAssistant',
    },
    {
      id: 'meeting',
      title: '会议助手',
      description: '会议管理和纪要生成',
      icon: '👥',
      screen: 'MeetingAssistant',
    },
    {
      id: 'writing',
      title: '写作助手',
      description: '智能写作和内容生成',
      icon: '✍️',
      screen: 'WritingAssistant',
    },
    {
      id: 'code',
      title: '代码助手',
      description: '代码生成和优化',
      icon: '💻',
      screen: 'CodeAssistant',
    },
    {
      id: 'image',
      title: '图像助手',
      description: '图像生成和编辑',
      icon: '🎨',
      screen: 'ImageAssistant',
    },
    {
      id: 'voice',
      title: '语音助手',
      description: '语音识别和合成',
      icon: '🎤',
      screen: 'VoiceAssistant',
    },
  ];

  const handleAssistantPress = (screen: string) => {
    navigation.navigate(screen as never);
  };

  return (
    <ScreenContainer
      title="智能助手"
      backgroundColor={theme.colors.background}
    >
      <ScrollView style={styles.container}>
        <Card title="选择助手" style={styles.card}>
          <View style={styles.assistantGrid}>
            {assistants.map((assistant) => (
              <TouchableOpacity
                key={assistant.id}
                style={styles.assistantItem}
                onPress={() => handleAssistantPress(assistant.screen)}
              >
                <Text style={styles.assistantIcon}>{assistant.icon}</Text>
                <Text style={styles.assistantTitle}>{assistant.title}</Text>
                <Text style={styles.assistantDescription}>{assistant.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
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
  assistantGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  assistantItem: {
    width: '48%',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    alignItems: 'center',
  },
  assistantIcon: {
    fontSize: 32,
    marginBottom: theme.spacing.sm,
  },
  assistantTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium as any,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  assistantDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});

export default AssistantHomeScreen; 