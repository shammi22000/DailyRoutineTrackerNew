import React, { createContext, useContext, useState, useEffect } from 'react';
import { Appearance } from 'react-native';

// Create the context
const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const systemScheme = Appearance.getColorScheme();
  const [theme, setTheme] = useState(systemScheme || 'dark');

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
  
      if (!manualSwitchRef.current) {
        setTheme(colorScheme || 'dark');
      }
    });
    return () => subscription.remove();
  }, []);

  // Keep track if user manually switched
  const manualSwitchRef = React.useRef(false);

  const toggleTheme = () => {
    manualSwitchRef.current = true;
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const colors =
    theme === 'light'
      ? {
          background: '#F9FBFF',
          card: '#FFFFFF',
          text: '#b5de90ff',
          subtext: '#777777',
          primary: '#007AFF',
        }
      : {
          background: '#0D1117',
          card: '#161B22',
          text: '#FFFFFF',
          subtext: '#AAAAAA',
          primary: '#1E90FF',
        };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};


export const useTheme = () => useContext(ThemeContext);
