// 排版定义
import { Platform } from 'react-native';

// 字体家族
const fontFamily = Platform.select({
  ios: {
    // 明确指定 iOS 字体
    regular: 'SFProText-Regular',
    medium: 'SFProText-Medium',
    bold: 'SFProText-Bold',
    light: 'SFProText-Light',
    // 添加 Montserrat
    montserratRegular: 'Montserrat-Regular', // 如果需要 Regular
    montserratMedium: 'Montserrat-Medium',
    montserratSemiBold: 'Montserrat-SemiBold',
    montserratBold: 'Montserrat-Bold',
  },
  android: {
    // Android 保持 Roboto，但添加 Montserrat
    regular: 'Roboto',
    medium: 'Roboto-Medium',
    bold: 'Roboto-Bold',
    light: 'Roboto-Light',
    montserratRegular: 'Montserrat-Regular', // 确保 Android 也链接了
    montserratMedium: 'Montserrat-Medium',
    montserratSemiBold: 'Montserrat-SemiBold',
    montserratBold: 'Montserrat-Bold',
  },
  // default 可以保持不变或与 Android/iOS 一致
  default: {
    regular: 'sans-serif',
    medium: 'sans-serif-medium',
    bold: 'sans-serif-bold',
    light: 'sans-serif-light',
    // 如果默认平台也需要，理论上不太可能直接用
    montserratRegular: 'sans-serif',
    montserratMedium: 'sans-serif-medium',
    montserratSemiBold: 'sans-serif-medium', // 可能需要 fallback
    montserratBold: 'sans-serif-bold',
  },
});

// 字体大小
export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 30,
  display: 36,
  giant: 48,
};

// 行高
export const lineHeight = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 28,
  xl: 30,
  xxl: 36,
  xxxl: 42,
  display: 52,
  giant: 64,
};

// 字重
export const fontWeight = {
  light: '300',
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};


// 文本变体 (假设 fontFamily 和 fontWeight 已按要求更新)
export const textVariants = {
  h1: {
    fontFamily: fontFamily.montserratBold, // 修正: 使用 Montserrat Bold
    fontSize: fontSize.giant,
    lineHeight: lineHeight.giant,
    fontWeight: fontWeight.bold,
  },
  h2: {
    fontFamily: fontFamily.montserratBold, // 修正: 使用 Montserrat Bold
    fontSize: fontSize.display,
    lineHeight: lineHeight.display,
    fontWeight: fontWeight.bold,
  },
  h3: {
    fontFamily: fontFamily.montserratBold, // 修正: 使用 Montserrat Bold
    fontSize: fontSize.xxxl,
    lineHeight: lineHeight.xxxl,
    fontWeight: fontWeight.bold,
  },
  h4: {
    fontFamily: fontFamily.montserratSemiBold, // 修正: 使用 Montserrat SemiBold
    fontSize: fontSize.xxl,
    lineHeight: lineHeight.xxl,
    fontWeight: fontWeight.semibold,         // 修正: 使用 semibold 字重
  },
  h5: {
    fontFamily: fontFamily.montserratSemiBold, // 修正: 使用 Montserrat SemiBold
    fontSize: fontSize.xl,
    lineHeight: lineHeight.xl,
    fontWeight: fontWeight.semibold,         // 修正: 使用 semibold 字重
  },
  h6: {
    fontFamily: fontFamily.montserratSemiBold, // 修正: 使用 Montserrat SemiBold
    fontSize: fontSize.lg,
    lineHeight: lineHeight.lg,
    fontWeight: fontWeight.semibold,         // 修正: 使用 semibold 字重
  },
  subtitle1: {
    fontFamily: fontFamily.montserratSemiBold, // 修正: 使用 Montserrat SemiBold
    fontSize: fontSize.md,
    lineHeight: lineHeight.md,
    fontWeight: fontWeight.semibold,         // 修正: 使用 semibold 字重
  },
  subtitle2: {
    fontFamily: fontFamily.montserratSemiBold, // 修正: 使用 Montserrat SemiBold
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    fontWeight: fontWeight.semibold,         // 修正: 使用 semibold 字重
  },
  body1: {
    fontFamily: fontFamily.regular, // 保持: 使用 SF Pro Text / Roboto Regular
    fontSize: fontSize.md,
    lineHeight: lineHeight.md,
    fontWeight: fontWeight.regular,
  },
  body2: {
    fontFamily: fontFamily.regular, // 保持: 使用 SF Pro Text / Roboto Regular
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    fontWeight: fontWeight.regular,
  },
  button: {
    fontFamily: fontFamily.montserratMedium, // 修正: 使用 Montserrat Medium (用于强调)
    fontSize: fontSize.md,
    lineHeight: lineHeight.md, // 通常按钮行高可以和字号匹配或稍大，这里保持md一致
    fontWeight: fontWeight.medium,           // 修正: 使用 medium 字重
    // textTransform: 'uppercase', // 按需保留或移除大写转换
  },
  caption: {
    fontFamily: fontFamily.regular, // 保持: 使用 SF Pro Text / Roboto Regular
    fontSize: fontSize.xs,
    lineHeight: lineHeight.xs,
    fontWeight: fontWeight.regular,
  },
  overline: {
    fontFamily: fontFamily.regular, // 保持: 使用 SF Pro Text / Roboto Regular
    fontSize: fontSize.xs,
    lineHeight: lineHeight.xs,
    fontWeight: fontWeight.regular, // Overline 通常是 Regular 或 Medium，这里保持 Regular
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
};

export default {
  fontFamily,
  fontSize,
  lineHeight,
  fontWeight,
  textVariants,
};
