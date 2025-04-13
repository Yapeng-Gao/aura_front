import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import theme from '../../theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface ScreenContainerProps {
  children: React.ReactNode;
  title: string;
  backgroundColor?: string;
  showBackButton?: boolean;
  rightButton?: {
    icon: string;
    onPress: () => void;
  };
  rightIcon?: React.ReactNode;
  onRightPress?: () => void;
  headerRight?: React.ReactNode;
  buttonText?: string; // 为兼容性添加，但实际未使用
  hideHeader?: boolean; // 新增属性，控制是否隐藏整个头部
}

const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  title,
  backgroundColor = theme.colors.background,
  showBackButton = false,
  rightButton,
  rightIcon,
  onRightPress,
  headerRight,
  hideHeader = false,
}) => {
  const navigation = useNavigation();

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={backgroundColor}
          translucent
        />
        {!hideHeader && (
          <View style={styles.header}>
            {showBackButton && (
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Icon name="arrow-left" size={24} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            )}
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{title}</Text>
            </View>
            {rightButton && (
              <TouchableOpacity
                style={styles.rightButton}
                onPress={rightButton.onPress}
              >
                <Text style={styles.rightButtonText}>{rightButton.icon}</Text>
              </TouchableOpacity>
            )}
            {rightIcon && onRightPress && (
              <TouchableOpacity
                style={styles.rightButton}
                onPress={onRightPress}
              >
                {rightIcon}
              </TouchableOpacity>
            )}
            {headerRight && (
              <View style={styles.headerRightContainer}>
                {headerRight}
              </View>
            )}
          </View>
        )}
        {children}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: theme.spacing.sm,
    marginRight: theme.spacing.sm,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold as any,
    color: theme.colors.textPrimary,
  },
  rightButton: {
    padding: theme.spacing.sm,
  },
  rightButtonText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.primary,
  },
  headerRightContainer: {
    position: 'absolute',
    right: theme.spacing.md,
    top: theme.spacing.md,
    zIndex: 1,
  },
});

export default ScreenContainer;
