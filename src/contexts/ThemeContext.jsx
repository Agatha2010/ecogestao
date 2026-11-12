import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(() => {
    // Lê a preferência salva no navegador
    const saved = localStorage.getItem('dark_mode');
    return saved === 'true';
  });

  useEffect(() => {
    // Aplica a classe no body toda vez que o tema muda
    if (darkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('dark_mode', 'true');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('dark_mode', 'false');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme precisa estar dentro de <ThemeProvider>');
  return ctx;
}