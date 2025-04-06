import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Alert, Platform } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../../components/common/ScreenContainer';
import Card from '../../components/common/Card';
import theme from '../../theme';
import { voiceAssistantApi } from '../../services/api';
import { Voice } from '../../types/assistant';

const VoiceAssistantScreen: React.FC = () => {
  // 录音相关状态
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStatus, setRecordingStatus] = useState<'idle' | 'recording' | 'processing'>('idle');
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const durationTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // 语音和翻译相关状态
  const [selectedVoice, setSelectedVoice] = useState<string | null>('alloy');
  const [voices, setVoices] = useState<Voice[]>([]);
  const [transcribedText, setTranscribedText] = useState<string>('');
  const [inputText, setInputText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedAudioUri, setGeneratedAudioUri] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // 历史记录
  const [history, setHistory] = useState<Array<{
    type: 'transcription' | 'generation' | 'translation',
    text: string,
    audioUri?: string,
    timestamp: Date
  }>>([]);

  // 从API获取可用的语音
  useEffect(() => {
    const fetchVoices = async () => {
      try {
        const availableVoices = await voiceAssistantApi.getVoices();
        if (availableVoices.length > 0) {
          setVoices(availableVoices);
        } else {
          // 如果API未返回数据，使用默认值
          setVoices(getDefaultVoices());
        }
      } catch (error) {
        console.error('获取语音列表失败:', error);
        setVoices(getDefaultVoices());
      }
    };
    
    fetchVoices();
    
    // 确保音频系统已配置
    configureAudio();
    
    // 组件卸载时释放资源
    return () => {
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
      }
      stopRecording();
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  // 配置音频系统
  const configureAudio = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: false,
      });
    } catch (error) {
      console.error('音频系统配置失败:', error);
      Alert.alert('提示', '初始化音频系统失败，请检查应用权限设置');
    }
  };

  // 默认语音列表
  const getDefaultVoices = (): Voice[] => {
    return [
      {
        id: 'alloy',
        name: 'Alloy',
        gender: 'neutral',
        description: '中性声音，平稳专业',
        preview_url: '/assets/audio/voices/alloy.mp3'
      },
      {
        id: 'echo',
        name: 'Echo',
        gender: 'female',
        description: '女性声音，沉稳清晰',
        preview_url: '/assets/audio/voices/echo.mp3'
      },
      {
        id: 'onyx',
        name: 'Onyx',
        gender: 'male',
        description: '男性声音，深沉有力',
        preview_url: '/assets/audio/voices/onyx.mp3'
      },
      {
        id: 'nova',
        name: 'Nova',
        gender: 'female',
        description: '女性声音，自然亲切',
        preview_url: '/assets/audio/voices/nova.mp3'
      },
    ];
  };

  // 处理语音选择
  const handleVoiceSelect = (voiceId: string) => {
    setSelectedVoice(voiceId);
  };

  // 开始录音
  const startRecording = async () => {
    try {
      // 确保之前的录音已停止
      if (recording) {
        await stopRecording();
      }
      
      setRecordingStatus('recording');
      setRecordingDuration(0);
      
      // 开始计时
      durationTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      
      // 创建新录音
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(newRecording);
      setIsRecording(true);
    } catch (error) {
      console.error('开始录音失败:', error);
      Alert.alert('错误', '无法开始录音，请检查麦克风权限');
      setRecordingStatus('idle');
    }
  };

  // 停止录音
  const stopRecording = async () => {
    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
    }
    
    if (!recording) {
      return;
    }
    
    try {
      setIsRecording(false);
      
      // 停止录音
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      
      if (uri) {
        setRecordingUri(uri);
      }
      
      setRecording(null);
      setRecordingStatus('idle');
    } catch (error) {
      console.error('停止录音失败:', error);
      setRecordingStatus('idle');
    }
  };

  // 转录录音
  const transcribeRecording = async () => {
    if (!recordingUri) {
      Alert.alert('提示', '请先录制一段语音');
      return;
    }
    
    setRecordingStatus('processing');
    setIsProcessing(true);
    
    try {
      // 准备文件
      const fileInfo = await FileSystem.getInfoAsync(recordingUri);
      
      if (!fileInfo.exists) {
        throw new Error('录音文件不存在');
      }
      
      // 创建FormData对象
      const audioFile = {
        uri: recordingUri,
        type: 'audio/m4a',
        name: 'recording.m4a',
      };
      
      // 调用API转录
      const result = await voiceAssistantApi.transcribeAudio(audioFile);
      
      setTranscribedText(result.text);
      setInputText(result.text);
      
      // 添加到历史记录
      addToHistory('transcription', result.text, recordingUri);
      
      Alert.alert('转录成功', '语音已成功转录为文本');
    } catch (error) {
      console.error('语音转录失败:', error);
      Alert.alert('错误', '语音转录失败，请重试');
    } finally {
      setIsProcessing(false);
      setRecordingStatus('idle');
    }
  };

  // 生成语音
  const generateSpeech = async () => {
    if (!inputText || !selectedVoice) {
      Alert.alert('提示', '请输入文本并选择一个语音');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // 调用API生成语音
      const result = await voiceAssistantApi.generateSpeech(
        inputText,
        selectedVoice,
        1.0,
        { format: 'mp3' }
      );
      
      // 下载生成的音频
      const fileUri = `${FileSystem.cacheDirectory}generated_speech_${Date.now()}.mp3`;
      await FileSystem.downloadAsync(result.audio_url, fileUri);
      
      setGeneratedAudioUri(fileUri);
      
      // 添加到历史记录
      addToHistory('generation', inputText, fileUri);
      
      // 自动播放生成的语音
      playAudio(fileUri);
    } catch (error) {
      console.error('语音生成失败:', error);
      Alert.alert('错误', '语音生成失败，请重试');
    } finally {
      setIsProcessing(false);
    }
  };

  // 播放音频
  const playAudio = async (uri: string) => {
    try {
      // 卸载之前的音频
      if (sound) {
        await sound.unloadAsync();
      }
      
      // 加载新音频
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true }
      );
      
      // 设置播放状态更新回调
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          setIsPlaying(status.isPlaying);
          if (status.didJustFinish) {
            setIsPlaying(false);
          }
        }
      });
      
      setSound(newSound);
      setIsPlaying(true);
    } catch (error) {
      console.error('播放音频失败:', error);
      Alert.alert('错误', '无法播放音频');
    }
  };

  // 暂停音频
  const pauseAudio = async () => {
    if (sound) {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
    }
  };

  // 分享音频
  const shareAudio = async (uri: string) => {
    try {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert('提示', '您的设备不支持分享功能');
      }
    } catch (error) {
      console.error('分享音频失败:', error);
      Alert.alert('错误', '分享音频失败');
    }
  };

  // 添加到历史记录
  const addToHistory = (type: 'transcription' | 'generation' | 'translation', text: string, audioUri?: string) => {
    setHistory(prev => [
      {
        type,
        text,
        audioUri,
        timestamp: new Date()
      },
      ...prev.slice(0, 9) // 只保留最近10条记录
    ]);
  };

  // 格式化录音时长
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 录音按钮点击处理
  const handleRecordButtonPress = async () => {
    if (isRecording) {
      await stopRecording();
    } else {
      await startRecording();
    }
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
                <Text style={styles.voiceIcon}>
                  {voice.gender === 'female' ? '👩' : voice.gender === 'male' ? '👨' : '🧑'}
                </Text>
                <Text style={styles.voiceName}>{voice.name}</Text>
                <Text style={styles.voiceDescription}>{voice.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        <Card title="语音输入" style={styles.card}>
          <View style={styles.recordingContainer}>
            <TouchableOpacity
              style={[
                styles.recordButton,
                isRecording && styles.recordingButton,
              ]}
              onPress={handleRecordButtonPress}
              disabled={recordingStatus === 'processing'}
            >
              <Ionicons 
                name={isRecording ? 'stop' : 'mic'} 
                size={28} 
                color={theme.colors.onPrimary} 
              />
              <Text style={styles.recordButtonText}>
                {isRecording ? '停止录音' : '开始录音'}
              </Text>
            </TouchableOpacity>
            
            {isRecording && (
              <Text style={styles.durationText}>
                录音时长: {formatDuration(recordingDuration)}
              </Text>
            )}
            
            {recordingUri && recordingStatus !== 'processing' && (
              <View style={styles.recordingActions}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => playAudio(recordingUri)}
                >
                  <Ionicons name="play" size={20} color={theme.colors.primary} />
                  <Text style={styles.actionText}>播放</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={transcribeRecording}
                >
                  <Ionicons name="text" size={20} color={theme.colors.primary} />
                  <Text style={styles.actionText}>转录</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => shareAudio(recordingUri)}
                >
                  <Ionicons name="share" size={20} color={theme.colors.primary} />
                  <Text style={styles.actionText}>分享</Text>
                </TouchableOpacity>
              </View>
            )}
            
            {recordingStatus === 'processing' && (
              <View style={styles.processingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.processingText}>处理中...</Text>
              </View>
            )}
          </View>
        </Card>

        <Card title="文本转语音" style={styles.card}>
          <TextInput
            style={styles.textInput}
            multiline
            placeholder="输入要转换为语音的文本"
            value={inputText}
            onChangeText={setInputText}
          />
          
          <TouchableOpacity
            style={[
              styles.generateButton,
              isProcessing && styles.disabledButton,
            ]}
            onPress={generateSpeech}
            disabled={isProcessing || !inputText}
          >
            <Ionicons name="volume-high" size={20} color={theme.colors.onPrimary} />
            <Text style={styles.generateButtonText}>生成语音</Text>
          </TouchableOpacity>
          
          {generatedAudioUri && (
            <View style={styles.audioPlayerContainer}>
              <TouchableOpacity
                style={styles.playButton}
                onPress={pauseAudio}
              >
                <Ionicons 
                  name={isPlaying ? 'pause' : 'play'} 
                  size={24} 
                  color={theme.colors.primary} 
                />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.shareButton}
                onPress={() => shareAudio(generatedAudioUri)}
              >
                <Ionicons name="share-outline" size={24} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
          )}
        </Card>

        {history.length > 0 && (
          <Card title="历史记录" style={styles.card}>
            {history.map((item, index) => (
              <View key={index} style={styles.historyItem}>
                <View style={styles.historyHeader}>
                  <Text style={styles.historyType}>
                    {item.type === 'transcription' ? '语音转文字' : 
                     item.type === 'generation' ? '文字转语音' : '语音翻译'}
                  </Text>
                  <Text style={styles.historyTime}>
                    {item.timestamp.toLocaleTimeString()}
                  </Text>
                </View>
                
                <Text style={styles.historyText} numberOfLines={2}>
                  {item.text}
                </Text>
                
                {item.audioUri && (
                  <View style={styles.historyActions}>
                    <TouchableOpacity 
                      style={styles.historyAction}
                      onPress={() => playAudio(item.audioUri!)}
                    >
                      <Ionicons name="play-circle" size={20} color={theme.colors.primary} />
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.historyAction}
                      onPress={() => shareAudio(item.audioUri!)}
                    >
                      <Ionicons name="share-social" size={20} color={theme.colors.primary} />
                    </TouchableOpacity>
                    
                    {item.type === 'transcription' && (
                      <TouchableOpacity 
                        style={styles.historyAction}
                        onPress={() => setInputText(item.text)}
                      >
                        <Ionicons name="copy" size={20} color={theme.colors.primary} />
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            ))}
          </Card>
        )}

        <Card title="语音助手功能" style={styles.card}>
          <TouchableOpacity style={styles.assistantFeature}>
            <View style={styles.featureHeader}>
              <Ionicons name="mic-outline" size={24} color={theme.colors.primary} />
              <Text style={styles.featureTitle}>语音转文字</Text>
            </View>
            <Text style={styles.featureDescription}>将语音转换为文字内容，支持多种语言识别</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.assistantFeature}>
            <View style={styles.featureHeader}>
              <Ionicons name="volume-high-outline" size={24} color={theme.colors.primary} />
              <Text style={styles.featureTitle}>文字转语音</Text>
            </View>
            <Text style={styles.featureDescription}>将文字转换为多种声音，可调节语速和语调</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.assistantFeature}>
            <View style={styles.featureHeader}>
              <Ionicons name="globe-outline" size={24} color={theme.colors.primary} />
              <Text style={styles.featureTitle}>实时翻译</Text>
            </View>
            <Text style={styles.featureDescription}>支持10多种语言之间的实时语音翻译</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.assistantFeature}>
            <View style={styles.featureHeader}>
              <Ionicons name="save-outline" size={24} color={theme.colors.primary} />
              <Text style={styles.featureTitle}>录音保存</Text>
            </View>
            <Text style={styles.featureDescription}>保存录音和转录内容，支持分享和导出</Text>
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
    backgroundColor: `${theme.colors.primary}20`,
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
  recordingContainer: {
    alignItems: 'center',
    padding: theme.spacing.sm,
  },
  recordButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 180,
  },
  recordingButton: {
    backgroundColor: theme.colors.error,
  },
  recordButtonText: {
    color: theme.colors.onPrimary,
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium as any,
    marginLeft: 8,
  },
  durationText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
  },
  recordingActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.spacing.md,
  },
  actionButton: {
    alignItems: 'center',
    marginHorizontal: theme.spacing.md,
  },
  actionText: {
    marginTop: 4,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  processingContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  processingText: {
    marginTop: theme.spacing.sm,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
  },
  textInput: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  generateButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: `${theme.colors.primary}50`,
    opacity: 0.7,
  },
  generateButtonText: {
    color: theme.colors.onPrimary,
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium as any,
    marginLeft: 8,
  },
  audioPlayerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
  },
  playButton: {
    marginRight: theme.spacing.md,
  },
  shareButton: {
    marginLeft: theme.spacing.md,
  },
  historyItem: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  },
  historyType: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium as any,
    color: theme.colors.primary,
  },
  historyTime: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textTertiary,
  },
  historyText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  historyActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
    paddingTop: theme.spacing.sm,
  },
  historyAction: {
    marginRight: theme.spacing.md,
  },
  assistantFeature: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  featureTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium as any,
    color: theme.colors.textPrimary,
    marginLeft: theme.spacing.sm,
  },
  featureDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginLeft: 32,
  },
});

export default VoiceAssistantScreen; 