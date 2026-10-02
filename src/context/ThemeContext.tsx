import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

interface ThemeContextValue {
  dark: boolean;
  toggleDark: () => void;
  largeText: boolean;
  toggleLargeText: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  dark: false,
  toggleDark: () => {},
  largeText: false,
  toggleLargeText: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [dark, setDark] = useState(() => {
    const stored = window.localStorage.getItem('agriya-theme');
    if (stored) return stored === 'dark';
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  });
  const [largeText, setLargeText] = useState(
    () => window.localStorage.getItem('agriya-large-text') === '1'
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    window.localStorage.setItem('agriya-theme', dark ? 'dark' : 'light');
  }, [dark]);

  useEffect(() => {
    document.documentElement.style.fontSize = largeText ? '18px' : '16px';
    window.localStorage.setItem('agriya-large-text', largeText ? '1' : '0');
  }, [largeText]);

  return (
    <ThemeContext.Provider
      value={{
        dark,
        toggleDark: () => setDark((d) => !d),
        largeText,
        toggleLargeText: () => setLargeText((t) => !t),
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
