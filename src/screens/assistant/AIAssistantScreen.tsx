import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ScreenContainer from '../../components/common/ScreenContainer';
import Card from '../../components/common/Card';
import theme from '../../theme';
import { AssistantStackParamList } from '../../navigation/types';
import apiService from '../../services/api';

type AIAssistantScreenNavigationProp = NativeStackNavigationProp<AssistantStackParamList, 'AIAssistant'>;

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
  const navigation = useNavigation<AIAssistantScreenNavigationProp>();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: '你好！我是你的AI助手，有什么我可以帮你的吗？',
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
  const handleSendMessage = async () => {
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
      
      // 添加处理中消息
      const processingMessageId = `processing-${Date.now()}`;
      const processingMessage: Message = {
        id: processingMessageId,
        text: '正在思考...',
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isProcessing: true,
      };
      
      setMessages(prev => [...prev, processingMessage]);
      
      try {
        // 调用API获取AI回复
        const response = await apiService.assistant.sendMessage({
          message: userMessage.text,
          conversation_id: 'current'
        });
        
        // 替换处理中消息为实际回复
        setMessages(prev => {
          const filtered = prev.filter(msg => msg.id !== processingMessageId);
          return [...filtered, {
            id: Date.now().toString(),
            text: response?.text || getAIResponse(inputText),
            sender: 'assistant',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }];
        });
      } catch (error) {
        console.error('获取AI回复失败:', error);
        
        // 替换处理中消息为本地模拟回复
        setMessages(prev => {
          const filtered = prev.filter(msg => msg.id !== processingMessageId);
          return [...filtered, {
            id: Date.now().toString(),
            text: getAIResponse(inputText),
            sender: 'assistant',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }];
        });
      }
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

  // 处理文件上传
  const handleFileUpload = () => {
    console.log('上传文件');
    setShowInputOptions(false);
    
    // 模拟文件上传和发送
    setTimeout(() => {
      const fileMessage: Message = {
        id: Date.now().toString(),
        text: '我发送了一个文件',
        sender: 'user',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        attachments: [
          {
            type: 'file',
            url: 'https://example.com/document.pdf',
            name: '项目报告.pdf',
          }
        ]
      };
      
      setMessages(prev => [...prev, fileMessage]);
      
      // 模拟AI助手回复
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          text: '我已收到您的文件。这是一个PDF文档，我可以帮您分析其中的内容。',
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }]);
      }, 1500);
    }, 1000);
  };
  
  return (
    <ScreenContainer
      title="AI助手"
      backgroundColor={theme.colors.background}
      showBackButton
      rightButton={{
        icon: '设置',
        onPress: () => navigation.navigate('AISettings'),
      }}
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
                {message.isProcessing ? (
                  <View style={styles.processingContainer}>
                    <Text style={styles.processingText}>AI助手正在思考</Text>
                    <ActivityIndicator size="small" color={theme.colors.primary} style={styles.loader} />
                  </View>
                ) : (
                  <>
                    <Text style={[
                      styles.messageText,
                      message.sender === 'user' ? styles.userMessageText : styles.assistantMessageText
                    ]}>
                      {message.text}
                    </Text>
                    
                    {message.attachments && message.attachments.length > 0 && (
                      <View style={styles.attachmentsContainer}>
                        {message.attachments.map((attachment, index) => (
                          <View key={index} style={styles.attachment}>
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
                            
                            {attachment.type === 'audio' && (
                              <View style={styles.audioAttachment}>
                                <Text style={styles.audioLabel}>语音记录</Text>
                              </View>
                            )}
                          </View>
                        ))}
                      </View>
                    )}
                  </>
                )}
                
                <Text style={styles.timestamp}>{message.timestamp}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
        
        <View style={styles.inputContainer}>
          {showInputOptions && (
            <View style={styles.inputOptionsContainer}>
              <TouchableOpacity style={styles.inputOption} onPress={handleImageUpload}>
                <Text style={styles.inputOptionText}>图片</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.inputOption} onPress={handleFileUpload}>
                <Text style={styles.inputOptionText}>文件</Text>
              </TouchableOpacity>
            </View>
          )}
          
          <View style={styles.inputRow}>
            <TouchableOpacity style={styles.inputButton} onPress={toggleInputOptions}>
              <Text style={styles.inputButtonText}>+</Text>
            </TouchableOpacity>
            
            <TextInput
              style={styles.input}
              placeholder="输入消息..."
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
            
            {inputText.trim() ? (
              <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
                <Text style={styles.sendButtonText}>发送</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.voiceButton, isRecording && styles.recordingButton]}
                onPress={handleVoiceInput}
              >
                <Text style={styles.voiceButtonText}>{isRecording ? '停止' : '语音'}</Text>
              </TouchableOpacity>
            )}
          </View>
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
    paddingBottom: theme.spacing.xl * 2,
  },
  messageBubble: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
    maxWidth: '100%',
  },
  userMessage: {
    justifyContent: 'flex-end',
    alignSelf: 'flex-end',
  },
  assistantMessage: {
    justifyContent: 'flex-start',
    alignSelf: 'flex-start',
  },
  processingMessage: {
    opacity: 0.7,
  },
  avatarContainer: {
    marginRight: theme.spacing.sm,
    alignSelf: 'flex-end',
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  messageContent: {
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    maxWidth: '80%',
  },
  userMessageContent: {
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: 4,
  },
  assistantMessageContent: {
    backgroundColor: theme.colors.surface,
    borderBottomLeftRadius: 4,
  },
  processingMessageContent: {
    backgroundColor: theme.colors.surface,
    opacity: 0.8,
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
  processingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.sm,
  },
  processingText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSize.sm,
    marginRight: theme.spacing.sm,
  },
  loader: {
    marginLeft: theme.spacing.xs,
  },
  attachmentsContainer: {
    marginTop: theme.spacing.sm,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  attachment: {
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  attachmentContainer: {
    marginTop: theme.spacing.sm,
  },
  attachmentImage: {
    width: 150,
    height: 150,
    borderRadius: theme.borderRadius.md,
  },
  fileAttachment: {
    backgroundColor: `${theme.colors.primary}10`,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileName: {
    color: theme.colors.primary,
    fontSize: theme.typography.fontSize.sm,
  },
  audioAttachment: {
    backgroundColor: `${theme.colors.secondary}10`,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  audioLabel: {
    color: theme.colors.secondary,
    fontSize: theme.typography.fontSize.sm,
  },
  timestamp: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
    alignSelf: 'flex-end',
    marginTop: theme.spacing.sm,
  },
  inputContainer: {
    padding: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
    backgroundColor: theme.colors.background,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputOptionsContainer: {
    flexDirection: 'row',
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
  },
  inputOption: {
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  inputOptionText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.xs,
  },
  inputButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  inputButtonText: {
    fontSize: 24,
    color: theme.colors.textSecondary,
    lineHeight: 24,
  },
  input: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
    fontSize: theme.typography.fontSize.md,
    maxHeight: 100,
  },
  sendButton: {
    width: 60,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: theme.spacing.sm,
  },
  sendButtonText: {
    color: theme.colors.onPrimary,
    fontSize: theme.typography.fontSize.sm,
  },
  voiceButton: {
    width: 60,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: theme.spacing.sm,
  },
  recordingButton: {
    backgroundColor: theme.colors.error,
  },
  voiceButtonText: {
    color: theme.colors.onPrimary,
    fontSize: theme.typography.fontSize.sm,
  }
});

export default AIAssistantScreen;
