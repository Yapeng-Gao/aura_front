import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import ScreenContainer from '../../components/common/ScreenContainer';
import Button from '../../components/common/Button';
import InputField from '../../components/common/InputField';
import theme from '../../theme';

const AssistantScreen: React.FC = () => {
  const [message, setMessage] = React.useState('');
  
  // 模拟消息数据
  const messages = [
    { id: '1', text: '您好！我是Aura，您的智能生活助手。有什么我可以帮您的吗？', sender: 'assistant', timestamp: '09:30' },
    { id: '2', text: '我想了解今天的天气情况', sender: 'user', timestamp: '09:31' },
    { id: '3', text: '北京今天天气晴朗，气温18-25℃，空气质量良好，适合户外活动。', sender: 'assistant', timestamp: '09:31' },
  ];

  const handleSendMessage = () => {
    if (message.trim()) {
      // 这里将来会集成实际的消息发送API
      setMessage('');
    }
  };

  return (
    <ScreenContainer
      title="智能助手"
      backgroundColor={theme.colors.background}
    >
      <View style={styles.container}>
        <View style={styles.chatContainer}>
          {messages.map((msg) => (
            <View 
              key={msg.id} 
              style={[
                styles.messageBubble,
                msg.sender === 'user' ? styles.userMessage : styles.assistantMessage
              ]}
            >
              {msg.sender === 'assistant' && (
                <Image
                  source={require('../../../assets/images/assistant-avatar-placeholder.png')}
                  style={styles.avatar}
                />
              )}
              <View style={[
                styles.messageContent,
                msg.sender === 'user' ? styles.userMessageContent : styles.assistantMessageContent
              ]}>
                <Text style={styles.messageText}>{msg.text}</Text>
                <Text style={styles.timestamp}>{msg.timestamp}</Text>
              </View>
            </View>
          ))}
        </View>
        
        <View style={styles.inputContainer}>
          <InputField
            placeholder="输入消息..."
            value={message}
            onChangeText={setMessage}
            style={styles.input}
            rightIcon={
              <Button
                title="发送"
                onPress={handleSendMessage}
                variant="primary"
                size="small"
                disabled={!message.trim()}
              />
            }
          />
        </View>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  chatContainer: {
    flex: 1,
    paddingVertical: theme.spacing.md,
  },
  messageBubble: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  assistantMessage: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: theme.spacing.sm,
  },
  messageContent: {
    maxWidth: '80%',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  userMessageContent: {
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: 0,
  },
  assistantMessageContent: {
    backgroundColor: theme.colors.assistant.bubble,
    borderBottomLeftRadius: 0,
  },
  messageText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textPrimary,
  },
  timestamp: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
    alignSelf: 'flex-end',
    marginTop: theme.spacing.xs,
  },
  inputContainer: {
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  input: {
    marginBottom: 0,
  },
});

export default AssistantScreen;
