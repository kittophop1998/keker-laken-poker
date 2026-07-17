'use client';
import { createTheme } from '@mui/material/styles';

// ── Mini World palette (DESIGN.md) ─────────────────────────────
// Grass Green #7CB342 · Sky Blue #42A5F5 · Warm Sand #FFCC80
// Brick Red #E57373 · Soft White #FAFAFA · Stone Grey #9E9E9E
// Water Blue #29B6F6 · Wood Brown #8D6E63
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#7CB342',
      dark: '#689F38',
      light: '#9CCC65',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#42A5F5',
      dark: '#1E88E5',
      contrastText: '#ffffff',
    },
    error: {
      main: '#E57373',
    },
    warning: {
      main: '#FFCC80',
      contrastText: '#5D4037',
    },
    success: {
      main: '#7CB342',
    },
    info: {
      main: '#29B6F6',
    },
    background: {
      default: '#FAFAFA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#37474F',
      secondary: '#78909C',
    },
    divider: 'rgba(55,71,79,0.1)',
  },
  typography: {
    fontFamily: "'Kanit', 'Arial', sans-serif",
    h1: { fontWeight: 700, letterSpacing: '-0.02em' },
    h2: { fontWeight: 700, letterSpacing: '-0.01em' },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
    button: { fontWeight: 600 },
    caption: { letterSpacing: '0.04em' },
  },
  shape: {
    borderRadius: 24,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: '1.5rem',
          boxShadow: 'none',
          transition: 'transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 200ms ease, background-color 200ms ease',
          '&:active': {
            transform: 'translateY(1px)',
          },
        },
        containedPrimary: {
          backgroundColor: '#7CB342',
          '&:hover': {
            backgroundColor: '#6FA23B',
            boxShadow: '0 6px 16px rgba(124,179,66,0.35)',
            transform: 'translateY(-2px)',
          },
        },
        containedSecondary: {
          backgroundColor: '#42A5F5',
          '&:hover': {
            backgroundColor: '#3B95DD',
            boxShadow: '0 6px 16px rgba(66,165,245,0.35)',
            transform: 'translateY(-2px)',
          },
        },
        outlined: {
          borderWidth: '1.5px',
          '&:hover': { borderWidth: '1.5px' },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: '1.5rem',
          border: '1px solid rgba(55,71,79,0.08)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '1rem',
            backgroundColor: '#FFFFFF',
            '& fieldset': { borderColor: 'rgba(55,71,79,0.2)' },
            '&:hover fieldset': { borderColor: '#7CB342' },
            '&.Mui-focused fieldset': { borderColor: '#7CB342', borderWidth: 2 },
          },
          '& .MuiInputLabel-root.Mui-focused': { color: '#689F38' },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontFamily: "'Kanit', 'Arial', sans-serif",
          fontWeight: 600,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: '1rem',
        },
      },
    },
  },
});

export default theme;
