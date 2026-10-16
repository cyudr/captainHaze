import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppLanguage, getInitialLanguage, saveLanguage, TRANSLATIONS } from '../utils/i18n';

interface LanguageContextType {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{
  children: React.ReactNode;
  initialLanguage?: AppLanguage;
  onLanguageChange?: (lang: AppLanguage) => void;
}> = ({ children, initialLanguage, onLanguageChange }) => {
  const [language, setLanguageState] = useState<AppLanguage>(initialLanguage || getInitialLanguage());

  useEffect(() => {
    if (initialLanguage && initialLanguage !== language) {
      setLanguageState(initialLanguage);
    }
  }, [initialLanguage]);

  const setLanguage = (lang: AppLanguage) => {
    setLanguageState(lang);
    saveLanguage(lang);
    if (onLanguageChange) {
      onLanguageChange(lang);
    }
  };

  const t = (key: string, fallback?: string): string => {
    const langDict = TRANSLATIONS[language] || TRANSLATIONS.en;
    if (langDict && langDict[key]) {
      return langDict[key];
    }
    // Fallback to English
    if (TRANSLATIONS.en && TRANSLATIONS.en[key]) {
      return TRANSLATIONS.en[key];
    }
    return fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    // Graceful fallback if used outside Provider
    return {
      language: 'en',
      setLanguage: () => {},
      t: (key: string, fallback?: string) => {
        return (TRANSLATIONS.en && TRANSLATIONS.en[key]) || fallback || key;
      },
    };
  }
  return context;
}
