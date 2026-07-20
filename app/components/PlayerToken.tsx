'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import WifiOffRoundedIcon from '@mui/icons-material/WifiOffRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import StyleRoundedIcon from '@mui/icons-material/StyleRounded';
import { creatureImage } from '../lib/creatures';
import { T, playerColor } from '../theme';

export interface TokenPlayer {
  id: string;
  name: string;
  handCount: number;
  deadCards: { animal: string }[];
  disconnected?: boolean;
}

interface Props {
  player: TokenPlayer;
  index: number;
  isMe: boolean;
  isActive: boolean;
  isHost: boolean;
  /** Renders as a selectable target during the send step. */
  selectable?: boolean;
  selected?: boolean;
  onSelect?: () => void;
  compact?: boolean;
}

/**
 * A painted wooden player piece. The active player gets a spotlight, a scale
 * bump, and a stronger color outline (DESIGN.md → Player Token).
 */
export default function PlayerToken({
  player,
  index,
  isMe,
  isActive,
  isHost,
  selectable = false,
  selected = false,
  onSelect,
  compact = false,
}: Props) {
  const color = playerColor(index);

  const tally = new Map<string, number>();
  player.deadCards.forEach((c) => tally.set(c.animal, (tally.get(c.animal) ?? 0) + 1));
  const counts = [...tally.values()];
  const hasFour = counts.some((n) => n >= 4);
  const nearFour = counts.some((n) => n === 3);
  const uniqueCount = tally.size;

  return (
    <Box
      component={selectable ? 'button' : 'div'}
      type={selectable ? 'button' : undefined}
      onClick={selectable ? onSelect : undefined}
      aria-pressed={selectable ? selected : undefined}
      aria-label={
        `ผู้เล่นคนที่ ${index + 1} ${player.name}` +
        `${isActive ? ' กำลังถึงตา' : ''}${player.disconnected ? ' หลุดการเชื่อมต่อ' : ''}` +
        ` ไพ่ในมือ ${player.handCount} ใบ ไพ่หงายหน้า ${player.deadCards.length} ใบ`
      }
      className="grain"
      sx={{
        position: 'relative',
        width: '100%',
        textAlign: 'left',
        font: 'inherit',
        p: compact ? 1.25 : 1.5,
        borderRadius: 'var(--r-md)',
        bgcolor: T.paper,
        border: `2px solid ${selected ? T.mustard : isActive ? color : T.stroke}`,
        boxShadow: isActive || selected ? T.shRaised : T.shCard,
        transform: isActive ? 'scale(1.03)' : 'scale(1)',
        transition: 'transform 300ms var(--spring), box-shadow 300ms ease, border-color 200ms ease',
        cursor: selectable ? 'pointer' : 'default',
        opacity: player.disconnected ? 0.62 : 1,
        animation: nearFour && !hasFour ? 'dangerPulse 1.8s ease-in-out infinite' : undefined,
        '&:hover': selectable ? { transform: 'translateY(-3px) scale(1.02)' } : undefined,
      }}
    >
      {/* Directional spotlight for the player whose turn it is */}
      {isActive && (
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            inset: -2,
            borderRadius: 'var(--r-md)',
            pointerEvents: 'none',
            background: `radial-gradient(120% 90% at 50% -10%, ${color}2E 0%, transparent 62%)`,
            animation: 'spotlight 2.4s ease-in-out infinite',
          }}
        />
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, position: 'relative' }}>
        {/* Avatar: creature miniature on a painted disc, plus the seat number */}
        <Box
          sx={{
            position: 'relative',
            width: compact ? 40 : 46,
            height: compact ? 40 : 46,
            flexShrink: 0,
            borderRadius: '50%',
            bgcolor: `${color}26`,
            border: `2px solid ${color}`,
            display: 'grid',
            placeItems: 'center',
            boxShadow: 'var(--sh-inset)',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={creatureImage(['แมลงสาบ', 'หนู', 'แมงมุม', 'กบ', 'ค้างคาว', 'แมงป่อง'][index % 6])}
            alt=""
            style={{ width: compact ? 24 : 28, height: compact ? 24 : 28, objectFit: 'contain' }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: -5,
              right: -5,
              width: 19,
              height: 19,
              borderRadius: '50%',
              bgcolor: color,
              color: T.paper,
              display: 'grid',
              placeItems: 'center',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.65rem',
              fontWeight: 700,
              border: `2px solid ${T.paper}`,
            }}
          >
            {index + 1}
          </Box>
        </Box>

        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography
              sx={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: compact ? '0.9rem' : '1rem',
                color: T.charcoal,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {player.name}
            </Typography>
            {isHost && (
              <Tooltip title="หัวหน้าห้อง">
                <WorkspacePremiumRoundedIcon sx={{ fontSize: 16, color: T.mustard, flexShrink: 0 }} />
              </Tooltip>
            )}
            {player.disconnected && (
              <Tooltip title="หลุดการเชื่อมต่อ กำลังรอกลับเข้ามา">
                <WifiOffRoundedIcon sx={{ fontSize: 15, color: T.accuse, flexShrink: 0 }} />
              </Tooltip>
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.15 }}>
            {isMe && (
              <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: T.moss, letterSpacing: '0.06em' }}>
                คุณ
              </Typography>
            )}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
              <StyleRoundedIcon sx={{ fontSize: 14, color: T.taupe }} />
              <Typography sx={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600, color: T.taupe }}>
                {player.handCount}
              </Typography>
            </Box>
            {isActive && (
              <Typography
                sx={{
                  fontSize: '0.66rem',
                  fontWeight: 800,
                  color: T.paper,
                  bgcolor: color,
                  px: 0.85,
                  borderRadius: 'var(--r-pill)',
                  letterSpacing: '0.05em',
                }}
              >
                ตานี้
              </Typography>
            )}
          </Box>
        </Box>
      </Box>

      {/* Face-up pile, grouped by creature. Three is a warning, four is a loss. */}
      {player.deadCards.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6, mt: 1.25 }}>
          {[...tally.entries()].map(([animal, count]) => {
            const danger = count >= 4;
            const warn = count === 3;
            return (
              <Tooltip key={animal} title={`${animal} ${count} ใบ`} placement="top">
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.25,
                    pl: 0.3,
                    pr: 0.6,
                    py: 0.25,
                    borderRadius: 'var(--r-pill)',
                    bgcolor: danger ? 'rgba(184,74,58,0.14)' : warn ? 'rgba(217,130,75,0.16)' : 'rgba(48,46,40,0.05)',
                    border: `1.5px solid ${danger ? T.accuse : warn ? T.burnt : 'transparent'}`,
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={creatureImage(animal)} alt="" style={{ width: 20, height: 20, objectFit: 'contain' }} />
                  <Typography
                    sx={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      color: danger ? T.accuse : warn ? '#A55A24' : T.taupe,
                    }}
                  >
                    {count}
                  </Typography>
                </Box>
              </Tooltip>
            );
          })}
        </Box>
      )}

      {(hasFour || nearFour || uniqueCount >= 7) && (
        <Box
          sx={{
            mt: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            px: 1,
            py: 0.6,
            borderRadius: 'var(--r-sm)',
            bgcolor: hasFour ? 'rgba(184,74,58,0.12)' : 'rgba(217,130,75,0.14)',
          }}
        >
          <WarningAmberRoundedIcon sx={{ fontSize: 16, color: hasFour ? T.accuse : '#A55A24' }} />
          <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: hasFour ? T.accuse : '#A55A24' }}>
            {hasFour
              ? 'ครบ 4 ใบชนิดเดียวกัน — แพ้แล้ว'
              : nearFour
              ? 'อีกใบเดียวครบ 4'
              : `สะสมแล้ว ${uniqueCount} ชนิด (ครบ 8 ก็แพ้)`}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
