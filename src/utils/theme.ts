export type ThemeMode = 'light' | 'dark' | 'auto';

/**
 * Determines whether dark mode should be enabled based on time:
 * Default dark mode between 7:00 PM (19:00) and 6:59 AM (06:59)
 */
export function isDarkTime(date: Date = new Date()): boolean {
  const hours = date.getHours();
  return hours >= 19 || hours < 7;
}

export function getInitialTheme(): ThemeMode {
  const saved = localStorage.getItem('captain_haze_theme') as ThemeMode | null;
  if (saved && ['light', 'dark', 'auto'].includes(saved)) {
    return saved;
  }
  return 'auto';
}

export function applyTheme(mode: ThemeMode): boolean {
  const isDark = mode === 'dark' || (mode === 'auto' && isDarkTime());
  const root = document.documentElement;

  if (isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  localStorage.setItem('captain_haze_theme', mode);
  return isDark;
}
