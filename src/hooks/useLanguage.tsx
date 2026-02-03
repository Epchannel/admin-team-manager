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
    'header.actions': 'Hành động',
    'header.addAdmin': 'Thêm Admin',
    'header.syncAll': 'Đồng bộ tất cả',
    'header.healthCheck': 'Kiểm tra Health',
    'header.exportAdmins': 'Xuất Admins (CSV)',
    'header.exportUsers': 'Xuất Users (CSV)',
    'header.exportAll': 'Xuất All (JSON)',
    'header.quickAdd': 'Thêm nhanh',
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
    
    // Stats
    'stats.totalAdmins': 'Tổng Admin',
    'stats.totalMembers': 'Tổng thành viên',
    'stats.teamsAtCapacity': 'Team đầy',
    'stats.overCapacity': 'Quá giới hạn',
    
    // Tabs
    'tabs.admins': 'Tài khoản Admin',
    'tabs.users': 'Tất cả Users',
    'tabs.analytics': 'Phân tích',
    'tabs.activity': 'Hoạt động',
    
    // Admin Card
    'card.overLimit': 'Quá giới hạn',
    'card.tokenValid': 'Token hợp lệ',
    'card.tokenError': 'Token lỗi',
    'card.editAccount': 'Sửa tài khoản',
    'card.manageTeam': 'Quản lý Team',
    'card.triggerAutoDelete': 'Xoá tự động',
    'card.deleteAccount': 'Xoá tài khoản',
    'card.checked': 'Checked',
    'card.sync': 'Đồng bộ',
    
    // Search & Filter
    'search.placeholder': 'Tìm admin, email, hoặc tên team... (nhấn /)',
    'search.bulkSelect': 'Chọn nhiều',
    'search.cancel': 'Huỷ',
    'search.selectAll': 'Chọn tất cả',
    'search.selected': 'Đã chọn',
    'search.admins': 'admin',
    'search.delete': 'Xoá',
    
    // Empty state
    'empty.noAdmins': 'Không tìm thấy tài khoản admin',
    'empty.adjustSearch': 'Thử điều chỉnh tìm kiếm hoặc bộ lọc',
    'empty.addFirst': 'Thêm tài khoản admin đầu tiên để bắt đầu',
    
    // Notifications
    'notification.dataUpdated': 'Dữ liệu đã cập nhật',
    'notification.newChanges': 'Có thay đổi mới từ backend',
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
    
    // Stats
    'stats.totalAdmins': 'Total Admins',
    'stats.totalMembers': 'Total Members',
    'stats.teamsAtCapacity': 'Teams at Capacity',
    'stats.overCapacity': 'Over Capacity',
    
    // Tabs
    'tabs.admins': 'Admin Accounts',
    'tabs.users': 'All Users',
    'tabs.analytics': 'Analytics',
    'tabs.activity': 'Activity',
    
    // Admin Card
    'card.overLimit': 'Over Limit',
    'card.tokenValid': 'Token valid',
    'card.tokenError': 'Token error',
    'card.editAccount': 'Edit Account',
    'card.manageTeam': 'Manage Team',
    'card.triggerAutoDelete': 'Trigger Auto-Delete',
    'card.deleteAccount': 'Delete Account',
    'card.checked': 'Checked',
    'card.sync': 'Sync',
    
    // Search & Filter
    'search.placeholder': 'Search admins, emails, or team names... (press /)',
    'search.bulkSelect': 'Bulk Select',
    'search.cancel': 'Cancel',
    'search.selectAll': 'Select all',
    'search.selected': 'Selected',
    'search.admins': 'admin(s)',
    'search.delete': 'Delete',
    
    // Empty state
    'empty.noAdmins': 'No admin accounts found',
    'empty.adjustSearch': 'Try adjusting your search or filters',
    'empty.addFirst': 'Add your first admin account to get started',
    
    // Notifications
    'notification.dataUpdated': 'Data updated',
    'notification.newChanges': 'New changes from backend',
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
