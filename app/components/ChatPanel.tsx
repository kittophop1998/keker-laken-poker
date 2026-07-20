'use client';

import { useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import ForumRoundedIcon from '@mui/icons-material/ForumRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import { T } from '../theme';

export interface ChatMessage {
  id: string;
  from: string;
  fromId: string;
  text: string;
  timestamp: number;
}

interface Props {
  messages: ChatMessage[];
  myId: string;
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  height?: number;
}

/** Room chat — a pinned notepad beside the table. Cleared when a game ends. */
export default function ChatPanel({ messages, myId, value, onChange, onSend, height = 200 }: Props) {
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = boxRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages]);

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
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.25 }}>
        <ForumRoundedIcon sx={{ fontSize: 19, color: T.wood }} />
        <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: T.taupe }}>
          คุยกันในห้อง
        </Typography>
      </Box>

      <Box
        ref={boxRef}
        sx={{
          height,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 0.75,
          mb: 1.25,
          pr: 0.5,
          '&::-webkit-scrollbar': { width: 5 },
          '&::-webkit-scrollbar-track': { bgcolor: 'rgba(48,46,40,0.05)', borderRadius: 3 },
          '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(123,90,62,0.35)', borderRadius: 3 },
        }}
      >
        {messages.length === 0 ? (
          <Typography sx={{ color: T.taupe, textAlign: 'center', py: 3, fontSize: '0.85rem' }}>
            ยังไม่มีข้อความ ทักไปเลย อย่าอาย
          </Typography>
        ) : (
          messages.map((msg) => {
            const mine = msg.fromId === myId;
            return (
              <Box key={msg.id} sx={{ alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: '88%' }}>
                <Box
                  sx={{
                    px: 1.25,
                    py: 0.75,
                    borderRadius: mine ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                    bgcolor: mine ? 'rgba(95,122,58,0.14)' : 'rgba(48,46,40,0.05)',
                    border: `1.5px solid ${mine ? 'rgba(95,122,58,0.4)' : T.stroke}`,
                  }}
                >
                  {!mine && (
                    <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: T.wood, display: 'block' }}>
                      {msg.from}
                    </Typography>
                  )}
                  <Typography sx={{ fontSize: '0.85rem', wordBreak: 'break-word', color: T.charcoal }}>
                    {msg.text}
                  </Typography>
                </Box>
              </Box>
            );
          })
        )}
      </Box>

      <Box sx={{ display: 'flex', gap: 0.75 }}>
        <TextField
          size="small"
          fullWidth
          placeholder="พิมพ์ข้อความ"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
          slotProps={{ htmlInput: { maxLength: 200 } }}
          sx={{ '& .MuiOutlinedInput-root': { minHeight: 44 } }}
        />
        <IconButton
          onClick={onSend}
          disabled={!value.trim()}
          aria-label="ส่งข้อความ"
          sx={{
            width: 44,
            height: 44,
            flexShrink: 0,
            bgcolor: T.moss,
            color: T.paper,
            borderRadius: 'var(--r-sm)',
            boxShadow: '0 3px 0 #4B612D',
            '&:hover': { bgcolor: '#6B8842' },
            '&:active': { transform: 'translateY(2px)', boxShadow: '0 1px 0 #4B612D' },
            '&.Mui-disabled': { bgcolor: '#D8CDB8', color: T.paper, boxShadow: 'none' },
          }}
        >
          <SendRoundedIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
}
