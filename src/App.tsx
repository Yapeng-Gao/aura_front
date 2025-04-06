import React from 'react';
import { StatusBar, SafeAreaView, StyleSheet } from 'react-native';
import { AppNavigator } from './routes';
import Toast from 'react-native-toast-message';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <AppNavigator />
      <Toast />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
}); 