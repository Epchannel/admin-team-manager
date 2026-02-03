import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'vi' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  vi: {
    // Header
    'header.title': 'ChatGPT Admin Manager',
    'header.subtitle': 'Quản lý tài khoản admin & teams',
    'header.actions': 'Actions',
    'header.addAdmin': 'Thêm Admin',
    'header.syncAll': 'Sync All',
    'header.healthCheck': 'Kiểm tra Health',
    'header.exportAdmins': 'Xuất Admins (CSV)',
    'header.exportUsers': 'Xuất Users (CSV)',
    'header.exportAll': 'Xuất All (JSON)',
    'header.quickAdd': 'Quick Add',
    'header.shortcuts': 'Phím tắt',
    'header.logout': 'Đăng xuất',
    'header.admin': 'Admin',
    'header.language': 'Ngôn ngữ',
    'header.vietnamese': 'Tiếng Việt',
    'header.english': 'English',
    
    // Team slots tooltip
    'slots.title': 'Slots trống theo team:',
    'slots.noTeam': 'Không có team nào',
    'slots.total': 'Tổng:',
    'slots.available': 'slots khả dụng',
    'slots.slot': 'slot',
    'slots.slots': 'slots',
  },
  en: {
    // Header
    'header.title': 'ChatGPT Admin Manager',
    'header.subtitle': 'Manage your admin accounts & teams',
    'header.actions': 'Actions',
    'header.addAdmin': 'Add Admin',
    'header.syncAll': 'Sync All',
    'header.healthCheck': 'Health Check',
    'header.exportAdmins': 'Export Admins (CSV)',
    'header.exportUsers': 'Export Users (CSV)',
    'header.exportAll': 'Export All (JSON)',
    'header.quickAdd': 'Quick Add',
    'header.shortcuts': 'Shortcuts',
    'header.logout': 'Sign out',
    'header.admin': 'Admin',
    'header.language': 'Language',
    'header.vietnamese': 'Tiếng Việt',
    'header.english': 'English',
    
    // Team slots tooltip
    'slots.title': 'Available slots by team:',
    'slots.noTeam': 'No teams available',
    'slots.total': 'Total:',
    'slots.available': 'slots available',
    'slots.slot': 'slot',
    'slots.slots': 'slots',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('app-language');
    return (saved as Language) || 'vi';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app-language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
