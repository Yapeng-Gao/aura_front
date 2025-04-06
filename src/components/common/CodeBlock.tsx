import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, ToastAndroid, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// 注意：实际应用中需要安装 expo-clipboard，可临时改为使用粘贴板API的模拟
// import * as Clipboard from 'expo-clipboard';
import theme from '../../theme';

interface CodeBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  showCopyButton?: boolean;
  style?: object;
}

// 简单的语法高亮支持
const tokenColors: {[key: string]: string} = {
  // 关键字
  keyword: '#569CD6', // 蓝色
  // 字符串
  string: '#CE9178', // 橙红色
  // 注释
  comment: '#6A9955', // 绿色
  // 数字
  number: '#B5CEA8', // 淡绿色
  // 方法
  method: '#DCDCAA', // 黄色
  // 类型
  type: '#4EC9B0', // 青绿色
  // 属性
  property: '#9CDCFE', // 淡蓝色
  // 运算符
  operator: '#D4D4D4', // 灰白色
  // 普通文本
  plain: '#e6e6e6', // 浅色代码文本
};

// 用于各编程语言的正则表达式
const syntaxRules: {[key: string]: {pattern: RegExp, tokenType: string}[]} = {
  javascript: [
    { pattern: /(\/\/.*|\/\*[\s\S]*?\*\/)/g, tokenType: 'comment' },
    { pattern: /\b(const|let|var|function|return|if|else|for|while|class|import|export|from|await|async|try|catch|throw|new|this)\b/g, tokenType: 'keyword' },
    { pattern: /(".*?"|'.*?'|`[\s\S]*?`)/g, tokenType: 'string' },
    { pattern: /\b(\d+\.?\d*)\b/g, tokenType: 'number' },
    { pattern: /\b([A-Za-z_$][A-Za-z0-9_$]*)\(/g, tokenType: 'method' },
    { pattern: /\b(true|false|null|undefined)\b/g, tokenType: 'keyword' },
  ],
  typescript: [
    { pattern: /(\/\/.*|\/\*[\s\S]*?\*\/)/g, tokenType: 'comment' },
    { pattern: /\b(const|let|var|function|return|if|else|for|while|class|interface|type|import|export|from|await|async|try|catch|throw|new|this)\b/g, tokenType: 'keyword' },
    { pattern: /(".*?"|'.*?'|`[\s\S]*?`)/g, tokenType: 'string' },
    { pattern: /\b(\d+\.?\d*)\b/g, tokenType: 'number' },
    { pattern: /\b([A-Za-z_$][A-Za-z0-9_$]*)\(/g, tokenType: 'method' },
    { pattern: /\b(string|number|boolean|any|void|object|Record|Array|Promise)\b/g, tokenType: 'type' },
    { pattern: /\b(true|false|null|undefined)\b/g, tokenType: 'keyword' },
  ],
  python: [
    { pattern: /(#.*)/g, tokenType: 'comment' },
    { pattern: /\b(def|class|import|from|return|if|elif|else|for|while|try|except|raise|with|as|in|not|and|or|True|False|None)\b/g, tokenType: 'keyword' },
    { pattern: /(".*?"|'.*?'|"""[\s\S]*?"""|'''[\s\S]*?''')/g, tokenType: 'string' },
    { pattern: /\b(\d+\.?\d*)\b/g, tokenType: 'number' },
    { pattern: /\b([A-Za-z_][A-Za-z0-9_]*)\(/g, tokenType: 'method' },
  ],
  java: [
    { pattern: /(\/\/.*|\/\*[\s\S]*?\*\/)/g, tokenType: 'comment' },
    { pattern: /\b(public|private|protected|class|interface|enum|void|static|final|return|if|else|for|while|try|catch|throw|new|this|super|extends|implements)\b/g, tokenType: 'keyword' },
    { pattern: /(".*?")/g, tokenType: 'string' },
    { pattern: /\b(\d+\.?\d*)\b/g, tokenType: 'number' },
    { pattern: /\b([A-Za-z_$][A-Za-z0-9_$]*)\(/g, tokenType: 'method' },
    { pattern: /\b(boolean|byte|char|short|int|long|float|double|String|Object)\b/g, tokenType: 'type' },
    { pattern: /\b(true|false|null)\b/g, tokenType: 'keyword' },
  ],
  csharp: [
    { pattern: /(\/\/.*|\/\*[\s\S]*?\*\/)/g, tokenType: 'comment' },
    { pattern: /\b(using|namespace|class|interface|enum|struct|public|private|protected|internal|static|readonly|const|void|string|int|bool|var|new|return|if|else|for|foreach|while|try|catch|throw|this|base|null|true|false|async|await)\b/g, tokenType: 'keyword' },
    { pattern: /(".*?")/g, tokenType: 'string' },
    { pattern: /\b(\d+\.?\d*)\b/g, tokenType: 'number' },
    { pattern: /\b([A-Za-z_][A-Za-z0-9_]*)\(/g, tokenType: 'method' },
    { pattern: /\b(string|int|bool|object|double|float|decimal|long|byte|char|var)\b/g, tokenType: 'type' },
  ],
  cpp: [
    { pattern: /(\/\/.*|\/\*[\s\S]*?\*\/)/g, tokenType: 'comment' },
    { pattern: /\b(class|struct|enum|namespace|template|typename|public|private|protected|friend|virtual|override|const|static|void|return|if|else|for|while|do|switch|case|break|continue|try|catch|throw|new|delete|this|nullptr|true|false|using|std)\b/g, tokenType: 'keyword' },
    { pattern: /(".*?")/g, tokenType: 'string' },
    { pattern: /\b(\d+\.?\d*)\b/g, tokenType: 'number' },
    { pattern: /\b([A-Za-z_][A-Za-z0-9_]*)\(/g, tokenType: 'method' },
    { pattern: /\b(int|char|bool|float|double|void|auto|size_t|string|vector|map|set)\b/g, tokenType: 'type' },
  ],
  go: [
    { pattern: /(\/\/.*|\/\*[\s\S]*?\*\/)/g, tokenType: 'comment' },
    { pattern: /\b(package|import|func|type|struct|interface|map|chan|const|var|return|if|else|for|range|switch|case|break|continue|defer|go|select|true|false|nil)\b/g, tokenType: 'keyword' },
    { pattern: /(".*?")/g, tokenType: 'string' },
    { pattern: /\b(\d+\.?\d*)\b/g, tokenType: 'number' },
    { pattern: /\b([A-Za-z_][A-Za-z0-9_]*)\(/g, tokenType: 'method' },
    { pattern: /\b(string|int|int64|bool|float64|byte|error|interface{})\b/g, tokenType: 'type' },
  ],
  rust: [
    { pattern: /(\/\/.*|\/\*[\s\S]*?\*\/)/g, tokenType: 'comment' },
    { pattern: /\b(fn|use|mod|struct|enum|trait|impl|pub|let|mut|const|static|if|else|match|for|while|loop|break|continue|return|self|Self|true|false)\b/g, tokenType: 'keyword' },
    { pattern: /(".*?")/g, tokenType: 'string' },
    { pattern: /\b(\d+\.?\d*)\b/g, tokenType: 'number' },
    { pattern: /\b([A-Za-z_][A-Za-z0-9_]*)\(/g, tokenType: 'method' },
    { pattern: /\b(String|str|usize|u8|u16|u32|u64|i8|i16|i32|i64|f32|f64|bool|Result|Option|Vec|Box)\b/g, tokenType: 'type' },
  ],
  swift: [
    { pattern: /(\/\/.*|\/\*[\s\S]*?\*\/)/g, tokenType: 'comment' },
    { pattern: /\b(class|struct|enum|protocol|extension|func|var|let|return|if|else|for|while|guard|switch|case|break|continue|import|init|deinit|self|super|true|false|nil|try|catch|throw)\b/g, tokenType: 'keyword' },
    { pattern: /(".*?")/g, tokenType: 'string' },
    { pattern: /\b(\d+\.?\d*)\b/g, tokenType: 'number' },
    { pattern: /\b([A-Za-z_][A-Za-z0-9_]*)\(/g, tokenType: 'method' },
    { pattern: /\b(String|Int|Double|Bool|Any|AnyObject|Dictionary|Array)\b/g, tokenType: 'type' },
  ],
  kotlin: [
    { pattern: /(\/\/.*|\/\*[\s\S]*?\*\/)/g, tokenType: 'comment' },
    { pattern: /\b(package|import|class|interface|object|fun|val|var|return|if|else|when|for|while|do|break|continue|try|catch|throw|this|super|null|true|false|is|as|in)\b/g, tokenType: 'keyword' },
    { pattern: /(".*?")/g, tokenType: 'string' },
    { pattern: /\b(\d+\.?\d*)\b/g, tokenType: 'number' },
    { pattern: /\b([A-Za-z_][A-Za-z0-9_]*)\(/g, tokenType: 'method' },
    { pattern: /\b(String|Int|Double|Boolean|List|Map|Set|Any|Unit|Nothing)\b/g, tokenType: 'type' },
  ],
  ruby: [
    { pattern: /(#.*)/g, tokenType: 'comment' },
    { pattern: /\b(class|module|def|end|if|else|elsif|unless|case|when|while|until|for|begin|rescue|ensure|return|yield|self|nil|true|false|and|or|not|super)\b/g, tokenType: 'keyword' },
    { pattern: /(".*?"|'.*?'|%[qQrxiI]?\{.*?\}|%[qQrxiI]?\[.*?\]|%[qQrxiI]?\(.*?\)|%[qQrxiI]?<.*?>|%[qQrxiI]?\|.*?\|)/g, tokenType: 'string' },
    { pattern: /\b(\d+\.?\d*)\b/g, tokenType: 'number' },
    { pattern: /\b([A-Za-z_][A-Za-z0-9_]*[\?!]?)(\s*\(|\s*{|\.)/g, tokenType: 'method' },
    { pattern: /\b([A-Z][A-Za-z0-9_]*)\b/g, tokenType: 'type' },
  ],
  php: [
    { pattern: /(\/\/.*|\/\*[\s\S]*?\*\/|#.*)/g, tokenType: 'comment' },
    { pattern: /\b(class|interface|trait|extends|implements|namespace|use|function|public|private|protected|const|static|abstract|final|return|if|else|elseif|for|foreach|while|do|switch|case|break|continue|try|catch|throw|new|this|instanceof|echo|print|include|require|include_once|require_once|true|false|null)\b/g, tokenType: 'keyword' },
    { pattern: /(".*?"|'.*?')/g, tokenType: 'string' },
    { pattern: /\b(\d+\.?\d*)\b/g, tokenType: 'number' },
    { pattern: /\b([A-Za-z_][A-Za-z0-9_]*)\(/g, tokenType: 'method' },
    { pattern: /\b(string|int|float|bool|array|object|mixed|void)\b/g, tokenType: 'type' },
    { pattern: /(\$[A-Za-z_][A-Za-z0-9_]*)\b/g, tokenType: 'property' },
  ],
};

const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language = 'javascript',
  showLineNumbers = true,
  showCopyButton = true,
  style,
}) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    // 实际应用中使用剪贴板API
    // await Clipboard.setStringAsync(code);
    // 这里使用模拟方式
    console.log('已复制代码到剪贴板:', code);
    
    // 显示复制成功提示
    if (Platform.OS === 'android') {
      ToastAndroid.show('代码已复制到剪贴板', ToastAndroid.SHORT);
    } else {
      Alert.alert('提示', '代码已复制到剪贴板');
    }
    
    // 设置复制状态，短暂显示后恢复
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  // 根据语言的语法规则高亮显示代码
  const highlightSyntax = (text: string, lang: string) => {
    // 找到匹配的语言规则，如果没有则使用普通文本
    const rules = syntaxRules[lang] || [];
    
    // 如果没有规则，直接返回原文本
    if (rules.length === 0) {
      return <Text style={styles.codeText}>{text}</Text>;
    }
    
    // 创建初始标记，包含整个行
    let tokens: {text: string, type: string}[] = [{text, type: 'plain'}];
    
    // 应用每个规则
    rules.forEach(rule => {
      const newTokens: {text: string, type: string}[] = [];
      
      tokens.forEach(token => {
        // 如果不是普通文本，或者没有匹配，则保持不变
        if (token.type !== 'plain') {
          newTokens.push(token);
          return;
        }
        
        const segments = token.text.split(rule.pattern);
        const matches = token.text.match(rule.pattern) || [];
        
        for (let i = 0; i < segments.length; i++) {
          if (segments[i]) {
            newTokens.push({text: segments[i], type: 'plain'});
          }
          if (matches[i]) {
            newTokens.push({text: matches[i], type: rule.tokenType});
          }
        }
      });
      
      tokens = newTokens;
    });
    
    // 渲染标记
    return (
      <>
        {tokens.map((token, index) => (
          <Text 
            key={index} 
            style={[
              styles.codeText, 
              token.type !== 'plain' && {color: tokenColors[token.type] || styles.codeText.color}
            ]}
          >
            {token.text}
          </Text>
        ))}
      </>
    );
  };

  // 处理代码行
  const codeLines = code.split('\n');

  // 渲染代码行
  const renderCodeLines = () => {
    return codeLines.map((line, index) => (
      <View key={index} style={styles.codeLine}>
        {showLineNumbers && (
          <Text style={styles.lineNumber}>{index + 1}</Text>
        )}
        <View style={styles.codeLineContent}>
          {language && syntaxRules[language] 
            ? highlightSyntax(line || ' ', language) 
            : <Text style={styles.codeText}>{line || ' '}</Text>}
        </View>
      </View>
    ));
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        {language && (
          <View style={styles.languageTag}>
            <Text style={styles.languageText}>{language}</Text>
          </View>
        )}
        {showCopyButton && (
          <TouchableOpacity onPress={copyToClipboard} style={styles.copyButton}>
            <Ionicons 
              name={copied ? "checkmark" : "copy-outline"} 
              size={18} 
              color={copied ? theme.colors.success : theme.colors.textSecondary} 
            />
            <Text style={[
              styles.copyText, 
              copied && {color: theme.colors.success}
            ]}>
              {copied ? "已复制" : "复制"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <ScrollView horizontal style={styles.scrollContainer}>
        <ScrollView style={styles.codeContainer} showsVerticalScrollIndicator={false}>
          {renderCodeLines()}
        </ScrollView>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1e1e1e', // 暗色代码背景
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    marginVertical: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.sm,
    backgroundColor: '#2d2d2d', // 深色头部
    borderBottomWidth: 1,
    borderBottomColor: '#3e3e3e',
  },
  languageTag: {
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    backgroundColor: theme.colors.primary + '30',
  },
  languageText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '500',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.xs,
  },
  copyText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginLeft: 4,
  },
  scrollContainer: {
    maxHeight: 300, // 最大高度
  },
  codeContainer: {
    padding: theme.spacing.md,
  },
  codeLine: {
    flexDirection: 'row',
    paddingVertical: 2,
  },
  codeLineContent: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  lineNumber: {
    width: 30,
    marginRight: theme.spacing.sm,
    textAlign: 'right',
    color: '#6e6e6e', // 灰色行号
    fontSize: 12,
  },
  codeText: {
    color: '#e6e6e6', // 浅色代码文本
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
  },
});

export default CodeBlock; 