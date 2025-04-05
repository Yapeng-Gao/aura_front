import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import ScreenContainer from '../../components/common/ScreenContainer';
import ListItem from '../../components/common/ListItem';
import Button from '../../components/common/Button';
import theme from '../../theme';
import apiService from '../../services/api';
import { updateUserPreferences } from '../../store/slices/authSlice';
import { RootState } from '../../store';

type ThemeOption = 'system' | 'light' | 'dark';

const ThemeSettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const userPreferences = useSelector((state: RootState) => state.auth.user?.preferences);
  
  const [selectedTheme, setSelectedTheme] = useState<ThemeOption>('system');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 加载用户当前的主题设置
    if (userPreferences?.theme) {
      setSelectedTheme(userPreferences.theme as ThemeOption);
    }
  }, [userPreferences]);

  const saveThemeSettings = async () => {
    setLoading(true);
    try {
      // 更新用户偏好
      const updatedPreferences = await apiService.user.updatePreferences({
        theme: selectedTheme
      });
      
      // 更新本地状态
      if (updatedPreferences) {
        dispatch(updateUserPreferences({ theme: selectedTheme }));
      }
      
      navigation.goBack();
    } catch (error) {
      console.error('保存主题设置失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer
      title="主题设置"
      backgroundColor={theme.colors.background}
    >
      <ScrollView style={styles.container}>
        <View style={styles.optionsContainer}>
          <ListItem
            title="跟随系统"
            rightIcon={
              <View style={[
                styles.radioButton,
                selectedTheme === 'system' && styles.radioButtonSelected
              ]} />
            }
            onPress={() => setSelectedTheme('system')}
          />
          <ListItem
            title="浅色模式"
            rightIcon={
              <View style={[
                styles.radioButton,
                selectedTheme === 'light' && styles.radioButtonSelected
              ]} />
            }
            onPress={() => setSelectedTheme('light')}
          />
          <ListItem
            title="深色模式"
            rightIcon={
              <View style={[
                styles.radioButton,
                selectedTheme === 'dark' && styles.radioButtonSelected
              ]} />
            }
            onPress={() => setSelectedTheme('dark')}
            divider={false}
          />
        </View>

        <Button
          title="保存"
          variant="primary"
          size="large"
          loading={loading}
          onPress={saveThemeSettings}
          style={styles.saveButton}
        />
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.md,
  },
  optionsContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  radioButtonSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  saveButton: {
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.xxl,
  },
});

export default ThemeSettingsScreen; 