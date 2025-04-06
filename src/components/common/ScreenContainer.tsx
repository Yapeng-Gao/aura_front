import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar } from 'react-native';

interface ScreenContainerProps {
  children: ReactNode;
  title?: string;
  backgroundColor?: string;
  showHeader?: boolean;
  headerRight?: ReactNode;
}

const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  title,
  backgroundColor = '#f5f5f5',
  showHeader = false,
  headerRight,
}) => {
  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <StatusBar barStyle="dark-content" backgroundColor={backgroundColor} />
      
      {showHeader && (
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{title}</Text>
          {headerRight && <View style={styles.headerRight}>{headerRight}</View>}
        </View>
      )}
      
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerRight: {
    alignItems: 'flex-end',
  },
});

export default ScreenContainer;
