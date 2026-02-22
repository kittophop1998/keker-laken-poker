'use client';

import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';

const CREATURES = [
  { emoji: '🪳', name: 'Cockroach' },
  { emoji: '🦇', name: 'Bat' },
  { emoji: '🕷️', name: 'Spider' },
  { emoji: '🐸', name: 'Toad' },
  { emoji: '🦂', name: 'Scorpion' },
  { emoji: '🐍', name: 'Snake' },
  { emoji: '🦟', name: 'Fly' },
  { emoji: '🐀', name: 'Rat' },
];

const STATS = [
  { label: 'ผู้เล่น', value: '2 – 6 คน' },
  { label: 'เวลาเล่น', value: '20 นาที' },
  { label: 'อายุ', value: '8 ปีขึ้นไป' },
  { label: 'ความยาก', value: '⭐' },
];

const HOW_TO_PLAY = [
  { step: '1', title: 'ส่งการ์ด', desc: 'เลือกการ์ด 1 ใบ วางคว่ำส่งให้เพื่อน แล้วบอกว่ามันคือตัวอะไร (จะพูดจริงหรือโกหกก็ได้!)' },
  { step: '2', title: 'ตัดสินใจ', desc: 'เพื่อนจะเลือก "เชื่อ/ไม่เชื่อ" หรือจะ "ขอดูแล้วส่งต่อ" ให้คนถัดไปก็ได้' },
  { step: '3', title: 'รับกรรม', desc: 'ถ้าทายผิด ต้องรับการ์ดใบนั้นไปวางหงายหน้าตัวเอง ใครครบ 4 ใบเป็นผู้แพ้เพียงคนเดียว' },
];

