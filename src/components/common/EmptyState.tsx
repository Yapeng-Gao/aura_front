import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import theme from '../../theme';

interface EmptyStateProps {
  icon: string; // Ionicons 图标名称
  title: string;
  message: string;
  actionLabel?: string;
  buttonText?: string; // 与actionLabel功能相同，兼容旧代码
  onAction?: () => void;
  isDarkMode?: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  message,
  actionLabel,
  buttonText,
  onAction,
  isDarkMode = false
}) => {
  // 使用buttonText或actionLabel
  const buttonLabel = buttonText || actionLabel;
  
  return (
    <View style={styles.container}>
      <Icon 
        name={icon} 
        size={70} 
        color={isDarkMode ? theme.dark.colors.textSecondary : theme.colors.textSecondary} 
      />
      
      <Text style={[
        styles.title, 
        isDarkMode && { color: theme.dark.colors.textPrimary }
      ]}>
        {title}
      </Text>
      
      <Text style={[
        styles.message, 
        isDarkMode && { color: theme.dark.colors.textSecondary }
      ]}>
        {message}
      </Text>
      
      {buttonLabel && onAction && (
        <TouchableOpacity 
          style={[
            styles.actionButton,
            isDarkMode && { backgroundColor: theme.dark.colors.primary }
          ]} 
          onPress={onAction}
        >
          <Text style={styles.actionButtonText}>
            {buttonLabel}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    lineHeight: 22,
  },
  actionButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.lg,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default EmptyState; 