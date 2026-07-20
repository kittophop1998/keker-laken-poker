'use client';

import { useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ScrollTextIcon from '@mui/icons-material/ReceiptLongRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import GavelRoundedIcon from '@mui/icons-material/GavelRounded';
import TheaterComedyRoundedIcon from '@mui/icons-material/TheaterComedyRounded';
import FlagRoundedIcon from '@mui/icons-material/FlagRounded';
import { creatureImage } from '../lib/creatures';
import { T } from '../theme';

export type LogType = 'send' | 'challenge' | 'gameOver' | 'emote';

export interface LogEntry {
  id: number;
  type: LogType;
  message: string;
  timestamp: Date;
  /** Creature icon shown on the event card, when the event has one. */
  creature?: string;
  /** Correct / incorrect marker — paired with an icon, never color alone. */
  result?: 'correct' | 'incorrect';
}

const META: Record<LogType, { color: string; Icon: typeof SendRoundedIcon }> = {
  send: { color: T.moss, Icon: SendRoundedIcon },
  challenge: { color: T.burnt, Icon: GavelRoundedIcon },
  gameOver: { color: T.accuse, Icon: FlagRoundedIcon },
  emote: { color: T.wood, Icon: TheaterComedyRoundedIcon },
};

/** The log reads as a stack of small event cards, not a console dump. */
export default function GameLog({ entries, maxHeight = '38vh' }: { entries: LogEntry[]; maxHeight?: number | string }) {
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = boxRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [entries]);

  return (
    <Box
      className="grain"
      sx={{
        p: 1.75,
        borderRadius: 'var(--r-card)',
        bgcolor: T.paper,
        border: `2px solid ${T.stroke}`,
        boxShadow: T.shCard,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <ScrollTextIcon sx={{ fontSize: 19, color: T.wood }} />
        <Typography sx={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: T.taupe }}>
          บันทึกการเล่น
        </Typography>
      </Box>

      <Box
        ref={boxRef}
        role="log"
        sx={{
          maxHeight,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          pr: 0.5,
          '&::-webkit-scrollbar': { width: 5 },
          '&::-webkit-scrollbar-track': { bgcolor: 'rgba(48,46,40,0.05)', borderRadius: 3 },
          '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(123,90,62,0.35)', borderRadius: 3 },
        }}
      >
        {entries.length === 0 ? (
          <Typography sx={{ color: T.taupe, textAlign: 'center', py: 3, fontSize: '0.85rem' }}>
            ยังไม่มีใครโกหกใคร เดี๋ยวก็มี
          </Typography>
        ) : (
          entries.map((e) => {
            const { color, Icon } = META[e.type];
            return (
              <Box
                key={e.id}
                sx={{
                  display: 'flex',
                  gap: 1,
                  p: 1,
                  borderRadius: 'var(--r-sm)',
                  bgcolor: `${color}12`,
                  borderLeft: `4px solid ${color}`,
                  animation: 'placeIn 260ms var(--ease-out)',
                }}
              >
                <Icon sx={{ fontSize: 17, color, flexShrink: 0, mt: 0.2 }} />
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography sx={{ fontSize: '0.8rem', lineHeight: 1.45, color: T.charcoal, wordBreak: 'break-word' }}>
                    {e.message}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.4 }}>
                    <Typography sx={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: T.taupe }}>
                      {e.timestamp.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                    {e.result && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                        {e.result === 'correct' ? (
                          <CheckCircleRoundedIcon sx={{ fontSize: 13, color: T.leaf }} />
                        ) : (
                          <CancelRoundedIcon sx={{ fontSize: 13, color: T.accuse }} />
                        )}
                        <Typography sx={{ fontSize: '0.63rem', fontWeight: 700, color: e.result === 'correct' ? T.leaf : T.accuse }}>
                          {e.result === 'correct' ? 'ทายถูก' : 'ทายผิด'}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
                {e.creature && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={creatureImage(e.creature)} alt="" style={{ width: 26, height: 26, objectFit: 'contain', flexShrink: 0 }} />
                )}
              </Box>
            );
          })
        )}
      </Box>
    </Box>
  );
}
