'use client';

import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import TimerRoundedIcon from '@mui/icons-material/TimerRounded';
import CakeRoundedIcon from '@mui/icons-material/CakeRounded';
import PsychologyRoundedIcon from '@mui/icons-material/PsychologyRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import StyleRoundedIcon from '@mui/icons-material/StyleRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import SentimentVeryDissatisfiedRoundedIcon from '@mui/icons-material/SentimentVeryDissatisfiedRounded';

const CREATURES = [
  { image: '/Cockroach.png', name: 'แมลงสาบ', en: 'Cockroach' },
  { image: '/Rat.png', name: 'หนู', en: 'Rat' },
  { image: '/Cricket.png', name: 'แมลงเขียว', en: 'Cricket' },
  { image: '/Spider.png', name: 'แมงมุม', en: 'Spider' },
  { image: '/Fly.png', name: 'แมลงวัน', en: 'Fly' },
  { image: '/Bat.png', name: 'ค้างคาว', en: 'Bat' },
  { image: '/Frog.png', name: 'กบ', en: 'Frog' },
  { image: '/Scorpion.png', name: 'แมงป่อง', en: 'Scorpion' },
];

const STATS = [
  { icon: GroupsRoundedIcon, label: 'ผู้เล่น', value: '2 – 6 คน', color: '#7CB342' },
  { icon: TimerRoundedIcon, label: 'เวลาเล่น', value: '20 นาที', color: '#42A5F5' },
  { icon: CakeRoundedIcon, label: 'อายุ', value: '8 ปีขึ้นไป', color: '#FFB74D' },
  { icon: PsychologyRoundedIcon, label: 'ทักษะที่ใช้', value: 'หน้านิ่ง', color: '#E57373' },
];

const HOW_TO_PLAY = [
  {
    step: '1',
    icon: StyleRoundedIcon,
    color: '#7CB342',
    title: 'ส่งการ์ด',
    desc: 'เลือกการ์ด 1 ใบ วางคว่ำส่งให้เพื่อน แล้วบอกว่ามันคือตัวอะไร — จะพูดจริงหรือโกหกก็ได้ ขอแค่หน้านิ่งพอ',
  },
  {
    step: '2',
    icon: VisibilityRoundedIcon,
    color: '#42A5F5',
    title: 'จับโกหก',
    desc: 'เพื่อนต้องตัดสินใจว่าคุณ "พูดจริง" หรือ "โกหก" แล้วเปิดการ์ดพิสูจน์กันไปเลย',
  },
  {
    step: '3',
    icon: SentimentVeryDissatisfiedRoundedIcon,
    color: '#E57373',
    title: 'รับกรรม',
    desc: 'ฝ่ายที่แพ้ต้องเก็บการ์ดใบนั้นวางหงายหน้าตัวเอง ใครสะสมสัตว์ชนิดเดียวกันครบ 4 ใบ... แพ้คนเดียวทั้งวง',
  },
];

// สัตว์ที่ลอยอยู่บนเกาะ diorama ใน hero
const DIORAMA_PETS = [
  { image: '/Cockroach.png', size: 92, top: '8%', left: '38%', delay: '0s' },
  { image: '/Frog.png', size: 64, top: '32%', left: '8%', delay: '0.6s' },
  { image: '/Spider.png', size: 60, top: '20%', left: '72%', delay: '1.1s' },
  { image: '/Rat.png', size: 66, top: '52%', left: '66%', delay: '0.3s' },
  { image: '/Scorpion.png', size: 56, top: '56%', left: '24%', delay: '0.9s' },
];

const rise = (delay: number) => ({
  animation: `riseIn 540ms ease-out ${delay}ms backwards`,
});

