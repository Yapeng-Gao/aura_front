import { NativeModules, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 导入语言资源
import en from './languages/en';
import zh from './languages/zh';

// 支持的语言
export enum SupportedLanguages {
  EN = 'en',
  ZH = 'zh',
}

// 语言资源
const resources = {
  [SupportedLanguages.EN]: en,
  [SupportedLanguages.ZH]: zh,
};

// 存储键
const LANGUAGE_STORAGE_KEY = '@aura_app_language';

// 获取设备语言
export const getDeviceLanguage = (): SupportedLanguages => {
  try {
    let deviceLanguage: string = '';
    
    // 根据平台获取设备语言
    if (Platform.OS === 'ios') {
      const iosSettings = NativeModules.SettingsManager?.settings;
      deviceLanguage = iosSettings?.AppleLocale || 
                     (iosSettings?.AppleLanguages && iosSettings.AppleLanguages[0]) || 
                     SupportedLanguages.EN;
    } else if (Platform.OS === 'android') {
      // 安全地访问localeIdentifier属性
      deviceLanguage = NativeModules.I18nManager?.localeIdentifier || SupportedLanguages.EN;
    } else {
      // 对于Windows或其他平台，默认使用英语
      deviceLanguage = SupportedLanguages.EN;
    }
    
    // 简化为语言代码
    const languageCode = deviceLanguage.split(/[-_]/)[0];
    
    // 检查是否支持该语言，如果不支持则默认英语
    return Object.values(SupportedLanguages).includes(languageCode as SupportedLanguages)
      ? languageCode as SupportedLanguages
      : SupportedLanguages.EN;
  } catch (error) {
    console.warn('获取设备语言时出错:', error);
    return SupportedLanguages.EN;
  }
};

// 获取存储的语言
export const getStoredLanguage = async (): Promise<SupportedLanguages | null> => {
  try {
    const language = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    return language as SupportedLanguages || null;
  } catch (error) {
    console.error('Error getting stored language:', error);
    return null;
  }
};

// 设置语言
export const setLanguage = async (language: SupportedLanguages): Promise<void> => {
  try {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch (error) {
    console.error('Error setting language:', error);
  }
};

// 获取语言资源
export const getTranslations = (language: SupportedLanguages) => {
  return resources[language];
};

/**
 * 国际化类，提供翻译和语言管理功能
 */
class I18n {
  private static instance: I18n;
  private currentLanguage: SupportedLanguages = SupportedLanguages.EN;
  private listeners: ((language: SupportedLanguages) => void)[] = [];
  
  private constructor() {
    // 初始化为设备语言
    this.currentLanguage = getDeviceLanguage();
    
    // 尝试获取存储的语言
    this.initializeLanguage();
  }
  
  /**
   * 获取I18n实例（单例模式）
   */
  public static getInstance(): I18n {
    if (!I18n.instance) {
      I18n.instance = new I18n();
    }
    return I18n.instance;
  }
  
  /**
   * 初始化语言设置
   */
  private async initializeLanguage(): Promise<void> {
    const storedLanguage = await getStoredLanguage();
    if (storedLanguage) {
      this.setLanguage(storedLanguage);
    }
  }
  
  /**
   * 设置当前语言
   */
  public setLanguage(language: SupportedLanguages): void {
    this.currentLanguage = language;
    setLanguage(language).catch(console.error);
    this.notifyListeners();
  }
  
  /**
   * 获取当前语言
   */
  public getLanguage(): SupportedLanguages {
    return this.currentLanguage;
  }
  
  /**
   * 获取翻译
   */
  public t(key: string, params?: Record<string, string>): string {
    const translations = resources[this.currentLanguage];
    const keys = key.split('.');
    
    // 递归查找翻译
    let result: any = translations;
    for (const k of keys) {
      if (!result[k]) {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
      result = result[k];
    }
    
    // 如果结果不是字符串，返回键值
    if (typeof result !== 'string') {
      console.warn(`Translation value is not a string for key: ${key}`);
      return key;
    }
    
    // 替换参数
    if (params) {
      return Object.entries(params).reduce(
        (text, [param, value]) => text.replace(`{${param}}`, value),
        result
      );
    }
    
    return result;
  }
  
  /**
   * 添加语言变更监听器
   */
  public addListener(listener: (language: SupportedLanguages) => void): void {
    this.listeners.push(listener);
  }
  
  /**
   * 移除语言变更监听器
   */
  public removeListener(listener: (language: SupportedLanguages) => void): void {
    this.listeners = this.listeners.filter(l => l !== listener);
  }
  
  /**
   * 通知所有监听器
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.currentLanguage));
  }
}

// 导出单例
const i18nInstance = I18n.getInstance();
export default i18nInstance; 