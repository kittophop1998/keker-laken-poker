'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import { getCreature } from '../lib/creatures';
import { T } from '../theme';

type CardSize = 'sm' | 'md' | 'lg';

const SIZES: Record<CardSize, { w: number; h: number; art: number; name: string }> = {
  sm: { w: 62, h: 86, art: 38, name: '0.6rem' },
  md: { w: 94, h: 130, art: 60, name: '0.78rem' },
  lg: { w: 132, h: 184, art: 88, name: '0.95rem' },
};

interface Props {
  creature: string;
  size?: CardSize;
  selected?: boolean;
  disabled?: boolean;
  /** Small controlled rotation so hands read as placed by a person, not a printer. */
  tilt?: number;
  onClick?: () => void;
  /** Show the patterned back instead of the face. */
  faceDown?: boolean;
  ariaLabel?: string;
}

/**
 * A tactile creature card: cream paper face, visible thickness, hard contact
 * shadow. Hover lifts 8px and straightens; selected lifts 14px (DESIGN.md).
 */
export default function CreatureCard({
  creature,
  size = 'md',
  selected = false,
  disabled = false,
  tilt = 0,
  onClick,
  faceDown = false,
  ariaLabel,
}: Props) {
  const s = SIZES[size];
  const c = getCreature(creature);
  const interactive = Boolean(onClick) && !disabled;

  if (faceDown) {
    return (
      <Box
        aria-label={ariaLabel ?? 'การ์ดคว่ำ'}
        sx={{
          width: s.w,
          height: s.h,
          borderRadius: 'var(--r-card)',
          border: `2px solid ${T.woodDark}`,
          boxShadow: T.shCard,
          transform: `rotate(${tilt}deg)`,
          position: 'relative',
          overflow: 'hidden',
          bgcolor: '#3B3730',
          backgroundImage:
            'radial-gradient(circle at 30% 25%, rgba(217,164,65,0.16) 0 3px, transparent 3px),' +
            'radial-gradient(circle at 75% 62%, rgba(217,164,65,0.12) 0 3px, transparent 3px),' +
            'repeating-linear-gradient(45deg, rgba(255,249,238,0.05) 0 6px, transparent 6px 14px)',
          backgroundSize: '26px 26px, 34px 34px, auto',
          display: 'grid',
          placeItems: 'center',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/Cockroach.png"
          alt=""
          style={{
            width: s.art * 0.82,
            height: s.art * 0.82,
            objectFit: 'contain',
            opacity: 0.28,
            filter: 'brightness(0) saturate(100%) invert(84%) sepia(24%) saturate(700%) hue-rotate(348deg)',
          }}
        />
      </Box>
    );
  }

  return (
    <Box
      component={interactive ? 'button' : 'div'}
      type={interactive ? 'button' : undefined}
      onClick={interactive ? onClick : undefined}
      disabled={interactive ? false : undefined}
      aria-pressed={interactive ? selected : undefined}
      aria-label={ariaLabel ?? `${c.name} (${c.en})`}
      className="grain"
      sx={{
        width: s.w,
        height: s.h,
        p: 0.75,
        flexShrink: 0,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 'var(--r-card)',
        bgcolor: T.paper,
        border: `2px solid ${selected ? T.moss : T.stroke}`,
        boxShadow: selected ? T.shRaised : T.shCard,
        cursor: interactive ? 'pointer' : 'default',
        font: 'inherit',
        // A tiny top highlight reads as the card's cut edge.
        backgroundImage: `linear-gradient(180deg, rgba(255,255,255,0.7) 0 2px, transparent 2px), radial-gradient(circle at 50% 38%, ${c.tint}14 0%, transparent 62%)`,
        transform: selected ? 'translateY(-14px) rotate(0deg)' : `rotate(${tilt}deg)`,
        transition: 'transform 200ms var(--spring), box-shadow 200ms ease, border-color 160ms ease',
        opacity: disabled ? 0.55 : 1,
        filter: disabled ? 'saturate(0.5)' : 'none',
        '&:hover': interactive && !selected ? { transform: 'translateY(-8px) rotate(0deg)' } : undefined,
      }}
    >
      {/* Category symbol — a second, non-color identifier */}
      <Box
        sx={{
          alignSelf: 'flex-start',
          px: 0.7,
          py: 0.1,
          borderRadius: 'var(--r-pill)',
          bgcolor: `${c.tint}1F`,
          border: `1px solid ${c.tint}55`,
        }}
      >
        <Typography
          sx={{ fontSize: size === 'sm' ? '0.5rem' : '0.58rem', fontWeight: 800, color: c.tint, lineHeight: 1.6 }}
        >
          {c.category === 'สัตว์เลี้ยงลูกด้วยนม' ? 'MAM' : c.category === 'สัตว์ครึ่งบกครึ่งน้ำ' ? 'AMP' : c.category === 'แมง' ? 'ARA' : 'INS'}
        </Typography>
      </Box>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={c.image}
        alt=""
        style={{
          width: s.art,
          height: s.art,
          objectFit: 'contain',
          animation: selected ? 'wobble 0.7s ease-in-out infinite' : 'none',
        }}
      />

      <Typography
        sx={{
          fontFamily: 'var(--font-body)',
          fontSize: s.name,
          fontWeight: 800,
          color: T.charcoal,
          lineHeight: 1.2,
          textAlign: 'center',
          width: '100%',
        }}
      >
        {c.name}
      </Typography>

      {selected && (
        <Box
          sx={{
            position: 'absolute',
            top: -10,
            right: -10,
            width: 26,
            height: 26,
            borderRadius: '50%',
            bgcolor: T.moss,
            color: T.paper,
            display: 'grid',
            placeItems: 'center',
            boxShadow: '0 3px 0 rgba(75,97,45,1)',
            animation: 'tokenPop 260ms var(--spring)',
          }}
        >
          <CheckRoundedIcon sx={{ fontSize: 17 }} />
        </Box>
      )}
    </Box>
  );
}