export default function Home() {
  const router = useRouter();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#1a1a1a',
        color: '#fff',
        fontFamily: "'Kanit', sans-serif",
      }}
    >
      {/* ── NAV ── */}
      <Box
        component="nav"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: { xs: 3, md: 8 },
          py: 3,
          bgcolor: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(12px)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <Typography
          variant="h6"
          fontWeight={900}
          letterSpacing={2}
          sx={{ color: '#FFD700', textTransform: 'uppercase' }}
        >
          🪳 Kaker Laken
        </Typography>
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 4, alignItems: 'center' }}>
          {['เกี่ยวกับเกม', 'วิธีเล่น', 'การ์ดทั้งหมด'].map((t) => (
            <Typography
              key={t}
              variant="body2"
              fontWeight={600}
              sx={{
                textTransform: 'uppercase',
                letterSpacing: 1.5,
                cursor: 'pointer',
                '&:hover': { color: '#FFD700' },
                transition: 'color 0.2s',
              }}
            >
              {t}
            </Typography>
          ))}
          <Button
            variant="contained"
            size="small"
            onClick={() => router.push('/game')}
            sx={{
              borderRadius: 20,
              px: 3,
              fontWeight: 700,
              background: 'linear-gradient(135deg, #FFD700 0%, #FF8C00 100%)',
              color: '#1a1a1a',
            }}
          >
            เล่นเลย
          </Button>
        </Box>
      </Box>

      {/* ── HERO ── */}
      <Box
        sx={{
          background: 'linear-gradient(180deg, #FFD700 0%, #FF8C00 100%)',
          color: '#1a1a1a',
          py: { xs: 12, md: 18 },
          px: { xs: 3, md: 8 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={8} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '3.5rem', md: '6rem' },
                  fontWeight: 900,
                  lineHeight: 1,
                  textTransform: 'uppercase',
                  mb: 3,
                }}
              >
                Poker Of{' '}
                <Box component="span" sx={{ color: '#fff' }}>
                  Bluffing
                </Box>
              </Typography>
              <Typography variant="h6" fontWeight={400} sx={{ mb: 5, opacity: 0.9 }}>
                โกหกให้เนียน หรือจะโดนแมลงสาบบุกบ้าน! บอร์ดเกมแนวบลัฟฟ์ที่ทำลายมิตรภาพได้สนุกที่สุด
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={() => router.push('/game')}
                sx={{
                  bgcolor: '#1a1a1a',
                  color: '#FFD700',
                  px: 6,
                  py: 2,
                  fontSize: '1.1rem',
                  fontWeight: 800,
                  borderRadius: 3,
                  '&:hover': { bgcolor: '#2d2d2d', transform: 'scale(1.05)' },
                  transition: 'all 0.2s',
                }}
              >
                เริ่มเล่นตอนนี้
              </Button>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', justifyContent: 'center' }}>
              <Box
                sx={{
                  width: { xs: 260, md: 340 },
                  height: { xs: 260, md: 340 },
                  bgcolor: '#1a1a1a',
                  borderRadius: 6,
                  border: '4px solid #fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  transform: 'rotate(3deg)',
                  boxShadow: '0 30px 60px rgba(0,0,0,0.3)',
                  transition: 'transform 0.3s',
                  '&:hover': { transform: 'rotate(0deg) translateY(-10px)' },
                  position: 'relative',
                }}
              >
                <Typography sx={{ fontSize: '5rem', mb: 2 }}>🪳</Typography>
                <Typography
                  variant="h5"
                  fontWeight={900}
                  textAlign="center"
                  sx={{ color: '#FFD700', textTransform: 'uppercase', px: 2 }}
                >
                  KAKER LAKEN POKER
                </Typography>
                {/* floating icons */}
                <Typography sx={{ position: 'absolute', top: -20, left: -20, fontSize: '2.5rem' }}>🕷️</Typography>
                <Typography sx={{ position: 'absolute', bottom: -10, right: -20, fontSize: '2.5rem' }}>🦂</Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ── STATS BAR ── */}
      <Box sx={{ bgcolor: '#fff', color: '#1a1a1a', py: 5, px: 3 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} justifyContent="center" textAlign="center">
            {STATS.map((s) => (
              <Grid key={s.label} size={{ xs: 6, md: 3 }}>
                <Typography variant="caption" fontWeight={700} sx={{ textTransform: 'uppercase', color: '#888', letterSpacing: 1 }}>
                  {s.label}
                </Typography>
                <Typography variant="h5" fontWeight={900} sx={{ mt: 0.5 }}>
                  {s.value}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ── ABOUT ── */}
      <Box id="about" sx={{ py: { xs: 10, md: 16 }, px: 3 }}>
        <Container maxWidth="lg">
          <Grid container spacing={8} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h3" fontWeight={900} sx={{ color: '#FFD700', mb: 3 }}>
                ทำไมต้องเล่นเกมนี้?
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)', lineHeight: 2, mb: 3 }}>
                Kaker Laken Poker ไม่ใช่แค่เกมการ์ดธรรมดา แต่มันคือการทดสอบ &quot;หน้าตาย&quot; ของคุณ!
                เป้าหมายคือการส่งต่อการ์ดสัตว์น่ารังเกียจให้เพื่อน แล้วหลอกให้พวกเขาเชื่อว่ามันคือตัวอะไร
                ใครที่พลาดท่าสะสมสัตว์ชนิดเดียวกันครบ 4 ใบ หรือไม่มีการ์ดส่งต่อ... คนนั้นคือผู้แพ้!
              </Typography>
              {['เล่นง่าย เข้าใจได้ใน 2 นาที', 'เน้นการอ่านใจและการบลัฟฟ์', 'พกพาสะดวก เล่นได้ทุกที่'].map((item) => (
                <Box key={item} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      bgcolor: '#FF8C00',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 900,
                      flexShrink: 0,
                    }}
                  >
                    ✓
                  </Box>
                  <Typography variant="body1">{item}</Typography>
                </Box>
              ))}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Grid container spacing={3}>
                {[{ emoji: '🐀', name: 'หนู' }, { emoji: '🦟', name: 'ยุง' }].map((c, i) => (
                  <Grid key={c.name} size={6}>
                    <Paper
                      elevation={0}
                      sx={{
                        height: 240,
                        bgcolor: '#27272a',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 4,
                        borderBottom: `4px solid ${i === 0 ? '#FF8C00' : '#FFD700'}`,
                        mt: i === 1 ? 4 : 0,
                        transition: 'transform 0.3s, box-shadow 0.3s',
                        '&:hover': {
                          transform: 'translateY(-10px)',
                          boxShadow: '0 15px 30px rgba(255,140,0,0.3)',
                        },
                      }}
                    >
                      <Typography sx={{ fontSize: '3.5rem', mb: 1 }}>{c.emoji}</Typography>
                      <Typography fontWeight={700}>{c.name}</Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ── HOW TO PLAY ── */}
      <Box id="how-to-play" sx={{ bgcolor: '#27272a', py: { xs: 10, md: 14 }, px: 3 }}>
        <Container maxWidth="md">
          <Typography variant="h3" fontWeight={900} textAlign="center" sx={{ mb: 8 }}>
            วิธีการเล่นแบบย่อ
          </Typography>
          <Grid container spacing={5}>
            {HOW_TO_PLAY.map((h) => (
              <Grid key={h.step} size={{ xs: 12, md: 4 }}>
                <Box textAlign="center">
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #FFD700 0%, #FF8C00 100%)',
                      color: '#1a1a1a',
                      fontSize: '1.5rem',
                      fontWeight: 900,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 3,
                      boxShadow: '0 8px 24px rgba(255,140,0,0.4)',
                    }}
                  >
                    {h.step}
                  </Box>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5 }}>
                    {h.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.8 }}>
                    {h.desc}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ── CREATURES GALLERY ── */}
      <Box id="gallery" sx={{ py: { xs: 10, md: 16 }, px: 3 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            fontWeight={900}
            textAlign="center"
            sx={{ mb: 8, textTransform: 'uppercase', fontStyle: 'italic' }}
          >
            เหล่าสัตว์ในสำรับ
          </Typography>
          <Grid container spacing={2} justifyContent="center">
            {CREATURES.map((c) => (
              <Grid key={c.name} size={{ xs: 6, sm: 3, md: 'auto' }}>
                <Paper
                  elevation={0}
                  sx={{
                    px: 3,
                    py: 3,
                    bgcolor: '#27272a',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 3,
                    cursor: 'pointer',
                    minWidth: 100,
                    transition: 'all 0.25s',
                    '&:hover': {
                      bgcolor: '#FFD700',
                      color: '#1a1a1a',
                      transform: 'translateY(-6px)',
                      boxShadow: '0 12px 28px rgba(255,215,0,0.3)',
                      '& .creature-name': { color: '#1a1a1a' },
                    },
                  }}
                >
                  <Typography sx={{ fontSize: '2.5rem', mb: 1 }}>{c.emoji}</Typography>
                  <Typography
                    className="creature-name"
                    variant="caption"
                    fontWeight={700}
                    sx={{ textTransform: 'uppercase', color: 'rgba(255,255,255,0.8)', letterSpacing: 1 }}
                  >
                    {c.name}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          <Divider sx={{ my: 10, borderColor: 'rgba(255,255,255,0.08)' }} />

          {/* CTA */}
          <Box textAlign="center">
            <Typography variant="h4" fontWeight={900} sx={{ mb: 2 }}>
              พร้อมจะบลัฟฟ์เพื่อนแล้วใช่ไหม?
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.6)', mb: 4 }}>
              เข้าเล่นออนไลน์กับเพื่อนได้เลยทันที ไม่ต้องดาวน์โหลด
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => router.push('/game')}
              sx={{
                px: 8,
                py: 2,
                fontSize: '1.2rem',
                fontWeight: 800,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #FFD700 0%, #FF8C00 100%)',
                color: '#1a1a1a',
                boxShadow: '0 8px 32px rgba(255,140,0,0.4)',
                '&:hover': { transform: 'scale(1.05)', boxShadow: '0 12px 40px rgba(255,140,0,0.6)' },
                transition: 'all 0.2s',
              }}
            >
              🎮 เริ่มเล่นเลย!
            </Button>
          </Box>
        </Container>
      </Box>

      {/* ── FOOTER ── */}
      <Box
        component="footer"
        sx={{
          bgcolor: '#000',
          py: 8,
          px: 3,
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center" justifyContent="space-between">
            <Grid size={{ xs: 12, md: 'auto' }}>
              <Typography variant="h6" fontWeight={900} sx={{ color: '#FFD700', textTransform: 'uppercase', mb: 0.5 }}>
                Kaker Laken Poker
              </Typography>
              <Typography variant="caption" sx={{ color: '#666' }}>
                ออกแบบมาเพื่อความสนุกและการโกหกอย่างสร้างสรรค์
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 'auto' }}>
              <Box sx={{ display: 'flex', gap: 3 }}>
                {['Facebook', 'Instagram', 'YouTube'].map((link) => (
                  <Typography
                    key={link}
                    variant="body2"
                    sx={{ color: '#666', cursor: 'pointer', '&:hover': { color: '#fff' }, transition: 'color 0.2s' }}
                  >
                    {link}
                  </Typography>
                ))}
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 'auto' }}>
              <Typography variant="caption" sx={{ color: '#444' }}>
                © 2024 Drei Magier Spiele. All rights reserved.
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}

