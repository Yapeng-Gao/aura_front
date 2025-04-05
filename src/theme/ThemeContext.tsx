import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import theme from './index';

type ThemeContextType = {
  isDarkMode: boolean;
  toggleTheme: () => void;
  theme: typeof theme;
};

// 创建主题上下文
const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false,
  toggleTheme: () => {},
  theme: theme
});

// 创建主题提供者组件
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 获取系统颜色模式
  const colorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === 'dark');

  // 监听系统颜色模式变化
  useEffect(() => {
    setIsDarkMode(colorScheme === 'dark');
  }, [colorScheme]);

  // 切换主题模式
  const toggleTheme = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

  // 主题上下文值
  const themeContextValue = {
    isDarkMode,
    toggleTheme,
    theme: isDarkMode ? { ...theme, colors: theme.dark.colors } : theme
  };

  return (
    <ThemeContext.Provider value={themeContextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// 创建使用主题的Hook
export const useTheme = () => useContext(ThemeContext); 