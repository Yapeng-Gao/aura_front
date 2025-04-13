import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import ScreenContainer from '../../components/common/ScreenContainer';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import ListItem from '../../components/common/ListItem';
import InputField from '../../components/common/InputField';
import theme from '../../theme';
import apiService from '../../services/api';
import { UpdateAssistantSettingsRequest } from '../../types/assistant';

const AISettingsScreen: React.FC = () => {
  // 助手个性化设置状态
  const [assistantName, setAssistantName] = useState('小艾');
  const [selectedVoice, setSelectedVoice] = useState('女声1');
  const [selectedPersonality, setSelectedPersonality] = useState<'专业' | '友好' | '幽默' | '平衡'>('专业');
  const [selectedResponseStyle, setSelectedResponseStyle] = useState<'简洁' | '详细' | '随意' | '正式'>('简洁');
  const [selectedAvatar, setSelectedAvatar] = useState(1);
  const [specialties, setSpecialties] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  
  // 隐私和数据设置状态
  const [saveConversations, setSaveConversations] = useState(true);
  const [useHistory, setUseHistory] = useState(true);
  const [shareData, setShareData] = useState(false);
  
  // 通知设置状态
  const [enableNotifications, setEnableNotifications] = useState(true);
  const [dailySummary, setDailySummary] = useState(true);
  const [smartReminders, setSmartReminders] = useState(true);

  // 加载助手设置
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        // 获取助手偏好设置
        const response = await apiService.assistant.getAssistantSettings();
        if (response) {
          setAssistantName(response.assistant_name);
          setSelectedPersonality(response.personality as '专业' | '友好' | '幽默' | '平衡');
          setSelectedResponseStyle(response.response_style as '简洁' | '详细' | '随意' | '正式');
          setSelectedVoice(response.voice);
          if (response.specialties) {
            setSpecialties(response.specialties);
          }
        }
      } catch (error) {
        console.error('加载设置失败:', error);
        Alert.alert('错误', '无法加载助手设置，请稍后再试。');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSettings();
  }, []);
  
  // 可用的头像
  const avatars = [
    require('../../../assets/images/avatar1-placeholder.png'),
    require('../../../assets/images/avatar2-placeholder.png'),
    require('../../../assets/images/avatar3-placeholder.png'),
    require('../../../assets/images/avatar4-placeholder.png'),
  ];
  
  // 可用的性格类型
  const personalities = [
    { id: '专业', name: '专业', description: '正式、专注于任务、提供精确信息' },
    { id: '友好', name: '友好', description: '温暖、亲切、对话风格轻松自然' },
    { id: '幽默', name: '幽默', description: '风趣、活泼、喜欢在对话中加入笑点' },
    { id: '平衡', name: '平衡', description: '根据情境调整风格，专业与友好的平衡' },
  ];
  
  // 响应风格选项
  const responseStyles = [
    { id: '简洁', name: '简洁', description: '简明扼要、直接、避免冗长解释' },
    { id: '详细', name: '详细', description: '提供全面的信息和背景知识' },
    { id: '随意', name: '随意', description: '使用日常语言，风格轻松' },
    { id: '正式', name: '正式', description: '使用正式语言，适合专业场合' },
  ];

  // 语音选项
  const voices = [
    { id: '女声1', name: '女声1', description: '标准女声' },
    { id: '女声2', name: '女声2', description: '温柔女声' },
    { id: '男声1', name: '男声1', description: '标准男声' },
    { id: '男声2', name: '男声2', description: '低沉男声' },
  ];
  
  // 保存设置
  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);
      
      const settings: UpdateAssistantSettingsRequest = {
        assistant_name: assistantName,
        personality: selectedPersonality,
        response_style: selectedResponseStyle,
        voice: selectedVoice,
        specialties
      };
      
      const response = await apiService.assistant.updateAssistantSettings(settings);
      
      if (response) {
        Alert.alert('成功', '助手设置已成功更新');
      } else {
        throw new Error('更新设置失败');
      }
    } catch (error) {
      console.error('保存设置失败:', error);
      Alert.alert('错误', '无法保存设置，请稍后再试。');
    } finally {
      setIsSaving(false);
    }
  };
  
  // 清除对话历史
  const handleClearHistory = async () => {
    try {
      Alert.alert(
        '确认删除',
        '确定要删除所有对话历史吗？此操作无法撤销。',
        [
          { text: '取消', style: 'cancel' },
          { 
            text: '确定', 
            style: 'destructive',
            onPress: async () => {
              try {
                setIsClearing(true);
                
                // 获取所有对话
                const conversations = await apiService.assistant.getConversations();
                
                if (conversations && conversations.conversations) {
                  // 删除所有对话
                  for (const conversation of conversations.conversations) {
                    await apiService.assistant.deleteConversation(conversation.id);
                  }
                  
                  Alert.alert('成功', '所有对话历史已清除');
                }
              } catch (error) {
                console.error('清除历史失败:', error);
                Alert.alert('错误', '无法清除对话历史，请稍后再试。');
              } finally {
                setIsClearing(false);
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('清除历史错误:', error);
    }
  };

  if (isLoading) {
    return (
      <ScreenContainer
        title="AI助手设置"
        backgroundColor={theme.colors.background}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>加载设置中...</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      title="AI助手设置"
      backgroundColor={theme.colors.background}
    >
      <ScrollView style={styles.container}>
        <Card title="个性化设置" style={styles.card}>
          <View style={styles.settingSection}>
            <Text style={styles.sectionTitle}>助手名称</Text>
            <InputField
              placeholder="输入助手名称"
              value={assistantName}
              onChangeText={setAssistantName}
            />
          </View>
          
          <View style={styles.settingSection}>
            <Text style={styles.sectionTitle}>选择头像</Text>
            <View style={styles.avatarGrid}>
              {avatars.map((avatar, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.avatarItem,
                    selectedAvatar === index && styles.selectedAvatarItem
                  ]}
                  onPress={() => setSelectedAvatar(index)}
                >
                  <Image source={avatar} style={styles.avatarImage as any} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.settingSection}>
            <Text style={styles.sectionTitle}>语音选择</Text>
            <View style={styles.radioGroup}>
              {voices.map(voice => (
                <TouchableOpacity
                  key={voice.id}
                  style={styles.radioItem}
                  onPress={() => setSelectedVoice(voice.id)}
                >
                  <View style={[
                    styles.radioButton,
                    selectedVoice === voice.id && styles.radioButtonSelected
                  ]}>
                    {selectedVoice === voice.id && <View style={styles.radioButtonInner} />}
                  </View>
                  <View>
                    <Text style={styles.radioLabel}>{voice.name}</Text>
                    <Text style={styles.radioDescription}>{voice.description}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.settingSection}>
            <Text style={styles.sectionTitle}>性格类型</Text>
            {personalities.map(personality => (
              <TouchableOpacity
                key={personality.id}
                style={[
                  styles.personalityItem,
                  selectedPersonality === personality.id && styles.selectedPersonalityItem
                ]}
                onPress={() => setSelectedPersonality(personality.id as any)}
              >
                <View style={styles.personalityHeader}>
                  <Text style={styles.personalityName}>{personality.name}</Text>
                  {selectedPersonality === personality.id && (
                    <Text style={styles.selectedIndicator}>✓</Text>
                  )}
                </View>
                <Text style={styles.personalityDescription}>{personality.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={styles.settingSection}>
            <Text style={styles.sectionTitle}>响应风格</Text>
            {responseStyles.map(style => (
              <TouchableOpacity
                key={style.id}
                style={[
                  styles.personalityItem,
                  selectedResponseStyle === style.id && styles.selectedPersonalityItem
                ]}
                onPress={() => setSelectedResponseStyle(style.id as any)}
              >
                <View style={styles.personalityHeader}>
                  <Text style={styles.personalityName}>{style.name}</Text>
                  {selectedResponseStyle === style.id && (
                    <Text style={styles.selectedIndicator}>✓</Text>
                  )}
                </View>
                <Text style={styles.personalityDescription}>{style.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={styles.settingSection}>
            <Text style={styles.sectionTitle}>专长领域（可选）</Text>
            <InputField
              placeholder="输入助手的专长领域，多个专长用逗号分隔"
              value={specialties}
              onChangeText={setSpecialties}
              multiline
              numberOfLines={3}
            />
          </View>
        </Card>
        
        <Card title="隐私与数据" style={styles.card}>
          <ListItem
            title="保存对话历史"
            subtitle="允许保存您与AI助手的对话记录"
            rightIcon={
              <Switch
                value={saveConversations}
                onValueChange={setSaveConversations}
                trackColor={{ false: theme.colors.divider, true: `${theme.colors.primary}80` }}
                thumbColor={saveConversations ? theme.colors.primary : theme.colors.surface}
              />
            }
          />
          
          <ListItem
            title="使用历史记录改进回答"
            subtitle="允许AI助手使用您的历史对话来提供更相关的回答"
            rightIcon={
              <Switch
                value={useHistory}
                onValueChange={setUseHistory}
                trackColor={{ false: theme.colors.divider, true: `${theme.colors.primary}80` }}
                thumbColor={useHistory ? theme.colors.primary : theme.colors.surface}
              />
            }
          />
          
          <ListItem
            title="分享匿名数据"
            subtitle="分享匿名使用数据以帮助改进AI助手"
            rightIcon={
              <Switch
                value={shareData}
                onValueChange={setShareData}
                trackColor={{ false: theme.colors.divider, true: `${theme.colors.primary}80` }}
                thumbColor={shareData ? theme.colors.primary : theme.colors.surface}
              />
            }
            divider={false}
          />
          
          <Button
            title={isClearing ? "清除中..." : "清除对话历史"}
            variant="outline"
            size="medium"
            onPress={handleClearHistory}
            style={styles.clearButton}
            disabled={isClearing}
          />
        </Card>
        
        <Card title="通知设置" style={styles.card}>
          <ListItem
            title="启用通知"
            subtitle="接收来自AI助手的通知"
            rightIcon={
              <Switch
                value={enableNotifications}
                onValueChange={setEnableNotifications}
                trackColor={{ false: theme.colors.divider, true: `${theme.colors.primary}80` }}
                thumbColor={enableNotifications ? theme.colors.primary : theme.colors.surface}
              />
            }
          />
          
          <ListItem
            title="每日摘要"
            subtitle="接收每日日程和任务摘要"
            rightIcon={
              <Switch
                value={dailySummary}
                onValueChange={setDailySummary}
                trackColor={{ false: theme.colors.divider, true: `${theme.colors.primary}80` }}
                thumbColor={dailySummary ? theme.colors.primary : theme.colors.surface}
                disabled={!enableNotifications}
              />
            }
          />
          
          <ListItem
            title="智能提醒"
            subtitle="根据您的习惯和日程接收智能提醒"
            rightIcon={
              <Switch
                value={smartReminders}
                onValueChange={setSmartReminders}
                trackColor={{ false: theme.colors.divider, true: `${theme.colors.primary}80` }}
                thumbColor={smartReminders ? theme.colors.primary : theme.colors.surface}
                disabled={!enableNotifications}
              />
            }
            divider={false}
          />
        </Card>
        
        <Button
          title={isSaving ? "保存中..." : "保存设置"}
          variant="primary"
          size="large"
          onPress={handleSaveSettings}
          style={styles.saveButton}
          fullWidth
          disabled={isSaving}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
  },
  card: {
    marginBottom: theme.spacing.md,
  },
  settingSection: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: "600",
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: theme.spacing.sm,
  },
  avatarItem: {
    width: 70,
    height: 70,
    borderRadius: 35,
    margin: theme.spacing.xs,
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedAvatarItem: {
    borderColor: theme.colors.primary,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
  radioGroup: {
    marginTop: theme.spacing.sm,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    marginRight: theme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    backgroundColor: theme.colors.background,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primary,
  },
  radioLabel: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: "500",
    color: theme.colors.textPrimary,
  },
  radioDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  personalityItem: {
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.cardBackground,
    marginBottom: theme.spacing.sm,
    elevation: 1,
  },
  selectedPersonalityItem: {
    borderColor: theme.colors.primary,
    borderWidth: 1,
    backgroundColor: `${theme.colors.primary}10`,
  },
  personalityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  personalityName: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: "600",
    color: theme.colors.textPrimary,
  },
  selectedIndicator: {
    color: theme.colors.primary,
    fontWeight: "600",
  },
  personalityDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  clearButton: {
    marginTop: theme.spacing.md,
  },
  saveButton: {
    marginVertical: theme.spacing.xl,
  },
});

export default AISettingsScreen;
