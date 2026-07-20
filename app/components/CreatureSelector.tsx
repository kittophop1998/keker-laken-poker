'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import { CREATURES } from '../lib/creatures';
import { T } from '../theme';

interface Props {
  value: string;
  onChange: (name: string) => void;
}

/**
 * Illustrated chips instead of a dropdown — the claim is the most important
 * decision in the game and deserves to look like picking up a game piece.
 */
export default function CreatureSelector({ value, onChange }: Props) {
  return (
    <Box
      role="radiogroup"
      aria-label="เลือกสัตว์ที่จะอ้าง"
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
        gap: 1,
      }}
    >
      {CREATURES.map((c) => {
        const selected = value === c.name;
        return (
          <Box
            key={c.name}
            component="button"
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(c.name)}
            sx={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
              px: 1,
              py: 0.9,
              minHeight: 48,
              font: 'inherit',
              cursor: 'pointer',
              textAlign: 'left',
              borderRadius: 'var(--r-sm)',
              bgcolor: selected ? `${c.tint}1A` : T.paper,
              border: `2px solid ${selected ? c.tint : T.stroke}`,
              boxShadow: selected ? `0 4px 0 ${c.tint}66` : '0 3px 0 rgba(80,58,38,0.12)',
              transform: selected ? 'translateY(-2px)' : 'none',
              transition: 'transform 160ms var(--spring), box-shadow 160ms ease, border-color 160ms ease',
              '&:hover': { transform: 'translateY(-2px)' },
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={c.image} alt="" style={{ width: 30, height: 30, objectFit: 'contain', flexShrink: 0 }} />
            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: T.charcoal,
                  lineHeight: 1.15,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {c.name}
              </Typography>
              <Typography sx={{ fontSize: '0.6rem', color: T.taupe, lineHeight: 1.2 }}>{c.en}</Typography>
            </Box>
            {selected && (
              <CheckRoundedIcon
                sx={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  fontSize: 15,
                  p: '2px',
                  borderRadius: '50%',
                  bgcolor: c.tint,
                  color: T.paper,
                  border: `2px solid ${T.paper}`,
                  animation: 'tokenPop 240ms var(--spring)',
                }}
              />
            )}
          </Box>
        );
      })}
    </Box>
  );
}
