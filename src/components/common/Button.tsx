import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import theme from '../../theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'text';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
  leftIcon,
  rightIcon,
}) => {
  // 根据变体获取样式
  const getVariantStyle = () => {
    switch (variant) {
      case 'primary':
        return {
          container: styles.primaryContainer,
          text: styles.primaryText,
        };
      case 'secondary':
        return {
          container: styles.secondaryContainer,
          text: styles.secondaryText,
        };
      case 'outline':
        return {
          container: styles.outlineContainer,
          text: styles.outlineText,
        };
      case 'text':
        return {
          container: styles.textContainer,
          text: styles.textText,
        };
      default:
        return {
          container: styles.primaryContainer,
          text: styles.primaryText,
        };
    }
  };

  // 根据尺寸获取样式
  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return styles.smallContainer;
      case 'medium':
        return styles.mediumContainer;
      case 'large':
        return styles.largeContainer;
      default:
        return styles.mediumContainer;
    }
  };

  const variantStyle = getVariantStyle();
  const sizeStyle = getSizeStyle();

  return (
    <TouchableOpacity
      style={[
        styles.baseContainer,
        variantStyle.container,
        sizeStyle,
        fullWidth && styles.fullWidth,
        disabled && styles.disabledContainer,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? theme.colors.onPrimary : theme.colors.primary}
        />
      ) : (
        <>
          {leftIcon}
          <Text
            style={[
              styles.baseText,
              variantStyle.text,
              disabled && styles.disabledText,
              leftIcon && { marginLeft: theme.spacing.sm },
              rightIcon && { marginRight: theme.spacing.sm },
              textStyle,
            ]}
          >
            {title}
          </Text>
          {rightIcon}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.md,
  },
  fullWidth: {
    width: '100%',
  },
  // 变体样式
  primaryContainer: {
    backgroundColor: theme.colors.primary,
  },
  primaryText: {
    color: theme.colors.onPrimary,
  },
  secondaryContainer: {
    backgroundColor: theme.colors.secondary,
  },
  secondaryText: {
    color: theme.colors.onSecondary,
  },
  outlineContainer: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  outlineText: {
    color: theme.colors.primary,
  },
  textContainer: {
    backgroundColor: 'transparent',
  },
  textText: {
    color: theme.colors.primary,
  },
  // 尺寸样式
  smallContainer: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    minHeight: 32,
  },
  mediumContainer: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    minHeight: 44,
  },
  largeContainer: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    minHeight: 56,
  },
  // 文本基础样式
  baseText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium,
    textAlign: 'center',
  },
  // 禁用状态
  disabledContainer: {
    backgroundColor: theme.colors.textDisabled,
    borderColor: theme.colors.textDisabled,
    opacity: 0.5,
  },
  disabledText: {
    color: theme.colors.textDisabled,
  },
});

export default Button;
