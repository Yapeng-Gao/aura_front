import { useColorScheme } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

/**
 * 自定义钩子用于检测当前主题模式并提供是否为暗黑模式的状态
 * 会先检查用户设置的主题偏好，如果设置为跟随系统则使用系统主题
 * 返回一个布尔值，true表示暗黑模式，false表示亮色模式
 */
const useDarkMode = (): boolean => {
  const colorScheme = useColorScheme();
  const userThemePreference = useSelector((state: RootState) => 
    state.auth.user?.preferences?.theme
  );
  
  // 如果用户明确设置了主题，优先使用用户设置
  if (userThemePreference === 'dark') {
    return true;
  } else if (userThemePreference === 'light') {
    return false;
  }
  
  // 否则跟随系统设置
  return colorScheme === 'dark';
};

export default useDarkMode; 