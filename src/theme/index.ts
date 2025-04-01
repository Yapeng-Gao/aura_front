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
    },
    // 其他深色模式特定样式...
  }
};

export default theme;
