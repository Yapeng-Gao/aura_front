import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  Image,
  ActivityIndicator,
  Alert,
  RefreshControl
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import ScreenContainer from '../../components/common/ScreenContainer';
import theme from '../../theme';
import apiService from '../../services/api';
import { Message, SendMessageRequest, SendMessageResponse, UpdateAssistantSettingsResponse } from '../../types/assistant';
import { AIAssistantScreenNavigationProp } from '../../types/navigation';
import { Ionicons } from '@expo/vector-icons';
import CodeBlock from '../../components/common/CodeBlock';

const AIAssistantScreen: React.FC = () => {
  const navigation = useNavigation<AIAssistantScreenNavigationProp>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showInputOptions, setShowInputOptions] = useState(false);
  const [conversationId, setConversationId] = useState('new');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [assistantInfo, setAssistantInfo] = useState<UpdateAssistantSettingsResponse | null>(null);
  
  const scrollViewRef = useRef<ScrollView>(null);
  
  // 自动滚动到底部
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  // 加载助手设置
  const loadAssistantSettings = async () => {
    try {
      const settings = await apiService.assistant.updateAssistantSettings({});
      if (settings) {
        setAssistantInfo(settings);
      }
    } catch (error) {
      console.error('加载助手设置失败:', error);
    }
  };

  // 每次聚焦屏幕时刷新助手设置
  useFocusEffect(
    useCallback(() => {
      loadAssistantSettings();
    }, [])
  );

  // 初始化时加载对话
  useEffect(() => {
    loadConversation();
  }, []);
  
  const loadConversation = async (withRefresh = false) => {
    try {
      if (withRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      
      const conversations = await apiService.assistant.getConversations();
      if (conversations && conversations.conversations.length > 0) {
        // 使用最近的对话
        const latestConversation = conversations.conversations[0];
        setConversationId(latestConversation.id);
        
        // 获取对话内容
        const conversation = await apiService.assistant.getConversation(latestConversation.id);
        if (conversation) {
          // 转换消息格式
          const formattedMessages: Message[] = conversation.messages.map(msg => ({
            id: msg.message_id,
            text: msg.content.text,
            sender: msg.sender,
            timestamp: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            attachmentUrl: msg.content.attachment_url
          }));
          
          setMessages(formattedMessages);
        }
      } else {
        // 没有现有对话，使用欢迎消息
        setConversationId('new');
        setMessages([{
          id: '1',
          text: '你好！我是你的AI助手，有什么我可以帮你的吗？',
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }]);
      }
    } catch (error) {
      console.error('加载对话失败:', error);
      // 使用默认欢迎消息
      setMessages([{
        id: '1',
        text: '你好！我是你的AI助手，有什么我可以帮你的吗？',
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };
  
  const handleRefresh = () => {
    loadConversation(true);
  };
  
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
      setIsSending(true);
      
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
        // 准备请求参数
        const messageRequest: SendMessageRequest = {
          message: userMessage.text,
          conversation_id: conversationId
        };
        
        // 调用API获取AI回复
        const response = await apiService.assistant.sendMessage(messageRequest);
        
        // 替换处理中消息为实际回复
        if (response) {
          setMessages(prev => {
            const filtered = prev.filter(msg => msg.id !== processingMessageId);
            return [...filtered, {
              id: response.message_id,
              text: response.content.text,
              sender: 'assistant',
              timestamp: new Date(response.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }];
          });
          
          // 如果是新对话，更新conversationId
          if (conversationId === 'new') {
            // 获取最新的对话列表来获取当前对话的ID
            const conversations = await apiService.assistant.getConversations();
            if (conversations && conversations.conversations.length > 0) {
              setConversationId(conversations.conversations[0].id);
            }
          }
        } else {
          throw new Error('获取回复失败');
        }
      } catch (error) {
        console.error('获取AI回复失败:', error);
        
        // 显示错误消息
        setMessages(prev => {
          const filtered = prev.filter(msg => msg.id !== processingMessageId);
          return [...filtered, {
            id: Date.now().toString(),
            text: '抱歉，我遇到了一些问题，请稍后再试。',
            sender: 'assistant',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }];
        });
        
        Alert.alert('错误', '无法连接到AI助手服务，请稍后再试。');
      } finally {
        setIsSending(false);
      }
    }
  };
  
  // 处理图片上传
  const handleImageUpload = () => {
    Alert.alert('即将推出', '图片上传功能正在开发中');
    setShowInputOptions(false);
  };
  
  // 处理文件上传
  const handleFileUpload = () => {
    Alert.alert('即将推出', '文件上传功能正在开发中');
    setShowInputOptions(false);
  };
  
  // 开始语音输入
  const handleVoiceInput = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      Alert.alert('即将推出', '语音识别功能正在开发中');
    } else {
      setIsRecording(false);
    }
  };
  
  // 创建新对话
  const handleNewConversation = () => {
    Alert.alert(
      '新对话',
      '是否开始新的对话？当前对话记录将会保存。',
      [
        { text: '取消', style: 'cancel' },
        { 
          text: '确定', 
          onPress: () => {
            setConversationId('new');
            setMessages([{
              id: '1',
              text: '你好！我是你的AI助手，有什么我可以帮你的吗？',
              sender: 'assistant',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }]);
          }
        }
      ]
    );
  };
  
  // 在消息组件内部添加检测代码块的逻辑
  const renderMessageContent = (message: Message) => {
    // 检测消息是否包含代码块
    if (message.text && message.text.includes('```')) {
      // 找到所有的代码块
      const parts = message.text.split(/```(\w*)\n([\s\S]*?)```/g);
      const result = [];
      
      for (let i = 0; i < parts.length; i++) {
        if (i % 3 === 0) {
          // 这是普通文本部分
          if (parts[i]) {
            result.push(
              <Text 
                key={`text-${i}`} 
                style={[
                  styles.messageText,
                  message.sender === 'user' ? styles.userMessageText : styles.assistantMessageText
                ]}
              >
                {parts[i]}
              </Text>
            );
          }
        } else if (i % 3 === 1) {
          // 这是语言标识
          const language = parts[i] || 'text';
          const code = parts[i + 1];
          
          if (code) {
            result.push(
              <CodeBlock
                key={`code-${i}`}
                code={code}
                language={language}
                showLineNumbers={true}
                style={styles.codeBlock}
              />
            );
          }
          
          // 跳过已处理的代码部分
          i++;
        }
      }
      
      return result;
    }
    
    // 如果没有代码块，正常显示文本
    return (
      <Text style={[
        styles.messageText,
        message.sender === 'user' ? styles.userMessageText : styles.assistantMessageText
      ]}>
        {message.text}
      </Text>
    );
  };
  
  if (isLoading) {
    return (
      <ScreenContainer
        title={assistantInfo?.assistant_name || "AI助手"}
        backgroundColor={theme.colors.background}
        showBackButton
        rightButton={{
          icon: 'settings-outline',
          onPress: () => navigation.navigate('AISettings'),
        }}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>加载对话中...</Text>
        </View>
      </ScreenContainer>
    );
  }
  
  return (
    <ScreenContainer
      title={assistantInfo?.assistant_name || "AI助手"}
      backgroundColor={theme.colors.background}
      showBackButton
      rightButton={{
        icon: 'settings-outline',
        onPress: () => navigation.navigate('AISettings'),
      }}
    >
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.actionBar}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleNewConversation}
          >
            <Ionicons name="add" size={22} color={theme.colors.primary} />
            <Text style={styles.actionButtonText}>新对话</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
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
                    {!message.isProcessing && renderMessageContent(message)}
                    
                    {message.attachmentUrl && (
                      <TouchableOpacity style={styles.attachmentContainer}>
                        <Image 
                          source={{ uri: message.attachmentUrl }} 
                          style={styles.attachmentImage}
                          resizeMode="cover"
                        />
                      </TouchableOpacity>
                    )}
                    
                    <Text style={styles.timestamp}>{message.timestamp}</Text>
                  </>
                )}
              </View>
            </View>
          ))}
        </ScrollView>
        
        <View style={styles.inputContainer}>
          {showInputOptions && (
            <View style={styles.inputOptionsContainer}>
              <TouchableOpacity 
                style={styles.inputOptionButton}
                onPress={handleImageUpload}
              >
                <Ionicons name="image-outline" size={24} color={theme.colors.textPrimary} />
                <Text style={styles.inputOptionText}>图片</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.inputOptionButton}
                onPress={handleFileUpload}
              >
                <Ionicons name="document-outline" size={24} color={theme.colors.textPrimary} />
                <Text style={styles.inputOptionText}>文件</Text>
              </TouchableOpacity>
            </View>
          )}
          
          <View style={styles.inputRow}>
            <TouchableOpacity 
              style={styles.inputIconButton}
              onPress={() => setShowInputOptions(!showInputOptions)}
            >
              <Ionicons name="add-outline" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
            
            <TextInput
              style={styles.input}
              placeholder="发送消息..."
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
            
            {inputText.trim() ? (
              <TouchableOpacity 
                style={[styles.sendButton, isSending && styles.sendButtonDisabled]}
                onPress={handleSendMessage}
                disabled={isSending}
              >
                {isSending ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Ionicons name="send" size={20} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={styles.micButton}
                onPress={handleVoiceInput}
              >
                <Ionicons 
                  name={isRecording ? "stop-circle-outline" : "mic-outline"} 
                  size={24} 
                  color={theme.colors.primary} 
                />
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
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    borderRadius: 16,
    backgroundColor: `${theme.colors.primary}10`,
  },
  actionButtonText: {
    marginLeft: 4,
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 24,
  },
  messageBubble: {
    flexDirection: 'row',
    marginBottom: 16,
    maxWidth: '85%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    marginLeft: 'auto',
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    marginRight: 'auto',
  },
  processingMessage: {
    opacity: 0.8,
  },
  avatarContainer: {
    marginRight: 8,
    alignSelf: 'flex-start',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  messageContent: {
    padding: 12,
    borderRadius: 18,
    maxWidth: '100%',
  },
  userMessageContent: {
    backgroundColor: theme.colors.primary,
    borderTopRightRadius: 4,
  },
  assistantMessageContent: {
    backgroundColor: theme.colors.cardBackground,
    borderTopLeftRadius: 4,
  },
  processingMessageContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  processingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  processingText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    marginRight: 8,
  },
  loader: {
    marginLeft: 8,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  assistantMessageText: {
    color: theme.colors.textPrimary,
  },
  timestamp: {
    fontSize: 12,
    marginTop: 8,
    opacity: 0.7,
    alignSelf: 'flex-end',
    color: theme.colors.textSecondary,
  },
  attachmentContainer: {
    marginTop: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  attachmentImage: {
    width: '100%',
    height: 150,
    backgroundColor: theme.colors.divider,
  },
  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
    padding: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
  },
  inputOptionsContainer: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  inputOptionButton: {
    alignItems: 'center',
    marginRight: 16,
    width: 56,
  },
  inputOptionText: {
    marginTop: 4,
    fontSize: 12,
    color: theme.colors.textPrimary,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  inputIconButton: {
    padding: 8,
    marginRight: 8,
  },
  input: {
    flex: 1,
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingRight: 48,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    backgroundColor: theme.colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.7,
  },
  micButton: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeBlock: {
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    width: '100%',
  },
});

export default AIAssistantScreen;
