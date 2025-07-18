'use client';

import { createTheme, ThemeProvider as MUIThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { createContext, useContext, useState, useEffect } from 'react';

// Contexto para controlar o tema
const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  }
  return context;
};

// Tema escuro (padrão)
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6366f1', // Indigo suave
      light: '#818cf8',
      dark: '#4f46e5',
    },
    secondary: {
      main: '#f59e0b', // Amber para contraste
      light: '#fbbf24',
      dark: '#d97706',
    },
    background: {
      default: '#0f0f23', // Azul muito escuro
      paper: '#1a1a2e', // Azul escuro para cards
    },
    text: {
      primary: '#e2e8f0', // Cinza muito claro
      secondary: '#94a3b8', // Cinza médio
    },
    success: {
      main: '#10b981',
    },
    info: {
      main: '#3b82f6',
    },
    warning: {
      main: '#f59e0b',
    },
    error: {
      main: '#ef4444',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 300,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontWeight: 300,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontWeight: 400,
    },
    h4: {
      fontWeight: 400,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
    body1: {
      lineHeight: 1.6,
    },
    body2: {
      lineHeight: 1.5,
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 12,
          fontWeight: 500,
          padding: '8px 20px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: 20,
          border: '1px solid rgba(99, 102, 241, 0.1)',
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(26, 26, 46, 0.8)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 32px rgba(99, 102, 241, 0.2)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            transform: 'scale(1.05)',
          },
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        root: {
          '& .MuiSlider-thumb': {
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              boxShadow: '0 0 0 8px rgba(99, 102, 241, 0.16)',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
      },
    },
  },
});

// Tema claro (alternativo)
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#6366f1',
      light: '#818cf8',
      dark: '#4f46e5',
    },
    secondary: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#1e293b',
      secondary: '#475569',
    },
  },
  typography: darkTheme.typography,
  shape: darkTheme.shape,
  components: {
    ...darkTheme.components,
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: 20,
          border: '1px solid rgba(99, 102, 241, 0.1)',
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 32px rgba(99, 102, 241, 0.15)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
          },
        },
      },
    },
  },
});

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(true); // Dark mode por padrão
  const [mounted, setMounted] = useState(false);

  // Marcar como montado no cliente
  useEffect(() => {
    setMounted(true);
  }, []);

  // Carregar preferência do tema do localStorage
  useEffect(() => {
    if (mounted && typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('lofivora-theme');
      if (savedTheme) {
        setIsDarkMode(savedTheme === 'dark');
      }
    }
  }, [mounted]);

  // Salvar preferência do tema no localStorage
  useEffect(() => {
    if (mounted && typeof window !== 'undefined') {
      localStorage.setItem('lofivora-theme', isDarkMode ? 'dark' : 'light');
    }
  }, [isDarkMode, mounted]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const currentTheme = isDarkMode ? darkTheme : lightTheme;

  const value = {
    isDarkMode,
    toggleTheme,
    theme: currentTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      <MUIThemeProvider theme={currentTheme}>
        <CssBaseline />
        {children}
      </MUIThemeProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
