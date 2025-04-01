import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import ScreenContainer from '../../components/common/ScreenContainer';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import theme from '../../theme';

// 模拟消息数据类型
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  attachments?: {
    type: 'image' | 'audio' | 'file';
    url: string;
    thumbnail?: string;
    name?: string;
  }[];
  isProcessing?: boolean;
}

const AIAssistantScreen: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: '您好！我是Aura，您的智能生活助手。今天我能为您做些什么？',
      sender: 'assistant',
      timestamp: '09:30',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showInputOptions, setShowInputOptions] = useState(false);
  
  const scrollViewRef = useRef<ScrollView>(null);
  
  // 自动滚动到底部
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);
  
  // 发送消息
  const handleSendMessage = () => {
    if (inputText.trim()) {
      // 添加用户消息
      const userMessage: Message = {
        id: Date.now().toString(),
        text: inputText,
        sender: 'user',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      
      setMessages(prev => [...prev, userMessage]);
      setInputText('');
      
      // 模拟AI助手回复
      setTimeout(() => {
        // 先添加一个处理中的消息
        const processingMessage: Message = {
          id: `processing-${Date.now()}`,
          text: '正在思考...',
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isProcessing: true,
        };
        
        setMessages(prev => [...prev, processingMessage]);
        
        // 2秒后替换为实际回复
        setTimeout(() => {
          setMessages(prev => {
            const filtered = prev.filter(msg => !msg.isProcessing);
            return [...filtered, {
              id: Date.now().toString(),
              text: getAIResponse(inputText),
              sender: 'assistant',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }];
          });
        }, 2000);
      }, 500);
    }
  };
  
  // 模拟AI回复
  const getAIResponse = (userInput: string): string => {
    const lowerInput = userInput.toLowerCase();
    
    if (lowerInput.includes('你好') || lowerInput.includes('嗨') || lowerInput.includes('hi')) {
      return '您好！很高兴为您服务。请问有什么我可以帮助您的吗？';
    } else if (lowerInput.includes('天气')) {
      return '根据最新天气预报，今天天气晴朗，气温18-25℃，空气质量良好，适合户外活动。';
    } else if (lowerInput.includes('日程') || lowerInput.includes('安排') || lowerInput.includes('计划')) {
      return '您今天有3个日程安排：\n1. 10:00 产品团队会议\n2. 14:30 客户演示\n3. 18:00 健身';
    } else if (lowerInput.includes('笔记') || lowerInput.includes('记录')) {
      return '我可以帮您记录笔记。请告诉我您想记录的内容，或者您可以使用语音录入功能。';
    } else if (lowerInput.includes('智能家居') || lowerInput.includes('设备')) {
      return '您的智能家居系统已连接。客厅灯已开启，空调温度设置为24℃，窗帘已关闭。';
    } else if (lowerInput.includes('创意') || lowerInput.includes('灵感')) {
      return '我可以帮您生成创意内容。请告诉我您需要什么类型的创意，例如文案、图片创意或者音乐灵感。';
    } else {
      return '我理解您的问题。请允许我为您提供更多相关信息或者解决方案。您可以尝试更具体地描述您的需求。';
    }
  };
  
  // 开始语音输入
  const handleVoiceInput = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      // 开始录音逻辑
      console.log('开始录音');
    } else {
      // 结束录音逻辑
      console.log('结束录音');
      
      // 模拟语音识别结果
      setTimeout(() => {
        setInputText('这是通过语音识别转换的文本');
      }, 1000);
    }
  };
  
  // 切换输入选项显示
  const toggleInputOptions = () => {
    setShowInputOptions(!showInputOptions);
  };
  
  // 处理图片上传
  const handleImageUpload = () => {
    console.log('上传图片');
    setShowInputOptions(false);
    
    // 模拟图片上传和发送
    setTimeout(() => {
      const imageMessage: Message = {
        id: Date.now().toString(),
        text: '我发送了一张图片',
        sender: 'user',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        attachments: [
          {
            type: 'image',
            url: 'https://example.com/image.jpg',
            thumbnail: 'https://example.com/image_thumb.jpg',
          }
        ]
      };
      
      setMessages(prev => [...prev, imageMessage]);
      
      // 模拟AI助手回复
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          text: '我已收到您的图片。这看起来是一张风景照片，拍摄得很美。',
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }]);
      }, 1500);
    }, 1000);
  };
  
  return (
    <ScreenContainer
      title="Aura 智能助手"
      backgroundColor={theme.colors.background}
    >
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
        >
          {messages.map((message) => (
            <View 
              key={message.id} 
              style={[
                styles.messageBubble,
                message.sender === 'user' ? styles.userMessage : styles.assistantMessage,
                message.isProcessing && styles.processingMessage
              ]}
            >
              {message.sender === 'assistant' && (
                <View style={styles.avatarContainer}>
                  <Image
                    source={require('../../../assets/images/assistant-avatar-placeholder.png')}
                    style={styles.avatar}
                  />
                </View>
              )}
              
              <View style={[
                styles.messageContent,
                message.sender === 'user' ? styles.userMessageContent : styles.assistantMessageContent,
                message.isProcessing && styles.processingMessageContent
              ]}>
                <Text style={[
                  styles.messageText,
                  message.sender === 'user' ? styles.userMessageText : styles.assistantMessageText,
                  message.isProcessing && styles.processingMessageText
                ]}>
                  {message.text}
                </Text>
                
                {message.attachments && message.attachments.map((attachment, index) => (
                  <View key={index} style={styles.attachmentContainer}>
                    {attachment.type === 'image' && (
                      <Image
                        source={{ uri: attachment.thumbnail || attachment.url }}
                        style={styles.attachmentImage}
                        resizeMode="cover"
                      />
                    )}
                    {attachment.type === 'file' && (
                      <View style={styles.fileAttachment}>
                        <Text style={styles.fileName}>{attachment.name}</Text>
                      </View>
                    )}
                  </View>
                ))}
                
                <Text style={[
                  styles.timestamp,
                  message.sender === 'user' ? styles.userTimestamp : styles.assistantTimestamp
                ]}>
                  {message.timestamp}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
        
        {showInputOptions && (
          <View style={styles.inputOptionsContainer}>
            <TouchableOpacity style={styles.inputOption} onPress={handleImageUpload}>
              <View style={styles.inputOptionIcon}>
                <Text style={styles.inputOptionIconText}>📷</Text>
              </View>
              <Text style={styles.inputOptionText}>图片</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.inputOption}>
              <View style={styles.inputOptionIcon}>
                <Text style={styles.inputOptionIconText}>📄</Text>
              </View>
              <Text style={styles.inputOptionText}>文件</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.inputOption}>
              <View style={styles.inputOptionIcon}>
                <Text style={styles.inputOptionIconText}>📝</Text>
              </View>
              <Text style={styles.inputOptionText}>手写</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.inputOption}>
              <View style={styles.inputOptionIcon}>
                <Text style={styles.inputOptionIconText}>🔍</Text>
              </View>
              <Text style={styles.inputOptionText}>扫描</Text>
            </TouchableOpacity>
          </View>
        )}
        
        <View style={styles.inputContainer}>
          <TouchableOpacity 
            style={styles.inputButton}
            onPress={toggleInputOptions}
          >
            <Text style={styles.inputButtonText}>+</Text>
          </TouchableOpacity>
          
          <TextInput
            style={styles.textInput}
            placeholder="输入消息..."
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          
          {inputText.trim() ? (
            <TouchableOpacity 
              style={styles.sendButton}
              onPress={handleSendMessage}
            >
              <Text style={styles.sendButtonText}>发送</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={[styles.voiceButton, isRecording && styles.recordingButton]}
              onPress={handleVoiceInput}
            >
              <Text style={styles.voiceButtonText}>🎤</Text>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  messageBubble: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
    maxWidth: '100%',
  },
  userMessage: {
    justifyContent: 'flex-end',
    marginLeft: 50,
  },
  assistantMessage: {
    justifyContent: 'flex-start',
    marginRight: 50,
  },
  processingMessage: {
    opacity: 0.7,
  },
  avatarContainer: {
    marginRight: theme.spacing.sm,
    alignSelf: 'flex-end',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  messageContent: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    maxWidth: '85%',
  },
  userMessageContent: {
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: 0,
  },
  assistantMessageContent: {
    backgroundColor: theme.colors.surface,
    borderBottomLeftRadius: 0,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  processingMessageContent: {
    borderStyle: 'dashed',
  },
  messageText: {
    fontSize: theme.typography.fontSize.md,
    lineHeight: 20,
  },
  userMessageText: {
    color: theme.colors.onPrimary,
  },
  assistantMessageText: {
    color: theme.colors.textPrimary,
  },
  processingMessageText: {
    fontStyle: 'italic',
  },
  timestamp: {
    fontSize: theme.typography.fontSize.xs,
    marginTop: theme.spacing.xs,
    alignSelf: 'flex-end',
  },
  userTimestamp: {
    color: theme.colors.onPrimary + '99', // 添加透明度
  },
  assistantTimestamp: {
    color: theme.colors.textSecondary,
  },
  attachmentContainer: {
    marginTop: theme.spacing.sm,
  },
  attachmentImage: {
    width: '100%',
    height: 150,
    borderRadius: theme.borderRadius.sm,
  },
  fileAttachment: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.sm,
  },
  fileName: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary,
  },
  inputOptionsContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    padding: theme.spacing.sm,
    justifyContent: 'space-around',
  },
  inputOption: {
    alignItems: 'center',
    padding: theme.spacing.sm,
  },
  inputOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xs,
  },
  inputOptionIconText: {
    fontSize: 20,
  },
  inputOptionText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  inputButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  inputButtonText: {
    fontSize: 24,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  textInput: {
    flex: 1,
    minHeight: 36,
    maxHeight: 100,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: theme.typography.fontSize.md,
  },
  sendButton: {
    marginLeft: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonText: {
    color: theme.colors.onPrimary,
    fontWeight: 'bold',
  },
  voiceButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: theme.spacing.sm,
  },
  recordingButton: {
    backgroundColor: theme.colors.error,
  },
  voiceButtonText: {
    fontSize: 18,
  },
});

export default AIAssistantScreen;
