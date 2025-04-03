import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import theme from '../../theme';

interface ListItemProps {
  title: string;
  subtitle?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  divider?: boolean;
  disabled?: boolean;
  selected?: boolean;
}

const ListItem: React.FC<ListItemProps> = ({
  title,
  subtitle,
  leftIcon,
  rightIcon,
  onPress,
  style,
  divider = true,
  disabled = false,
  selected = false,
}) => {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      style={[
        styles.container,
        divider && styles.divider,
        disabled && styles.disabled,
        selected && styles.selected,
        style,
      ]}
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
      
      <View style={styles.textContainer}>
        <Text 
          style={[
            styles.title, 
            disabled && styles.disabledText,
            selected && styles.selectedText,
            subtitle && styles.titleWithSubtitle
          ]}
          numberOfLines={1}
        >
          {title}
        </Text>
        {subtitle && (
          <Text 
            style={[
              styles.subtitle, 
              disabled && styles.disabledText
            ]}
            numberOfLines={2}
          >
            {subtitle}
          </Text>
        )}
      </View>
      
      {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.surface,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  leftIcon: {
    marginRight: theme.spacing.md,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium as any,
    color: theme.colors.textPrimary,
  },
  titleWithSubtitle: {
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  rightIcon: {
    marginLeft: theme.spacing.md,
  },
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    color: theme.colors.textDisabled,
  },
  selected: {
    backgroundColor: `${theme.colors.primary}10`, // 10% opacity of primary color
  },
  selectedText: {
    color: theme.colors.primary,
  },
});

export default ListItem;
