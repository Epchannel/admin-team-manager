import { useEffect, useCallback } from 'react';

interface ShortcutHandlers {
  onSyncAll?: () => void;
  onAddAdmin?: () => void;
  onSearch?: () => void;
  onQuickAdd?: () => void;
  onEscape?: () => void;
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Ignore if user is typing in an input field
    const target = event.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      // Only handle Escape in inputs
      if (event.key === 'Escape' && handlers.onEscape) {
        handlers.onEscape();
      }
      return;
    }

    // Check for modifier keys
    const hasModifier = event.ctrlKey || event.metaKey || event.altKey;

    switch (event.key.toLowerCase()) {
      case 's':
        if (!hasModifier && handlers.onSyncAll) {
          event.preventDefault();
          handlers.onSyncAll();
        }
        break;
      case 'n':
        if (!hasModifier && handlers.onAddAdmin) {
          event.preventDefault();
          handlers.onAddAdmin();
        }
        break;
      case '/':
        if (!hasModifier && handlers.onSearch) {
          event.preventDefault();
          handlers.onSearch();
        }
        break;
      case 'q':
        if (!hasModifier && handlers.onQuickAdd) {
          event.preventDefault();
          handlers.onQuickAdd();
        }
        break;
      case 'escape':
        if (handlers.onEscape) {
          handlers.onEscape();
        }
        break;
    }
  }, [handlers]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

// Keyboard shortcuts info for display
export const KEYBOARD_SHORTCUTS = [
  { key: 'S', description: 'Sync tất cả admin' },
  { key: 'N', description: 'Thêm admin mới' },
  { key: 'Q', description: 'Quick Add users' },
  { key: '/', description: 'Tìm kiếm' },
  { key: 'Esc', description: 'Đóng modal/dialog' },
];
