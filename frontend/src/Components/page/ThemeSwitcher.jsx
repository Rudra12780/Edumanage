import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../ThemeContext';

const ThemeSwitcher = () => {
  const { toggleTheme, isDark } = useTheme();

  return (
    <button 
      className="em-theme-toggle-btn"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className="em-theme-toggle-icon">
        {isDark ? (
          <Sun size={17} strokeWidth={2} />
        ) : (
          <Moon size={17} strokeWidth={2} />
        )}
      </span>
    </button>
  );
};

export default ThemeSwitcher;
