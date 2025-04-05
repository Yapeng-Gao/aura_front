import colors from './colors';
import typography from './typography';

// 间距和尺寸
const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// 圆角
const borderRadius = {
  xs: 2,
  sm: 4,
  md: 8,
  lg: 16,
  xl: 24,
  round: 9999,
  full: 100,
};

// 阴影 (iOS)
const shadowsIOS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
  },
};

// 阴影 (Android)
const shadowsAndroid = {
  sm: {
    elevation: 2,
  },
  md: {
    elevation: 5,
  },
  lg: {
    elevation: 8,
  },
  xl: {
    elevation: 12,
  },
};

// 动画时间
const animation = {
  fast: 200,
  normal: 300,
  slow: 500,
};

// 常规配色方案（亮色主题）
const lightColors = {
  primary: '#4C6FFF',
  primaryLight: '#7C96FF',
  primaryDark: '#3A5BDB',
  secondary: '#00D1B2',
  secondaryLight: '#40E0D0',
  secondaryDark: '#00B3A1',
  error: '#FF3A5A',
  warning: '#FFAC00',
  success: '#00C48C',
  info: '#00B5E2',
  background: '#F7F9FC',
  surface: '#FFFFFF',
  cardBackground: '#FFFFFF',
  border: '#E5E9F0',
  divider: '#E5E9F0',
  textPrimary: '#2E3A59',
  textSecondary: '#8F9BB3',
  textTertiary: '#C5CEE0',
  textDisabled: '#C5CEE0',
  shadow: '#121829',
  white: '#FFFFFF',
  black: '#000000',
};

// 暗色主题配色
const darkColors = {
  primary: '#5B7FFF',
  primaryLight: '#8DA6FF',
  primaryDark: '#4A6BDB',
  secondary: '#20E2C7',
  secondaryLight: '#60F0E0',
  secondaryDark: '#00C4B0',
  error: '#FF5C7C',
  warning: '#FFB930',
  success: '#20D5A0',
  info: '#20C5F2',
  background: '#1A1F2E',
  surface: '#242B3E',
  cardBackground: '#242B3E',
  border: '#323B54',
  divider: '#323B54',
  textPrimary: '#FFFFFF',
  textSecondary: '#B4C0D3',
  textTertiary: '#8897B1',
  textDisabled: '#586583',
  shadow: '#000000',
  white: '#FFFFFF',
  black: '#000000',
};

// 主题对象
const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows: {
    ios: shadowsIOS,
    android: shadowsAndroid,
  },
  animation,
  // 深色模式支持
  dark: {
    colors: {
      ...colors,
      background: colors.dark.background,
      surface: colors.dark.surface,
      primary: colors.dark.primary,
      secondary: colors.dark.secondary,
      onBackground: colors.dark.onBackground,
      onSurface: colors.dark.onSurface,
      textPrimary: colors.dark.textPrimary,
      textSecondary: colors.dark.textSecondary,
      border: colors.dark.border,
      divider: colors.dark.divider,
      cardBackground: colors.dark.cardBackground,
    },
    // 其他深色模式特定样式...
  }
};

export default theme;
