import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Image, TouchableOpacity } from 'react-native';
import ScreenContainer from '../../components/common/ScreenContainer';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import ListItem from '../../components/common/ListItem';
import InputField from '../../components/common/InputField';
import theme from '../../theme';

const AISettingsScreen: React.FC = () => {
  // 助手个性化设置状态
  const [assistantName, setAssistantName] = useState('Aura');
  const [selectedVoice, setSelectedVoice] = useState('女声1');
  const [selectedPersonality, setSelectedPersonality] = useState('专业');
  const [selectedAvatar, setSelectedAvatar] = useState(1);
  
  // 隐私和数据设置状态
  const [saveConversations, setSaveConversations] = useState(true);
  const [useHistory, setUseHistory] = useState(true);
  const [shareData, setShareData] = useState(false);
  
  // 通知设置状态
  const [enableNotifications, setEnableNotifications] = useState(true);
  const [dailySummary, setDailySummary] = useState(true);
  const [smartReminders, setSmartReminders] = useState(true);
  
  // 可用的头像
  const avatars = [
    require('../../../assets/images/avatar1-placeholder.png'),
    require('../../../assets/images/avatar2-placeholder.png'),
    require('../../../assets/images/avatar3-placeholder.png'),
    require('../../../assets/images/avatar4-placeholder.png'),
  ];
  
  // 可用的性格类型
  const personalities = [
    { id: 'professional', name: '专业', description: '正式、专注于任务、提供精确信息' },
    { id: 'friendly', name: '友好', description: '温暖、亲切、对话风格轻松自然' },
    { id: 'humorous', name: '幽默', description: '风趣、活泼、喜欢在对话中加入笑点' },
    { id: 'concise', name: '简洁', description: '简明扼要、直接、避免冗长解释' },
  ];
  
  // 保存设置
  const handleSaveSettings = () => {
    // 这里将来会集成实际的设置保存API
    console.log('保存设置');
  };
  
  // 清除对话历史
  const handleClearHistory = () => {
    // 这里将来会集成实际的清除历史API
    console.log('清除对话历史');
  };

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
                  <Image source={avatar} style={styles.avatarImage} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.settingSection}>
            <Text style={styles.sectionTitle}>语音选择</Text>
            <View style={styles.radioGroup}>
              {['女声1', '女声2', '男声1', '男声2'].map((voice) => (
                <TouchableOpacity
                  key={voice}
                  style={styles.radioItem}
                  onPress={() => setSelectedVoice(voice)}
                >
                  <View style={[
                    styles.radioButton,
                    selectedVoice === voice && styles.radioButtonSelected
                  ]}>
                    {selectedVoice === voice && <View style={styles.radioButtonInner} />}
                  </View>
                  <Text style={styles.radioLabel}>{voice}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.settingSection}>
            <Text style={styles.sectionTitle}>性格类型</Text>
            {personalities.map((personality) => (
              <TouchableOpacity
                key={personality.id}
                style={[
                  styles.personalityItem,
                  selectedPersonality === personality.name && styles.selectedPersonalityItem
                ]}
                onPress={() => setSelectedPersonality(personality.name)}
              >
                <View style={styles.personalityHeader}>
                  <Text style={styles.personalityName}>{personality.name}</Text>
                  {selectedPersonality === personality.name && (
                    <Text style={styles.selectedIndicator}>✓</Text>
                  )}
                </View>
                <Text style={styles.personalityDescription}>{personality.description}</Text>
              </TouchableOpacity>
            ))}
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
            title="清除对话历史"
            variant="outline"
            size="medium"
            onPress={handleClearHistory}
            style={styles.clearButton}
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
          title="保存设置"
          variant="primary"
          size="large"
          onPress={handleSaveSettings}
          style={styles.saveButton}
          fullWidth
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
  card: {
    marginBottom: theme.spacing.md,
  },
  settingSection: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  avatarItem: {
    width: '23%',
    aspectRatio: 1,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: 'transparent',
    marginBottom: theme.spacing.sm,
    padding: 2,
  },
  selectedAvatarItem: {
    borderColor: theme.colors.primary,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: theme.borderRadius.md - 2,
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
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  radioButtonSelected: {
    borderColor: theme.colors.primary,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primary,
  },
  radioLabel: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textPrimary,
  },
  personalityItem: {
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  selectedPersonalityItem: {
    borderColor: theme.colors.primary,
    backgroundColor: `${theme.colors.primary}10`,
  },
  personalityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  personalityName: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  selectedIndicator: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.bold,
  },
  personalityDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  clearButton: {
    marginTop: theme.spacing.md,
    alignSelf: 'center',
  },
  saveButton: {
    marginVertical: theme.spacing.xl,
  },
});

export default AISettingsScreen;
