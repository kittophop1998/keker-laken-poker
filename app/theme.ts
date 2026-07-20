'use client';
import { createTheme } from '@mui/material/styles';

// ── Cockroach Table palette (DESIGN.md) ────────────────────────
// Moss Green #5F7A3A · Mustard Gold #D9A441 · Burnt Orange #D9824B
// Accusation Red #B84A3A · Leaf Green #6B8E5A · Paper Cream #FFF9EE
// Table Beige #F3E9D7 · Charcoal Brown #302E28 · Wood Brown #7B5A3E

export const T = {
  moss: '#5F7A3A',
  mossDark: '#4B612D',
  mustard: '#D9A441',
  burnt: '#D9824B',
  accuse: '#B84A3A',
  accuseDark: '#9C3C2E',
  leaf: '#6B8E5A',
  paper: '#FFF9EE',
  table: '#F3E9D7',
  charcoal: '#302E28',
  taupe: '#756E62',
  wood: '#7B5A3E',
  woodDark: '#5C4230',
  stroke: '#CFC0A8',
  shCard: '0 6px 0 rgba(80, 58, 38, 0.18), 0 12px 26px rgba(48, 46, 40, 0.12)',
  shRaised: '0 10px 0 rgba(80, 58, 38, 0.16), 0 18px 36px rgba(48, 46, 40, 0.18)',
  shInset: 'inset 0 2px 4px rgba(48, 46, 40, 0.12)',
} as const;

/** Player colors — always paired with a number or avatar, never used alone. */
export const PLAYER_COLORS = ['#5F7A3A', '#C66B43', '#4D7D91', '#A35D78', '#B58A32', '#74649A'];
export const playerColor = (index: number) => PLAYER_COLORS[index % PLAYER_COLORS.length];

const display = 'var(--font-display)';
const body = 'var(--font-body)';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: T.moss, dark: T.mossDark, light: '#7A9750', contrastText: T.paper },
    secondary: { main: T.mustard, dark: '#BE8C2E', contrastText: T.charcoal },
    error: { main: T.accuse, dark: T.accuseDark, contrastText: T.paper },
    warning: { main: T.burnt, contrastText: T.paper },
    success: { main: T.leaf, contrastText: T.paper },
    info: { main: T.wood, contrastText: T.paper },
    background: { default: T.table, paper: T.paper },
    text: { primary: T.charcoal, secondary: T.taupe },
    divider: T.stroke,
  },
  typography: {
    fontFamily: body,
    h1: { fontFamily: display, fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.01em' },
    h2: { fontFamily: display, fontSize: '1.75rem', fontWeight: 700 },
    h3: { fontFamily: display, fontSize: '1.25rem', fontWeight: 700 },
    h4: { fontFamily: display, fontWeight: 700 },
    h5: { fontFamily: display, fontWeight: 700 },
    h6: { fontFamily: display, fontWeight: 600 },
    body1: { fontSize: '1rem', lineHeight: 1.6 },
    body2: { fontSize: '0.875rem', lineHeight: 1.6 },
    button: { fontFamily: body, fontWeight: 700 },
    caption: { fontSize: '0.75rem' },
    overline: {
      fontFamily: body,
      fontSize: '0.75rem',
      fontWeight: 700,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
    },
  },
  shape: { borderRadius: 18 },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 700,
          borderRadius: 'var(--r-pill)',
          padding: '14px 22px',
          minHeight: 44,
          transition: 'transform 160ms var(--spring), box-shadow 160ms ease, background-color 160ms ease',
        },
        // Wooden buttons have visible thickness; the shadow compresses on press.
        containedPrimary: {
          backgroundColor: T.moss,
          color: T.paper,
          boxShadow: `0 5px 0 ${T.mossDark}`,
          '&:hover': { backgroundColor: '#6B8842', boxShadow: `0 7px 0 ${T.mossDark}`, transform: 'translateY(-2px)' },
          '&:active': { boxShadow: `0 2px 0 ${T.mossDark}`, transform: 'translateY(2px)' },
          '&.Mui-disabled': { backgroundColor: '#B9B1A0', color: T.paper, boxShadow: '0 5px 0 #9C9484' },
        },
        containedSecondary: {
          backgroundColor: T.mustard,
          color: T.charcoal,
          boxShadow: '0 5px 0 #A9771F',
          '&:hover': { backgroundColor: '#E3B155', boxShadow: '0 7px 0 #A9771F', transform: 'translateY(-2px)' },
          '&:active': { boxShadow: '0 2px 0 #A9771F', transform: 'translateY(2px)' },
        },
        containedError: {
          backgroundColor: T.accuse,
          color: T.paper,
          boxShadow: `0 6px 0 ${T.accuseDark}`,
          '&:hover': { backgroundColor: '#C6543F', boxShadow: `0 8px 0 ${T.accuseDark}`, transform: 'translateY(-2px)' },
          '&:active': { boxShadow: `0 2px 0 ${T.accuseDark}`, transform: 'translateY(2px)' },
        },
        containedSuccess: {
          backgroundColor: T.leaf,
          color: T.paper,
          boxShadow: '0 6px 0 #527043',
          '&:hover': { backgroundColor: '#799C67', boxShadow: '0 8px 0 #527043', transform: 'translateY(-2px)' },
          '&:active': { boxShadow: '0 2px 0 #527043', transform: 'translateY(2px)' },
        },
        outlined: {
          backgroundColor: T.paper,
          borderWidth: 2,
          borderColor: T.wood,
          color: T.charcoal,
          '&:hover': { borderWidth: 2, borderColor: T.wood, backgroundColor: '#F0E3CD' },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: T.paper,
          borderRadius: 'var(--r-card)',
          border: `2px solid ${T.stroke}`,
          boxShadow: T.shCard,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 'var(--r-sm)',
            backgroundColor: T.paper,
            minHeight: 52,
            '& fieldset': { borderColor: T.wood, borderWidth: 2 },
            '&:hover fieldset': { borderColor: T.wood },
            '&.Mui-focused fieldset': { borderColor: T.moss, borderWidth: 3 },
          },
          '& .MuiInputLabel-root': { color: T.taupe, fontWeight: 600 },
          '& .MuiInputLabel-root.Mui-focused': { color: T.mossDark },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontFamily: body, fontWeight: 700, borderRadius: 'var(--r-pill)' },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 'var(--r-sm)', border: `2px solid ${T.stroke}`, fontWeight: 600 },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: T.charcoal,
          color: T.paper,
          fontFamily: body,
          fontSize: '0.8rem',
          fontWeight: 600,
          borderRadius: 'var(--r-sm)',
          padding: '8px 12px',
        },
        arrow: { color: T.charcoal },
      },
    },
  },
});

export default theme;
