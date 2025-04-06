import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, ToastAndroid, Platform, Alert, FlatList } from 'react-native';
import ScreenContainer from '../../components/common/ScreenContainer';
import Card from '../../components/common/Card';
import theme from '../../theme';
import CodeBlock from '../../components/common/CodeBlock';
import { Ionicons } from '@expo/vector-icons';
import { codeAssistantApi, ApiError } from '../../services/api';
import * as Clipboard from 'expo-clipboard';
import { CodeGenerationResponse } from '../../types/assistant';
import { useTheme } from '@react-navigation/native';

// 语言分类定义
interface LanguageCategory {
  id: string;
  name: string;
  languages: Array<{
    id: string;
    name: string;
    icon: string;
    description: string;
  }>;
}

const CodeAssistantScreen: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [recentLanguages, setRecentLanguages] = useState<string[]>([]);
  const [historyRequests, setHistoryRequests] = useState<{prompt: string, language: string}[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['recent', 'popular']);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // 语言数据
  const [languages, setLanguages] = useState<Array<{
    id: string;
    name: string;
    icon: string;
    description: string;
  }>>([]);

  // 加载最近使用的语言记录和支持的语言列表
  useEffect(() => {
    // 加载最近使用的语言记录（实际应用中应从AsyncStorage加载）
    setRecentLanguages(['javascript', 'python']);
    
    // 从API获取支持的语言列表
    const fetchLanguages = async () => {
      setIsLoading(true);
      try {
        const supportedLanguages = await codeAssistantApi.getLanguages();
        
        if (supportedLanguages && supportedLanguages.length > 0) {
          // 为每种语言配置图标和描述
          const languageInfo = supportedLanguages.map(lang => {
            // 根据语言名称配置图标和描述
            const icon = getLanguageIcon(lang);
            const name = getLanguageDisplayName(lang);
            const description = getLanguageDescription(lang);
            
            return {
              id: lang,
              name,
              icon,
              description
            };
          });
          
          setLanguages(languageInfo);
        } else {
          // 如果API请求失败，使用默认语言列表
          setLanguages(getDefaultLanguages());
        }
      } catch (error) {
        console.error('获取支持的语言列表失败:', error);
        // 失败时使用默认语言列表
        setLanguages(getDefaultLanguages());
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLanguages();
  }, []);
  
  // 获取语言图标
  const getLanguageIcon = (languageId: string): string => {
    const icons: Record<string, string> = {
      'typescript': '📘',
      'javascript': '📙',
      'python': '🐍',
      'java': '☕',
      'csharp': '🔷',
      'cpp': '⚙️',
      'c': '©️',
      'go': '🐹',
      'rust': '🦀',
      'swift': '🐦',
      'kotlin': '🟪',
      'ruby': '💎',
      'php': '🐘',
      'html': '🌐',
      'css': '🎨',
      'sql': '🗃️',
    };
    
    return icons[languageId] || '📄';
  };
  
  // 获取语言显示名称
  const getLanguageDisplayName = (languageId: string): string => {
    const displayNames: Record<string, string> = {
      'typescript': 'TypeScript',
      'javascript': 'JavaScript',
      'python': 'Python',
      'java': 'Java',
      'csharp': 'C#',
      'cpp': 'C++',
      'c': 'C',
      'go': 'Go',
      'rust': 'Rust',
      'swift': 'Swift',
      'kotlin': 'Kotlin',
      'ruby': 'Ruby',
      'php': 'PHP',
      'html': 'HTML',
      'css': 'CSS',
      'sql': 'SQL',
    };
    
    return displayNames[languageId] || languageId.charAt(0).toUpperCase() + languageId.slice(1);
  };
  
  // 获取语言描述
  const getLanguageDescription = (languageId: string): string => {
    const descriptions: Record<string, string> = {
      'typescript': '类型安全的 JavaScript',
      'javascript': '动态编程语言',
      'python': '简洁优雅的编程语言',
      'java': '面向对象的编程语言',
      'csharp': '微软.NET平台的主要语言',
      'cpp': '高性能系统级编程语言',
      'c': '系统级编程语言',
      'go': '高效简洁的并发编程语言',
      'rust': '安全高效的系统编程语言',
      'swift': 'iOS和macOS应用开发语言',
      'kotlin': 'Android开发的首选语言',
      'ruby': '优雅简洁的脚本语言',
      'php': '流行的Web开发语言',
      'html': '网页标记语言',
      'css': '层叠样式表语言',
      'sql': '数据库查询语言',
    };
    
    return descriptions[languageId] || `${getLanguageDisplayName(languageId)}编程语言`;
  };
  
  // 获取默认语言列表（当API调用失败时使用）
  const getDefaultLanguages = () => {
    return [
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
      {
        id: 'csharp',
        name: 'C#',
        icon: '🔷',
        description: '微软.NET平台的主要语言',
      },
      {
        id: 'cpp',
        name: 'C++',
        icon: '⚙️',
        description: '高性能系统级编程语言',
      },
      {
        id: 'go',
        name: 'Go',
        icon: '🐹',
        description: '高效简洁的并发编程语言',
      },
      {
        id: 'rust',
        name: 'Rust',
        icon: '🦀',
        description: '安全高效的系统编程语言',
      },
      {
        id: 'swift',
        name: 'Swift',
        icon: '🐦',
        description: 'iOS和macOS应用开发语言',
      },
      {
        id: 'kotlin',
        name: 'Kotlin',
        icon: '🟪',
        description: 'Android开发的首选语言',
      },
      {
        id: 'ruby',
        name: 'Ruby',
        icon: '💎',
        description: '优雅简洁的脚本语言',
      },
      {
        id: 'php',
        name: 'PHP',
        icon: '🐘',
        description: '流行的Web开发语言',
      },
    ];
  };

  // 将语言分类
  const languageCategories: LanguageCategory[] = useMemo(() => {
    // 使用API获取的语言列表构建分类
    const popularLanguageIds = ['javascript', 'python', 'typescript', 'java', 'csharp', 'cpp'];
    const webLanguageIds = ['javascript', 'typescript', 'html', 'css', 'php'];
    const mobileLanguageIds = ['swift', 'kotlin', 'java', 'javascript'];
    const systemLanguageIds = ['cpp', 'c', 'rust', 'go'];
    
    // 根据id筛选语言
    const filterLanguages = (ids: string[]) => {
      return languages.filter(lang => ids.includes(lang.id));
    };
    
    return [
      {
        id: 'recent',
        name: '最近使用',
        languages: languages.filter(lang => recentLanguages.includes(lang.id))
      },
      {
        id: 'popular',
        name: '流行语言',
        languages: filterLanguages(popularLanguageIds)
      },
      {
        id: 'web',
        name: 'Web开发',
        languages: filterLanguages(webLanguageIds)
      },
      {
        id: 'mobile',
        name: '移动开发',
        languages: filterLanguages(mobileLanguageIds)
      },
      {
        id: 'system',
        name: '系统开发',
        languages: filterLanguages(systemLanguageIds)
      },
      {
        id: 'all',
        name: '所有语言',
        languages: [...languages]
      }
    ];
  }, [languages, recentLanguages]);

  // 处理语言选择
  const handleLanguageSelect = (languageId: string) => {
    setSelectedLanguage(languageId);
    
    // 更新最近使用的语言
    if (!recentLanguages.includes(languageId)) {
      const updatedRecentLanguages = [languageId, ...recentLanguages].slice(0, 5);
      setRecentLanguages(updatedRecentLanguages);
      // 实际应用中应存储到AsyncStorage
    }
    
    // 找到选中的语言名称
    const selectedLang = languages.find(lang => lang.id === languageId);
    if (selectedLang) {
      showToast(`已选择 ${selectedLang.name}`);
    }
  };

  // 生成代码
  const handleGenerate = async () => {
    if (!selectedLanguage || !inputText.trim()) return;
    
    setIsGenerating(true);
    setGeneratedCode(null);
    setErrorMessage(null);
    
    try {
      // 执行代码生成请求
      const response = await codeAssistantApi.generateCode(
        selectedLanguage,
        inputText
      );
      
      // 更新生成的代码
      setGeneratedCode(response.code);
      
      // 更新历史记录
      setHistoryRequests([
        { prompt: inputText, language: selectedLanguage },
        ...historyRequests.slice(0, 9) // 保留最近10条
      ]);
      
    } catch (error) {
      // 处理错误
      let errorMsg = '生成代码时发生错误，请稍后重试';
      
      if (error instanceof ApiError) {
        errorMsg = error.message;
      } else if (error instanceof Error) {
        errorMsg = error.message;
      }
      
      setErrorMessage(errorMsg);
      console.error('代码生成错误:', error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  // 显示Toast消息
  const showToast = (message: string) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert('提示', message);
    }
  };
  
  // 复制代码到剪贴板
  const handleCopyCode = async () => {
    if (!generatedCode) return;
    
    try {
      await Clipboard.setStringAsync(generatedCode);
      showToast('代码已复制到剪贴板');
    } catch (error) {
      console.error('复制代码失败:', error);
      showToast('复制失败，请手动复制');
    }
  };
  
  // 使用历史提示
  const useHistoryPrompt = (index: number) => {
    if (historyRequests[index]) {
      setInputText(historyRequests[index].prompt);
      setSelectedLanguage(historyRequests[index].language);
    }
  };
  
  // 切换分类的展开/折叠状态
  const toggleCategory = (categoryId: string) => {
    if (expandedCategories.includes(categoryId)) {
      setExpandedCategories(expandedCategories.filter(id => id !== categoryId));
    } else {
      setExpandedCategories([...expandedCategories, categoryId]);
    }
  };
  
  // 处理代码操作（优化、重构、测试生成、解释）
  const handleCodeOperation = async (operation: 'optimize' | 'refactor' | 'test' | 'explain') => {
    if (!generatedCode || !selectedLanguage) {
      showToast('没有可操作的代码');
      return;
    }
    
    setIsGenerating(true);
    
    try {
      let response;
      
      switch(operation) {
        case 'optimize':
          response = await codeAssistantApi.optimizeCode(selectedLanguage, generatedCode, 'performance');
          break;
        case 'refactor':
          response = await codeAssistantApi.optimizeCode(selectedLanguage, generatedCode, 'readability');
          break;
        case 'test':
          response = await codeAssistantApi.generateTestCode(selectedLanguage, generatedCode);
          break;
        case 'explain':
          response = await codeAssistantApi.explainCode(selectedLanguage, generatedCode);
          break;
      }
      
      if (response && response.code) {
        setGeneratedCode(response.code);
        showToast(`代码${
          operation === 'optimize' ? '优化' : 
          operation === 'refactor' ? '重构' : 
          operation === 'test' ? '测试生成' : '解释'
        }完成`);
      }
    } catch (error) {
      let errorMsg = '操作失败，请稍后重试';
      
      if (error instanceof ApiError) {
        errorMsg = error.message;
      } else if (error instanceof Error) {
        errorMsg = error.message;
      }
      
      setErrorMessage(errorMsg);
      console.error('代码操作错误:', error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  // 渲染生成的代码
  const renderGeneratedCode = () => {
    if (!generatedCode) return null;
    
    return (
      <Card title="生成的代码" style={styles.card}>
        {errorMessage ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : (
          <>
            <CodeBlock
              code={generatedCode}
              language={selectedLanguage || 'javascript'}
              showCopyButton={true}
              showLineNumbers={true}
            />
            
            <View style={styles.codeActionsContainer}>
              <TouchableOpacity
                style={styles.codeActionButton}
                onPress={() => handleCodeOperation('optimize')}
                disabled={isGenerating}
              >
                <Ionicons name="flash-outline" size={18} color={theme.colors.textPrimary} />
                <Text style={styles.codeActionText}>优化</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.codeActionButton}
                onPress={() => handleCodeOperation('refactor')}
                disabled={isGenerating}
              >
                <Ionicons name="construct-outline" size={18} color={theme.colors.textPrimary} />
                <Text style={styles.codeActionText}>重构</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.codeActionButton}
                onPress={() => handleCodeOperation('test')}
                disabled={isGenerating}
              >
                <Ionicons name="bug-outline" size={18} color={theme.colors.textPrimary} />
                <Text style={styles.codeActionText}>生成测试</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.codeActionButton}
                onPress={() => handleCodeOperation('explain')}
                disabled={isGenerating}
              >
                <Ionicons name="help-circle-outline" size={18} color={theme.colors.textPrimary} />
                <Text style={styles.codeActionText}>解释代码</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.codeActionButton}
                onPress={handleCopyCode}
                disabled={isGenerating}
              >
                <Ionicons name="copy-outline" size={18} color={theme.colors.textPrimary} />
                <Text style={styles.codeActionText}>复制</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </Card>
    );
  };

  // 渲染最近使用的语言
  const renderRecentLanguages = () => {
    const recentCategory = languageCategories.find(cat => cat.id === 'recent');
    
    if (!recentCategory || recentCategory.languages.length === 0) {
      return null;
    }
    
    return (
      <Card title="最近使用" style={styles.card}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recentLanguagesContainer}>
          {recentCategory.languages.map(language => (
            <TouchableOpacity
              key={language.id}
              style={[
                styles.languageButton,
                selectedLanguage === language.id && styles.selectedLanguageButton
              ]}
              onPress={() => handleLanguageSelect(language.id)}
            >
              <Text style={styles.languageIcon}>{language.icon}</Text>
              <Text style={[
                styles.languageButtonText,
                selectedLanguage === language.id && styles.selectedLanguageButtonText
              ]}>
                {language.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Card>
    );
  };
  
  // 渲染语言分类
  const renderLanguageCategory = (category: LanguageCategory) => {
    if (category.id === 'recent' || category.languages.length === 0) {
      return null;
    }
    
    const isExpanded = expandedCategories.includes(category.id);
    
    return (
      <Card key={category.id} style={styles.card}>
        <TouchableOpacity style={styles.categoryHeader} onPress={() => toggleCategory(category.id)}>
          <Text style={styles.categoryTitle}>{category.name}</Text>
          <Ionicons 
            name={isExpanded ? "chevron-up" : "chevron-down"} 
            size={20} 
            color={theme.colors.textPrimary}
          />
        </TouchableOpacity>
        
        {isExpanded && (
          <View style={styles.languagesGrid}>
            {category.languages.map(language => (
              <TouchableOpacity
                key={language.id}
                style={[
                  styles.languageGridItem,
                  selectedLanguage === language.id && styles.selectedLanguageGridItem
                ]}
                onPress={() => handleLanguageSelect(language.id)}
              >
                <Text style={styles.languageGridIcon}>{language.icon}</Text>
                <Text style={[
                  styles.languageGridName,
                  selectedLanguage === language.id && styles.selectedLanguageGridName
                ]}>
                  {language.name}
                </Text>
                <Text style={styles.languageGridDescription} numberOfLines={2}>
                  {language.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </Card>
    );
  };
  
  const renderLanguageCategories = () => {
    return (
      <Card title="选择编程语言" style={styles.card}>
        {languageCategories.map(category => renderLanguageCategory(category))}
      </Card>
    );
  };
  
  // 渲染历史提示
  const renderHistoryRequests = () => {
    if (historyRequests.length === 0 || generatedCode) return null;
    
    return (
      <Card title="历史提示" style={styles.card}>
        {historyRequests.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.historyItem}
            onPress={() => useHistoryPrompt(index)}
          >
            <Text style={styles.historyPrompt} numberOfLines={1} ellipsizeMode="tail">
              {item.prompt}
            </Text>
            <View style={styles.historyLanguage}>
              <Text style={styles.historyLanguageText}>
                {languages.find(l => l.id === item.language)?.name || item.language}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </Card>
    );
  };

  return (
    <ScreenContainer
      title="代码助手"
      backgroundColor={theme.colors.background}
    >
      <ScrollView style={styles.container}>
        {isLoading ? (
          <Card style={styles.card}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.loadingText}>正在加载支持的编程语言...</Text>
            </View>
          </Card>
        ) : (
          <>
            {renderRecentLanguages()}
            {renderLanguageCategories()}
          </>
        )}

        <Card title="代码生成" style={styles.card}>
          <TextInput
            style={styles.input}
            placeholder="描述您想要生成的代码..."
            value={inputText}
            onChangeText={setInputText}
            multiline
            numberOfLines={4}
          />
          <View style={styles.inputHint}>
            <Text style={styles.inputHintText}>
              提示：详细描述您需要什么功能的代码，会得到更好的结果
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.generateButton,
              (!inputText.trim() || !selectedLanguage || isGenerating) && styles.disabledButton,
            ]}
            onPress={handleGenerate}
            disabled={!inputText.trim() || !selectedLanguage || isGenerating}
          >
            {isGenerating ? (
              <ActivityIndicator size="small" color={theme.colors.onPrimary} />
            ) : (
              <Text style={styles.generateButtonText}>生成代码</Text>
            )}
          </TouchableOpacity>
        </Card>
        
        {renderHistoryRequests()}
        
        {renderGeneratedCode()}

        {!generatedCode && !isLoading && (
          <Card title="代码助手功能" style={styles.card}>
            <View style={styles.featureOptionsContainer}>
              <TouchableOpacity 
                style={styles.featureOption}
                onPress={() => {
                  setInputText("请帮我优化以下代码的性能：\n\n// 在这里粘贴您的代码");
                  setSelectedLanguage('javascript');
                }}
              >
                <View style={styles.featureIconContainer}>
                  <Ionicons name="rocket-outline" size={24} color={theme.colors.primary} />
                </View>
                <Text style={styles.featureOptionText}>代码优化</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.featureOption}
                onPress={() => {
                  setInputText("请帮我重构以下代码以提高可维护性：\n\n// 在这里粘贴您的代码");
                  setSelectedLanguage('javascript');
                }}
              >
                <View style={styles.featureIconContainer}>
                  <Ionicons name="construct-outline" size={24} color={theme.colors.primary} />
                </View>
                <Text style={styles.featureOptionText}>代码重构</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.featureOption}
                onPress={() => {
                  setInputText("请为以下代码生成单元测试：\n\n// 在这里粘贴您的代码");
                  setSelectedLanguage('javascript');
                }}
              >
                <View style={styles.featureIconContainer}>
                  <Ionicons name="shield-checkmark-outline" size={24} color={theme.colors.primary} />
                </View>
                <Text style={styles.featureOptionText}>单元测试</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.featureOption}
                onPress={() => {
                  setInputText("请解释以下代码的工作原理并添加注释：\n\n// 在这里粘贴您的代码");
                  setSelectedLanguage('javascript');
                }}
              >
                <View style={styles.featureIconContainer}>
                  <Ionicons name="document-text-outline" size={24} color={theme.colors.primary} />
                </View>
                <Text style={styles.featureOptionText}>代码解释</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.codeBlocksContainer}>
              <Card title="代码优化示例" style={styles.codeFeatureCard}>
                <CodeBlock 
                  code={`// 代码优化示例
function slowFunction(arr) {
  let result = [];
  for(let i = 0; i < arr.length; i++) {
    result.push(arr[i] * 2);
  }
  return result;
}`}
                  language="javascript"
                  showLineNumbers={true}
                  style={styles.codeBlock}
                />
                <TouchableOpacity 
                  style={styles.useFunctionButton}
                  onPress={() => {
                    setInputText("请帮我优化以下代码的性能：\n\nfunction slowFunction(arr) {\n  let result = [];\n  for(let i = 0; i < arr.length; i++) {\n    result.push(arr[i] * 2);\n  }\n  return result;\n}");
                    setSelectedLanguage('javascript');
                  }}
                >
                  <Ionicons name="arrow-forward" size={16} color={theme.colors.onPrimary} />
                  <Text style={styles.useFunctionButtonText}>使用此示例</Text>
                </TouchableOpacity>
              </Card>
              
              <Card title="代码重构示例" style={styles.codeFeatureCard}>
                <CodeBlock 
                  code={`// 代码重构示例
function doEverything(data) {
  // 验证数据
  if(!data) return null;
  
  // 处理数据
  const processed = data.map(d => d * 2);
  
  // 过滤数据
  const filtered = processed.filter(d => d > 10);
  
  // 保存数据
  localStorage.setItem('data', JSON.stringify(filtered));
  
  return filtered;
}`}
                  language="javascript"
                  showLineNumbers={true}
                  style={styles.codeBlock}
                />
                <TouchableOpacity 
                  style={styles.useFunctionButton}
                  onPress={() => {
                    setInputText("请帮我重构以下代码以提高可维护性：\n\nfunction doEverything(data) {\n  // 验证数据\n  if(!data) return null;\n  \n  // 处理数据\n  const processed = data.map(d => d * 2);\n  \n  // 过滤数据\n  const filtered = processed.filter(d => d > 10);\n  \n  // 保存数据\n  localStorage.setItem('data', JSON.stringify(filtered));\n  \n  return filtered;\n}");
                    setSelectedLanguage('javascript');
                  }}
                >
                  <Ionicons name="arrow-forward" size={16} color={theme.colors.onPrimary} />
                  <Text style={styles.useFunctionButtonText}>使用此示例</Text>
                </TouchableOpacity>
              </Card>
              
              <Card title="单元测试示例" style={styles.codeFeatureCard}>
                <CodeBlock 
                  code={`// 单元测试示例
function sum(a, b) {
  return a + b;
}

function multiply(a, b) {
  return a * b;
}`}
                  language="javascript"
                  showLineNumbers={true}
                  style={styles.codeBlock}
                />
                <TouchableOpacity 
                  style={styles.useFunctionButton}
                  onPress={() => {
                    setInputText("请为以下代码生成单元测试：\n\nfunction sum(a, b) {\n  return a + b;\n}\n\nfunction multiply(a, b) {\n  return a * b;\n}");
                    setSelectedLanguage('javascript');
                  }}
                >
                  <Ionicons name="arrow-forward" size={16} color={theme.colors.onPrimary} />
                  <Text style={styles.useFunctionButtonText}>使用此示例</Text>
                </TouchableOpacity>
              </Card>
              
              <Card title="代码解释示例" style={styles.codeFeatureCard}>
                <CodeBlock 
                  code={`// 代码解释示例
const debounce = (func, delay) => {
  let timeout;
  return function() {
    const context = this;
    const args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(context, args);
    }, delay);
  };
};`}
                  language="javascript"
                  showLineNumbers={true}
                  style={styles.codeBlock}
                />
                <TouchableOpacity 
                  style={styles.useFunctionButton}
                  onPress={() => {
                    setInputText("请解释以下代码的工作原理并添加注释：\n\nconst debounce = (func, delay) => {\n  let timeout;\n  return function() {\n    const context = this;\n    const args = arguments;\n    clearTimeout(timeout);\n    timeout = setTimeout(() => {\n      func.apply(context, args);\n    }, delay);\n  };\n};");
                    setSelectedLanguage('javascript');
                  }}
                >
                  <Ionicons name="arrow-forward" size={16} color={theme.colors.onPrimary} />
                  <Text style={styles.useFunctionButtonText}>使用此示例</Text>
                </TouchableOpacity>
              </Card>
            </View>
          </Card>
        )}
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
  languageRow: {
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  languageItem: {
    width: '32%',
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    alignItems: 'center',
    minHeight: 100,
    justifyContent: 'center',
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
    flexDirection: 'row',
    alignItems: 'center',
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
  codeBlock: {
    width: '100%',
  },
  generatingContainer: {
    padding: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  generatingText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  codeActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: theme.spacing.md,
  },
  loader: {
    marginBottom: theme.spacing.sm,
  },
  inputHint: {
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  inputHintText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  recentLanguagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  recentLanguageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  recentLanguageIcon: {
    fontSize: 20,
    marginRight: theme.spacing.xs,
  },
  recentLanguageName: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textPrimary,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  historyPrompt: {
    flex: 1,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textPrimary,
  },
  historyLanguage: {
    backgroundColor: theme.colors.primary + '20',
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    marginLeft: theme.spacing.sm,
  },
  historyLanguageText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.primary,
  },
  actionIcon: {
    marginRight: theme.spacing.xs,
  },
  featureIcon: {
    marginRight: theme.spacing.md,
  },
  featureContent: {
    flex: 1,
  },
  categoryContainer: {
    marginBottom: theme.spacing.md,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
  },
  categoryTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.medium as any,
    color: theme.colors.textPrimary,
  },
  codeLanguageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: theme.spacing.sm,
  },
  featureOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginBottom: theme.spacing.md,
  },
  featureOption: {
    width: '23%',
    alignItems: 'center',
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  featureIconContainer: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: `${theme.colors.primary}15`,
    borderRadius: 25,
    marginBottom: theme.spacing.sm,
  },
  featureOptionText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  codeBlocksContainer: {
    marginTop: theme.spacing.md,
  },
  codeFeatureCard: {
    marginBottom: theme.spacing.md,
    padding: 0,
    overflow: 'hidden',
  },
  useFunctionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.sm,
    borderBottomLeftRadius: theme.borderRadius.md,
    borderBottomRightRadius: theme.borderRadius.md,
  },
  useFunctionButtonText: {
    color: theme.colors.onPrimary,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium as any,
    marginLeft: theme.spacing.xs,
  },
  codeOperations: {
    marginTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
    paddingTop: theme.spacing.md,
  },
  codeOperationsTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium as any,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  codeOperationsButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  codeOperationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    flex: 1,
    marginHorizontal: theme.spacing.xs,
  },
  operationButtonText: {
    color: '#fff',
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium as any,
  },
  operationIcon: {
    marginRight: theme.spacing.xs,
  },
  errorContainer: {
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  errorIcon: {
    marginBottom: theme.spacing.md,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium as any,
    marginBottom: theme.spacing.md,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  retryButtonText: {
    color: theme.colors.onPrimary,
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium as any,
  },
  loadingContainer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  languageButton: {
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    marginRight: theme.spacing.sm,
  },
  selectedLanguageButton: {
    backgroundColor: theme.colors.primary + '10',
  },
  languageButtonText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textPrimary,
  },
  selectedLanguageButtonText: {
    fontWeight: theme.typography.fontWeight.medium as any,
  },
  languagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: theme.spacing.sm,
  },
  languageGridItem: {
    width: '32%',
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    alignItems: 'center',
    minHeight: 100,
    justifyContent: 'center',
  },
  selectedLanguageGridItem: {
    backgroundColor: theme.colors.primary + '10',
  },
  languageGridIcon: {
    fontSize: 32,
    marginBottom: theme.spacing.sm,
  },
  languageGridName: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium as any,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  selectedLanguageGridName: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.bold as any,
  },
  languageGridDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  codeActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.md,
  },
  codeActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.surface,
  },
  codeActionText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium as any,
    marginLeft: 4,
  },
});

export default CodeAssistantScreen; 