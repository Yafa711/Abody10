import React, { createContext, useContext } from 'react';
import Theme from './index';

// Create the theme context
const ThemeContext = createContext(null);

// Custom hook to use the theme
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Theme provider component
export const ThemeProvider = ({ children, themeName = 'dark' }) => {
  const themeValue = Theme[themeName] || Theme.dark;

  return (
    <ThemeContext.Provider value={themeValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;