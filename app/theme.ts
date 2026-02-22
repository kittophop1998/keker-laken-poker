'use client';
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#FFD700',
      contrastText: '#1a1a1a',
    },
    secondary: {
      main: '#FF8C00',
      contrastText: '#ffffff',
    },
    error: {
      main: '#ff6b6b',
    },
    success: {
      main: '#51cf66',
    },
    background: {
      default: '#1a1a1a',
      paper: '#27272a',
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255,255,255,0.7)',
    },
  },
  typography: {
    fontFamily: "'Kanit', 'Arial', sans-serif",
    h1: { fontWeight: 900 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 600 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 700,
          fontFamily: "'Kanit', 'Arial', sans-serif",
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #FFD700 0%, #FF8C00 100%)',
          color: '#1a1a1a',
          '&:hover': {
            background: 'linear-gradient(135deg, #ffe033 0%, #ffa030 100%)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            color: '#fff',
            '& fieldset': { borderColor: 'rgba(255,215,0,0.4)' },
            '&:hover fieldset': { borderColor: '#FFD700' },
            '&.Mui-focused fieldset': { borderColor: '#FFD700' },
          },
          '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
          '& .MuiInputLabel-root.Mui-focused': { color: '#FFD700' },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: 'rgba(39,39,42,0.85)',
          backdropFilter: 'blur(10px)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontFamily: "'Kanit', 'Arial', sans-serif",
        },
      },
    },
  },
});

export default theme;
