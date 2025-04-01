import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import apiService from '../../services/api';
import { useSync } from '../../services/sync';
import theme from '../../theme';

// 错误边界组件
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>出错了</Text>
          <Text style={styles.errorMessage}>{this.state.error?.message || '发生了未知错误'}</Text>
          <Text 
            style={styles.errorRetry}
            onPress={() => this.setState({ hasError: false, error: null })}
          >
            点击重试
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

// 加载状态组件
interface LoadingProps {
  size?: 'small' | 'large';
  color?: string;
  text?: string;
  fullScreen?: boolean;
}

const Loading: React.FC<LoadingProps> = ({ 
  size = 'large', 
  color = theme.colors.primary, 
  text = '加载中...',
  fullScreen = false
}) => {
  return (
    <View style={[styles.loadingContainer, fullScreen && styles.fullScreen]}>
      <ActivityIndicator size={size} color={color} />
      {text && <Text style={styles.loadingText}>{text}</Text>}
    </View>
  );
};

// 网络状态指示器组件
const NetworkIndicator: React.FC = () => {
  const { isOnline, isSyncing, pendingActions } = useSync();

  if (isOnline && !isSyncing && pendingActions === 0) {
    return null;
  }

  return (
    <View style={[
      styles.networkIndicator,
      !isOnline ? styles.offlineIndicator : styles.syncingIndicator
    ]}>
      <Text style={styles.networkIndicatorText}>
        {!isOnline 
          ? '离线模式' 
          : isSyncing 
            ? '正在同步...' 
            : `等待同步 (${pendingActions})`}
      </Text>
    </View>
  );
};

// API错误处理钩子
export const useApiWithErrorHandling = <T extends any>(
  apiCall: () => Promise<T>,
  dependencies: any[] = []
) => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await apiCall();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('发生了未知错误'));
      console.error('API调用错误:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, dependencies);

  return { data, isLoading, error, refetch: fetchData };
};

// 通用错误显示组件
interface ErrorDisplayProps {
  error: Error | null;
  onRetry?: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, onRetry }) => {
  if (!error) return null;

  return (
    <View style={styles.errorDisplay}>
      <Text style={styles.errorDisplayTitle}>出错了</Text>
      <Text style={styles.errorDisplayMessage}>{error.message}</Text>
      {onRetry && (
        <Text style={styles.errorDisplayRetry} onPress={onRetry}>
          点击重试
        </Text>
      )}
    </View>
  );
};

// 离线模式提示组件
const OfflineModeBanner: React.FC = () => {
  const { isOnline, pendingActions } = useSync();

  if (isOnline && pendingActions === 0) {
    return null;
  }

  return (
    <View style={styles.offlineBanner}>
      <Text style={styles.offlineBannerText}>
        {!isOnline 
          ? '您当前处于离线模式，部分功能可能不可用' 
          : `有 ${pendingActions} 个操作等待同步`}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background,
  },
  errorTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.error,
    marginBottom: theme.spacing.md,
  },
  errorMessage: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  errorRetry: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.medium,
    padding: theme.spacing.md,
  },
  loadingContainer: {
    padding: theme.spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
  },
  networkIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingVertical: theme.spacing.xs,
    alignItems: 'center',
    zIndex: 1000,
  },
  offlineIndicator: {
    backgroundColor: theme.colors.error,
  },
  syncingIndicator: {
    backgroundColor: theme.colors.warning,
  },
  networkIndicatorText: {
    color: theme.colors.onPrimary,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
  },
  errorDisplay: {
    padding: theme.spacing.md,
    backgroundColor: `${theme.colors.error}20`,
    borderRadius: theme.borderRadius.md,
    marginVertical: theme.spacing.md,
  },
  errorDisplayTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.error,
    marginBottom: theme.spacing.xs,
  },
  errorDisplayMessage: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  errorDisplayRetry: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.medium,
    alignSelf: 'flex-end',
  },
  offlineBanner: {
    backgroundColor: `${theme.colors.warning}20`,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  offlineBannerText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.warning,
    textAlign: 'center',
  },
});

export { ErrorBoundary, Loading, NetworkIndicator, ErrorDisplay, OfflineModeBanner };
