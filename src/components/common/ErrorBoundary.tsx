import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Sentry from '@sentry/react-native';
import theme from '../../theme';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // 更新 state 使下一次渲染能够显示降级 UI
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // 记录错误信息
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    
    // 更新状态
    this.setState({
      error,
      errorInfo
    });
    
    // 发送错误到Sentry (如果已配置)
    Sentry.captureException(error);
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // 如果提供了自定义的降级UI，则使用它
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // 否则显示默认的错误UI
      return (
        <View style={styles.container}>
          <Text style={styles.errorTitle}>出错了</Text>
          <Text style={styles.errorText}>
            应用程序遇到了一个问题。我们已记录此错误并将尽快修复。
          </Text>
          
          {__DEV__ && this.state.error && (
            <View style={styles.devErrorContainer}>
              <Text style={styles.devErrorTitle}>错误详情（仅开发模式可见）：</Text>
              <Text style={styles.devErrorText}>{this.state.error.toString()}</Text>
              {this.state.errorInfo && (
                <Text style={styles.devErrorStack}>
                  {this.state.errorInfo.componentStack}
                </Text>
              )}
            </View>
          )}
          
          <TouchableOpacity style={styles.button} onPress={this.resetError}>
            <Text style={styles.buttonText}>重试</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: theme.colors.background
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.error,
    marginBottom: 10
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: theme.colors.textPrimary
  },
  devErrorContainer: {
    width: '100%',
    padding: 10,
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    marginBottom: 20
  },
  devErrorTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
    color: theme.colors.error
  },
  devErrorText: {
    marginBottom: 10,
    color: theme.colors.textPrimary
  },
  devErrorStack: {
    fontSize: 12,
    color: theme.colors.textSecondary
  },
  button: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  }
});

export default ErrorBoundary; 