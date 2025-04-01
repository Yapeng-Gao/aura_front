import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, StatusBar } from 'react-native';
import theme from '../../theme';
import Header from '../common/Header';

interface ScreenContainerProps {
  children: React.ReactNode;
  title?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onLeftPress?: () => void;
  onRightPress?: () => void;
  scrollable?: boolean;
  paddingHorizontal?: boolean;
  backgroundColor?: string;
  statusBarStyle?: 'light-content' | 'dark-content';
  headerTransparent?: boolean;
}

const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  title,
  leftIcon,
  rightIcon,
  onLeftPress,
  onRightPress,
  scrollable = true,
  paddingHorizontal = true,
  backgroundColor = theme.colors.background,
  statusBarStyle = 'dark-content',
  headerTransparent = false,
}) => {
  const Container = scrollable ? ScrollView : View;
  
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <StatusBar 
        barStyle={statusBarStyle} 
        backgroundColor={headerTransparent ? 'transparent' : backgroundColor}
        translucent={headerTransparent}
      />
      
      {title && (
        <Header
          title={title}
          leftIcon={leftIcon}
          rightIcon={rightIcon}
          onLeftPress={onLeftPress}
          onRightPress={onRightPress}
          transparent={headerTransparent}
          light={statusBarStyle === 'light-content'}
        />
      )}
      
      <Container
        style={[
          styles.container,
          paddingHorizontal && styles.paddingHorizontal,
          { backgroundColor },
        ]}
        contentContainerStyle={scrollable && styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </Container>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  paddingHorizontal: {
    paddingHorizontal: theme.spacing.md,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: theme.spacing.xl,
  },
});

export default ScreenContainer;
