import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import theme from '../../theme';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // 更新state，使下一次渲染显示错误UI
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // 记录错误信息
    console.error('Error caught by ErrorBoundary:', error, info);
    
    // 可以在这里发送错误到错误跟踪服务
    // 如果集成了Sentry，可以在这里调用Sentry.captureException(error)
    
    // 如果提供了onError回调，则调用它
    if (this.props.onError) {
      this.props.onError(error, info);
    }
  }
  
  // 重置错误状态
  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null
    });
  };

  render(): ReactNode {
    // 如果有错误，则显示回退UI
    if (this.state.hasError) {
      // 如果提供了自定义回退UI，则使用它
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // 否则使用默认回退UI
      return (
        <View style={styles.container}>
          <Text style={styles.title}>出错了</Text>
          <Text style={styles.message}>
            {this.state.error?.message || '应用程序发生了错误'}
          </Text>
          <TouchableOpacity 
            style={styles.button} 
            onPress={this.resetError}
          >
            <Text style={styles.buttonText}>重试</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // 如果没有错误，正常渲染子组件
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.error,
    marginBottom: theme.spacing.md,
  },
  message: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  button: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  buttonText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.md,
    fontWeight: '500',
  },
});

export default ErrorBoundary; 