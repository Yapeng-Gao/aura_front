import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import ScreenContainer from '../../components/common/ScreenContainer';
import Card from '../../components/common/Card';
import theme from '../../theme';

const VoiceAssistantScreen: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null);

  const voices = [
    {
      id: 'female1',
      name: '女声1',
      description: '温柔甜美的女声',
      icon: '👩',
    },
    {
      id: 'female2',
      name: '女声2',
      description: '成熟知性的女声',
      icon: '👩‍💼',
    },
    {
      id: 'male1',
      name: '男声1',
      description: '阳光活力的男声',
      icon: '👨',
    },
    {
      id: 'male2',
      name: '男声2',
      description: '成熟稳重的男声',
      icon: '👨‍💼',
    },
  ];

  const handleVoiceSelect = (voiceId: string) => {
    setSelectedVoice(voiceId);
  };

  const handleRecord = () => {
    setIsRecording(!isRecording);
    // TODO: 实现录音功能
    console.log('录音状态:', !isRecording);
  };

  return (
    <ScreenContainer
      title="语音助手"
      backgroundColor={theme.colors.background}
    >
      <ScrollView style={styles.container}>
        <Card title="选择声音" style={styles.card}>
          <View style={styles.voiceGrid}>
            {voices.map((voice) => (
              <TouchableOpacity
                key={voice.id}
                style={[
                  styles.voiceItem,
                  selectedVoice === voice.id && styles.selectedVoice,
                ]}
                onPress={() => handleVoiceSelect(voice.id)}
              >
                <Text style={styles.voiceIcon}>{voice.icon}</Text>
                <Text style={styles.voiceName}>{voice.name}</Text>
                <Text style={styles.voiceDescription}>{voice.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        <Card title="语音输入" style={styles.card}>
          <TouchableOpacity
            style={[
              styles.recordButton,
              isRecording && styles.recordingButton,
            ]}
            onPress={handleRecord}
          >
            <Text style={styles.recordButtonText}>
              {isRecording ? '停止录音' : '开始录音'}
            </Text>
          </TouchableOpacity>
        </Card>

        <Card title="语音助手功能" style={styles.card}>
          <TouchableOpacity style={styles.assistantFeature}>
            <Text style={styles.featureTitle}>语音转文字</Text>
            <Text style={styles.featureDescription}>将语音转换为文字内容</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.assistantFeature}>
            <Text style={styles.featureTitle}>文字转语音</Text>
            <Text style={styles.featureDescription}>将文字转换为语音输出</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.assistantFeature}>
            <Text style={styles.featureTitle}>实时翻译</Text>
            <Text style={styles.featureDescription}>支持多语言实时翻译</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.assistantFeature}>
            <Text style={styles.featureTitle}>语音命令</Text>
            <Text style={styles.featureDescription}>支持语音控制设备功能</Text>
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
  voiceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  voiceItem: {
    width: '48%',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    alignItems: 'center',
  },
  selectedVoice: {
    backgroundColor: `${theme.colors.primary}10`,
    borderColor: theme.colors.primary,
    borderWidth: 1,
  },
  voiceIcon: {
    fontSize: 32,
    marginBottom: theme.spacing.sm,
  },
  voiceName: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium as any,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  voiceDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  recordButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  recordingButton: {
    backgroundColor: theme.colors.error,
  },
  recordButtonText: {
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

export default VoiceAssistantScreen; 