export default function Home() {
  const router = useRouter();

  return (
    <Box sx={{ minHeight: '100dvh', bgcolor: '#FAFAFA', color: '#37474F' }}>
      {/* ── NAV ── */}
      <Box
        component="nav"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: { xs: 3, md: 8 },
          py: 2,
          bgcolor: 'rgba(250,250,250,0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(55,71,79,0.08)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/Cockroach.png" alt="" style={{ width: 34, height: 34, objectFit: 'contain' }} />
          <Typography variant="h6" fontWeight={700} sx={{ color: '#37474F', letterSpacing: '-0.01em' }}>
            Kaker Laken <Box component="span" sx={{ color: '#7CB342' }}>Poker</Box>
          </Typography>
        </Box>
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 4, alignItems: 'center' }}>
          {[
            { t: 'เกี่ยวกับเกม', href: '#about' },
            { t: 'วิธีเล่น', href: '#how-to-play' },
            { t: 'การ์ดทั้งหมด', href: '#gallery' },
          ].map((item) => (
            <Typography
              key={item.t}
              component="a"
              href={item.href}
              variant="body2"
              fontWeight={500}
              sx={{
                color: '#78909C',
                cursor: 'pointer',
                '&:hover': { color: '#7CB342' },
                transition: 'color 200ms',
              }}
            >
              {item.t}
            </Typography>
          ))}
          <Button variant="contained" size="small" onClick={() => router.push('/game')} sx={{ px: 3, py: 1 }}>
            เล่นเลย
          </Button>
        </Box>
      </Box>

      {/* ── HERO: split-screen, text left / diorama right ── */}
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(180deg, #DCEFFB 0%, #EAF5E3 70%, #FAFAFA 100%)',
          py: { xs: 8, md: 12 },
          px: { xs: 3, md: 8 },
        }}
      >
        {/* tilt-shift blur bands (top & bottom edges) */}
        <Box
          sx={{
            position: 'absolute',
            inset: '0 0 auto 0',
            height: 70,
            backdropFilter: 'blur(3px)',
            maskImage: 'linear-gradient(to bottom, black, transparent)',
            pointerEvents: 'none',
            zIndex: 2,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 'auto 0 0 0',
            height: 70,
            backdropFilter: 'blur(3px)',
            maskImage: 'linear-gradient(to top, black, transparent)',
            pointerEvents: 'none',
            zIndex: 2,
          }}
        />

        <Container maxWidth="lg">
          <Grid container spacing={{ xs: 6, md: 8 }} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <Chip
                label="บอร์ดเกมทำลายมิตรภาพ ฉบับออนไลน์"
                size="small"
                sx={{
                  mb: 3,
                  bgcolor: 'rgba(124,179,66,0.15)',
                  color: '#558B2F',
                  ...rise(0),
                }}
              />
              <Typography
                variant="h1"
                sx={{
                  fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                  fontWeight: 700,
                  lineHeight: 1.1,
                  mb: 3,
                  ...rise(120),
                }}
              >
                โกหกให้เนียน{' '}
                <Box component="span" sx={{ color: '#7CB342' }}>
                  ในโลกจิ๋ว
                </Box>{' '}
                ของเหล่าสัตว์กวนใจ
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: '#78909C', fontSize: '1.1rem', lineHeight: 1.6, mb: 4, maxWidth: '46ch', ...rise(240) }}
              >
                Kaker Laken Poker คือเกมการ์ดจับโกหกสุดป่วน ส่งการ์ดสัตว์น่ารังเกียจให้เพื่อนพร้อมคำโกหกหน้าตาย
                ใครโดนจับได้ (หรือจับพลาด) ก็รับสัตว์ไปสะสม — ครบ 4 ตัวเมื่อไหร่ แพ้ทันที
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', ...rise(360) }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<PlayArrowRoundedIcon />}
                  onClick={() => router.push('/game')}
                  sx={{ px: 5, py: 1.6, fontSize: '1.05rem' }}
                >
                  เริ่มเล่นตอนนี้
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  href="#how-to-play"
                  sx={{
                    px: 4,
                    py: 1.6,
                    fontSize: '1.05rem',
                    borderColor: 'rgba(55,71,79,0.25)',
                    color: '#37474F',
                    '&:hover': { borderColor: '#7CB342', bgcolor: 'rgba(124,179,66,0.06)' },
                  }}
                >
                  ดูวิธีเล่นก่อน
                </Button>
              </Box>
            </Grid>

            {/* diorama island */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box
                sx={{
                  position: 'relative',
                  height: { xs: 320, md: 420 },
                  ...rise(200),
                }}
              >
                {/* dirt layer (thickness of the island) */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: '4%',
                    left: '50%',
                    transform: 'translateX(-50%) rotate(45deg) scaleY(0.55)',
                    transformOrigin: 'center',
                    width: { xs: 230, md: 300 },
                    height: { xs: 230, md: 300 },
                    borderRadius: '2rem',
                    bgcolor: '#8D6E63',
                    boxShadow: '0 24px 48px rgba(93,64,55,0.35)',
                  }}
                />
                {/* grass top */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: '9%',
                    left: '50%',
                    transform: 'translateX(-50%) rotate(45deg) scaleY(0.55)',
                    transformOrigin: 'center',
                    width: { xs: 230, md: 300 },
                    height: { xs: 230, md: 300 },
                    borderRadius: '2rem',
                    background: 'linear-gradient(135deg, #9CCC65 0%, #7CB342 100%)',
                    border: '4px solid #FAFAFA',
                  }}
                />
                {/* pond on the island */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: '22%',
                    left: '58%',
                    width: { xs: 60, md: 84 },
                    height: { xs: 34, md: 46 },
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #4FC3F7, #29B6F6)',
                    border: '3px solid #FAFAFA',
                    opacity: 0.95,
                  }}
                />
                {/* floating animals with their own shadows */}
                {DIORAMA_PETS.map((pet) => (
                  <Box key={pet.image} sx={{ position: 'absolute', top: pet.top, left: pet.left, zIndex: 1 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={pet.image}
                      alt=""
                      style={{
                        width: pet.size,
                        height: pet.size,
                        objectFit: 'contain',
                        animation: `bob 3.2s ease-in-out ${pet.delay} infinite`,
                        filter: 'drop-shadow(0 12px 10px rgba(55,71,79,0.25))',
                        display: 'block',
                      }}
                    />
                  </Box>
                ))}
                {/* floating claim card */}
                <Paper
                  elevation={0}
                  sx={{
                    position: 'absolute',
                    top: '2%',
                    left: '4%',
                    px: 2,
                    py: 1,
                    borderRadius: '1rem',
                    transform: 'rotate(-6deg)',
                    animation: 'bob 4s ease-in-out 0.4s infinite',
                    boxShadow: '0 8px 24px rgba(55,71,79,0.15)',
                  }}
                >
                  <Typography variant="body2" fontWeight={600} sx={{ color: '#37474F' }}>
                    &quot;นี่แมงป่องนะ เชื่อดิ&quot;
                  </Typography>
                </Paper>
                <Paper
                  elevation={0}
                  sx={{
                    position: 'absolute',
                    bottom: '6%',
                    right: '2%',
                    px: 2,
                    py: 1,
                    borderRadius: '1rem',
                    transform: 'rotate(4deg)',
                    animation: 'bob 3.6s ease-in-out 1.4s infinite',
                    bgcolor: '#E57373',
                    border: 'none',
                    boxShadow: '0 8px 24px rgba(229,115,115,0.35)',
                  }}
                >
                  <Typography variant="body2" fontWeight={600} sx={{ color: '#fff' }}>
                    โกหก!
                  </Typography>
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ── STATS BAR ── */}
      <Container maxWidth="lg" sx={{ px: 3, mt: { xs: -2, md: -4 }, position: 'relative', zIndex: 3 }}>
        <Paper elevation={0} sx={{ p: { xs: 3, md: 4 } }}>
          <Grid container spacing={3}>
            {STATS.map((s, i) => (
              <Grid key={s.label} size={{ xs: 6, md: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ...rise(i * 120) }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '1rem',
                      bgcolor: `${s.color}22`,
                      color: s.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <s.icon />
                  </Box>
                  <Box>
                    <Typography variant="caption" fontWeight={500} sx={{ color: '#9E9E9E', textTransform: 'uppercase' }}>
                      {s.label}
                    </Typography>
                    <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                      {s.value}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Container>

      {/* ── ABOUT (zig-zag row 1: text left, visual right) ── */}
      <Box id="about" sx={{ py: 'clamp(4rem, 8vw, 8rem)', px: 3 }}>
        <Container maxWidth="lg">
          <Grid container spacing={{ xs: 6, md: 10 }} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="overline" fontWeight={500} sx={{ color: '#7CB342', letterSpacing: 2 }}>
                เกี่ยวกับเกม
              </Typography>
              <Typography variant="h3" fontWeight={700} sx={{ mb: 3, mt: 1 }}>
                เกมที่ทดสอบ &quot;หน้าตาย&quot; ของคุณ
              </Typography>
              <Typography variant="body1" sx={{ color: '#78909C', lineHeight: 1.8, mb: 4 }}>
                Kaker Laken Poker ไม่ใช่เกมการ์ดธรรมดา เป้าหมายคือส่งต่อการ์ดสัตว์สุดน่ารังเกียจให้เพื่อน
                แล้วหลอกให้เชื่อว่ามันคือตัวอะไรสักตัว ใครพลาดท่าสะสมสัตว์ชนิดเดียวกันครบ 4 ใบ
                หรือการ์ดในมือหมดก่อน... คนนั้นแพ้คนเดียวแบบเจ็บจี๊ด
              </Typography>
              {[
                'เล่นง่าย เข้าใจกติกาได้ใน 2 นาที',
                'เน้นการอ่านใจ อ่านหน้า และการโกหกอย่างมีศิลปะ',
                'เล่นออนไลน์กับเพื่อนได้ทันที ไม่ต้องดาวน์โหลด',
              ].map((item) => (
                <Box key={item} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                  <CheckCircleRoundedIcon sx={{ color: '#7CB342', fontSize: 22 }} />
                  <Typography variant="body1">{item}</Typography>
                </Box>
              ))}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Grid container spacing={3}>
                {[
                  { image: '/Cockroach.png', name: 'แมลงสาบ', tag: 'ตัวการ์ตูนนำแห่งเกม', color: '#7CB342' },
                  { image: '/Bat.png', name: 'ค้างคาว', tag: 'มาเป็นกองหนุน', color: '#42A5F5' },
                ].map((c, i) => (
                  <Grid key={c.name} size={6}>
                    <Paper
                      elevation={0}
                      sx={{
                        height: 240,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1.5,
                        mt: i === 1 ? 5 : 0,
                        borderBottom: `4px solid ${c.color}`,
                        transition: 'transform 200ms var(--spring), box-shadow 200ms ease',
                        '&:hover': {
                          transform: 'scale(1.03)',
                          boxShadow: '0 12px 32px rgba(55,71,79,0.12)',
                        },
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={c.image} alt={c.name} style={{ width: 88, height: 88, objectFit: 'contain' }} />
                      <Box textAlign="center">
                        <Typography fontWeight={700}>{c.name}</Typography>
                        <Typography variant="caption" sx={{ color: '#9E9E9E' }}>
                          {c.tag}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ── HOW TO PLAY (zig-zag alternating rows) ── */}
      <Box id="how-to-play" sx={{ bgcolor: '#F1F8E9', py: 'clamp(4rem, 8vw, 8rem)', px: 3 }}>
        <Container maxWidth="md">
          <Typography variant="overline" fontWeight={500} textAlign="center" display="block" sx={{ color: '#7CB342', letterSpacing: 2 }}>
            กติกา
          </Typography>
          <Typography variant="h3" fontWeight={700} textAlign="center" sx={{ mb: 8, mt: 1 }}>
            เล่นยังไงให้เพื่อนเกลียด
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {HOW_TO_PLAY.map((h, i) => (
              <Paper
                key={h.step}
                elevation={0}
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: i % 2 === 0 ? 'row' : 'row-reverse' },
                  alignItems: 'center',
                  gap: { xs: 2, sm: 4 },
                  p: { xs: 3, md: 4 },
                  transition: 'transform 200ms var(--spring), box-shadow 200ms ease',
                  '&:hover': { transform: 'scale(1.02)', boxShadow: '0 12px 32px rgba(55,71,79,0.1)' },
                }}
              >
                <Box
                  sx={{
                    width: 88,
                    height: 88,
                    borderRadius: '1.5rem',
                    bgcolor: `${h.color}1E`,
                    color: h.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    position: 'relative',
                  }}
                >
                  <h.icon sx={{ fontSize: 40 }} />
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -10,
                      right: -10,
                      width: 30,
                      height: 30,
                      borderRadius: '50%',
                      bgcolor: h.color,
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {h.step}
                  </Box>
                </Box>
                <Box sx={{ textAlign: { xs: 'center', sm: i % 2 === 0 ? 'left' : 'right' } }}>
                  <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
                    {h.title}
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#78909C', lineHeight: 1.7 }}>
                    {h.desc}
                  </Typography>
                </Box>
              </Paper>
            ))}
          </Box>
        </Container>
      </Box>

      {/* ── CREATURES GALLERY ── */}
      <Box id="gallery" sx={{ py: 'clamp(4rem, 8vw, 8rem)', px: 3 }}>
        <Container maxWidth="lg">
          <Typography variant="overline" fontWeight={500} textAlign="center" display="block" sx={{ color: '#42A5F5', letterSpacing: 2 }}>
            การ์ดทั้งหมด
          </Typography>
          <Typography variant="h3" fontWeight={700} textAlign="center" sx={{ mb: 8, mt: 1 }}>
            เหล่าสัตว์ประจำสำรับ
          </Typography>
          <Grid container spacing={3} justifyContent="center">
            {CREATURES.map((c, i) => (
              <Grid key={c.name} size={{ xs: 6, sm: 3 }}>
                <Paper
                  elevation={0}
                  sx={{
                    py: 4,
                    px: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1.5,
                    cursor: 'default',
                    transition: 'transform 200ms var(--spring), box-shadow 200ms ease',
                    '&:hover': {
                      transform: 'scale(1.03) translateY(-4px)',
                      boxShadow: '0 16px 32px rgba(55,71,79,0.12)',
                      '& img': { animation: 'wobble 0.5s ease-in-out infinite' },
                    },
                    ...rise(i * 80),
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.image} alt={c.name} style={{ width: 72, height: 72, objectFit: 'contain' }} />
                  <Box textAlign="center">
                    <Typography fontWeight={700}>{c.name}</Typography>
                    <Typography variant="caption" sx={{ color: '#9E9E9E', textTransform: 'uppercase', letterSpacing: 1 }}>
                      {c.en}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* CTA */}
          <Paper
            elevation={0}
            sx={{
              mt: 10,
              p: { xs: 4, md: 8 },
              textAlign: 'center',
              background: 'linear-gradient(135deg, #7CB342 0%, #689F38 100%)',
              border: 'none',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Typography variant="h4" fontWeight={700} sx={{ mb: 1.5, color: '#fff' }}>
              พร้อมจะโกหกเพื่อนหรือยัง?
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.85)', mb: 4 }}>
              สร้างห้อง แชร์รหัสให้เพื่อน แล้วเริ่มทำลายมิตรภาพกันได้เลย
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<PlayArrowRoundedIcon />}
              onClick={() => router.push('/game')}
              sx={{
                px: 6,
                py: 1.8,
                fontSize: '1.1rem',
                bgcolor: '#FAFAFA',
                color: '#558B2F',
                '&:hover': { bgcolor: '#fff', transform: 'translateY(-2px)', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' },
              }}
            >
              เข้าห้องเกมเลย
            </Button>
          </Paper>
        </Container>
      </Box>

      {/* ── FOOTER ── */}
      <Box component="footer" sx={{ bgcolor: '#37474F', color: '#CFD8DC', py: 6, px: 3 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center" justifyContent="space-between">
            <Grid size={{ xs: 12, md: 'auto' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/Cockroach.png" alt="" style={{ width: 28, height: 28, objectFit: 'contain' }} />
                <Typography variant="h6" fontWeight={700} sx={{ color: '#fff' }}>
                  Kaker Laken Poker
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: '#90A4AE' }}>
                ออกแบบมาเพื่อความสนุกและการโกหกอย่างสร้างสรรค์
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 'auto' }}>
              <Typography variant="caption" sx={{ color: '#78909C' }}>
                © 2026 Drei Magier Spiele. All rights reserved.
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}
