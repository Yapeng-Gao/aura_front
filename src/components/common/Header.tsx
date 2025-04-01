import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import theme from '../../theme';

interface HeaderProps {
  title: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onLeftPress?: () => void;
  onRightPress?: () => void;
  transparent?: boolean;
  light?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  title,
  leftIcon,
  rightIcon,
  onLeftPress,
  onRightPress,
  transparent = false,
  light = false,
}) => {
  const insets = useSafeAreaInsets();
  
  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top },
        transparent ? styles.transparent : styles.solid,
      ]}
    >
      <View style={styles.content}>
        <TouchableOpacity
          style={styles.iconContainer}
          onPress={onLeftPress}
          disabled={!onLeftPress}
        >
          {leftIcon}
        </TouchableOpacity>
        
        <Text
          style={[
            styles.title,
            light ? styles.lightTitle : styles.darkTitle,
          ]}
          numberOfLines={1}
        >
          {title}
        </Text>
        
        <TouchableOpacity
          style={styles.iconContainer}
          onPress={onRightPress}
          disabled={!onRightPress}
        >
          {rightIcon}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  solid: {
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  transparent: {
    backgroundColor: 'transparent',
  },
  content: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.medium,
  },
  lightTitle: {
    color: theme.colors.onPrimary,
  },
  darkTitle: {
    color: theme.colors.textPrimary,
  },
});

export default Header;
