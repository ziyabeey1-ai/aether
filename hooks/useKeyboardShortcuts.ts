import { useEffect } from 'react';

interface ShortcutConfig {
  [key: string]: () => void;
}

export const useKeyboardShortcuts = (shortcuts: ShortcutConfig) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modKey = isMac ? e.metaKey : e.ctrlKey;

      // Build key combination string
      let combo = '';
      if (modKey) combo += 'mod+';
      if (e.shiftKey) combo += 'shift+';
      if (e.altKey) combo += 'alt+';
      combo += e.key.toLowerCase();

      // Execute matching shortcut
      if (shortcuts[combo]) {
        e.preventDefault();
        shortcuts[combo]();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};