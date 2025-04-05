import { useEffect, useState } from 'react';
import i18n, { SupportedLanguages } from '../localization/i18n';

/**
 * 翻译钩子，提供当前语言和翻译函数
 * 
 * @returns 包含t翻译函数和当前语言的对象
 */
export const useTranslation = () => {
  // 确保从i18n实例获取语言，避免getLanguage属性问题
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguages>(i18n.getLanguage());
  
  useEffect(() => {
    // 监听语言变化
    const languageChangeListener = (language: SupportedLanguages) => {
      setCurrentLanguage(language);
    };
    
    // 添加监听器
    i18n.addListener(languageChangeListener);
    
    // 清理监听器
    return () => {
      i18n.removeListener(languageChangeListener);
    };
  }, []);
  
  // 返回翻译函数和当前语言
  return {
    t: (key: string, params?: Record<string, string>) => i18n.t(key, params),
    currentLanguage,
    changeLanguage: (language: SupportedLanguages) => i18n.setLanguage(language),
  };
};

export default useTranslation; 