'use client';

import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import LoginRoundedIcon from '@mui/icons-material/LoginRounded';
import StyleRoundedIcon from '@mui/icons-material/StyleRounded';
import GpsFixedRoundedIcon from '@mui/icons-material/GpsFixedRounded';
import SentimentVeryDissatisfiedRoundedIcon from '@mui/icons-material/SentimentVeryDissatisfiedRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import TimerRoundedIcon from '@mui/icons-material/TimerRounded';
import PsychologyRoundedIcon from '@mui/icons-material/PsychologyRounded';

import CreatureCard from './components/CreatureCard';
import { CREATURES } from './lib/creatures';
import { T } from './theme';

const labelCaps = {
  fontSize: '0.75rem',
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: T.taupe,
} as const;

const paperCard = {
  bgcolor: T.paper,
  border: `2px solid ${T.stroke}`,
  borderRadius: 'var(--r-card)',
  boxShadow: T.shCard,
} as const;

// Four insects around the hero table, each caught mid-tell.
const HERO_SEATS = [
  { image: '/Cockroach.png', size: 78, top: '4%', left: '40%', delay: '0s', note: 'ซ่อนการ์ดไว้ข้างหลัง' },
  { image: '/Spider.png', size: 62, top: '34%', left: '4%', delay: '0.7s', note: 'โน้มตัวเข้ามาจ้อง' },
  { image: '/Fly.png', size: 58, top: '30%', left: '76%', delay: '1.2s', note: 'ถือการ์ดเต็มมือ' },
  { image: '/Frog.png', size: 66, top: '68%', left: '30%', delay: '0.4s', note: 'ดูผิดตัวอยู่' },
];

const STEPS = [
  {
    n: '1',
    Icon: StyleRoundedIcon,
    color: T.moss,
    title: 'วางการ์ดคว่ำ แล้วพูดอะไรก็ได้',
    body: 'เลือกการ์ดหนึ่งใบจากมือ ส่งข้ามโต๊ะไปให้ใครสักคน แล้วประกาศว่ามันคือตัวอะไร ความจริงเป็นเรื่องของคุณคนเดียว',
    creature: 'แมลงสาบ',
  },
  {
    n: '2',
    Icon: GpsFixedRoundedIcon,
    color: T.burnt,
    title: 'อีกฝ่ายต้องเลือกว่าจะเชื่อไหม',
    body: 'จับโกหก หรือเชื่อว่าพูดจริง ตัดสินใจแล้วเปิดการ์ดพิสูจน์กันตรงนั้น ไม่มีทางถอย',
    creature: 'แมงมุม',
  },
  {
    n: '3',
    Icon: SentimentVeryDissatisfiedRoundedIcon,
    color: T.accuse,
    title: 'ฝ่ายที่ผิดต้องเก็บการ์ดไว้กับตัว',
    body: 'การ์ดถูกวางหงายไว้หน้าคนที่คิดผิด สะสมสัตว์ชนิดเดียวกันครบสี่ใบเมื่อไหร่ คนนั้นแพ้ทั้งวง',
    creature: 'แมงป่อง',
  },
];

const FACTS = [
  { Icon: PeopleAltRoundedIcon, label: 'ผู้เล่น', value: '2 – 6 คน' },
  { Icon: TimerRoundedIcon, label: 'ต่อเกม', value: '15 นาที' },
  { Icon: PsychologyRoundedIcon, label: 'ทักษะที่ใช้', value: 'หน้านิ่ง' },
];

export default function Home() {
  const router = useRouter();
  const goToGame = () => router.push('/game');

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        bgcolor: T.table,
        color: T.charcoal,
        backgroundImage:
          'radial-gradient(80% 50% at 50% -5%, rgba(217,164,65,0.24) 0%, transparent 62%),' +
          'radial-gradient(60% 45% at 0% 100%, rgba(95,122,58,0.14) 0%, transparent 60%)',
      }}
    >
      {/* ─── Nav ─── */}
      <Box
        component="nav"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          maxWidth: 1440,
          mx: 'auto',
          px: 'clamp(1rem, 4vw, 2.5rem)',
          py: 2,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/Cockroach.png" alt="" style={{ width: 34, height: 34, objectFit: 'contain' }} />
        <Typography sx={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700 }}>
          Cockroach <Box component="span" sx={{ color: T.moss }}>Table</Box>
        </Typography>
        <Box sx={{ flex: 1 }} />
        <Button variant="outlined" onClick={goToGame} sx={{ py: 0.9, px: 2, fontSize: '0.88rem' }}>
          เข้าเล่น
        </Button>
      </Box>

      {/* ─── Hero: split, not centred ─── */}
      <Box
        component="header"
        sx={{
          maxWidth: 1440,
          mx: 'auto',
          px: 'clamp(1rem, 4vw, 2.5rem)',
          pt: { xs: 3, md: 5 },
          pb: { xs: 6, md: 9 },
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: { xs: 5, md: 4 },
          alignItems: 'center',
        }}
      >
        <Box sx={{ animation: 'placeIn 500ms var(--ease-out)' }}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.75,
              px: 1.5,
              py: 0.5,
              mb: 2.5,
              borderRadius: 'var(--r-pill)',
              bgcolor: 'rgba(217,164,65,0.22)',
              border: `2px solid ${T.mustard}`,
            }}
          >
            <Typography sx={{ ...labelCaps, color: T.wood }}>เกมบลัฟบนโต๊ะไม้</Typography>
          </Box>

          <Typography
            component="h1"
            sx={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.75rem, 6vw, 5rem)',
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
              mb: 2.5,
            }}
          >
            โกหกให้เนียน
            <br />
            <Box component="span" sx={{ color: T.moss }}>จับพิรุธให้ทัน</Box>
          </Typography>

          <Typography sx={{ fontSize: '1.08rem', color: T.taupe, maxWidth: 460, mb: 3.5 }}>
            ส่งการ์ดให้เพื่อน บอกว่าจะเป็นตัวอะไรก็ได้ แต่ถ้าอีกฝ่ายจับได้ว่าคุณโกหก การ์ดใบนั้นอาจกลับมาหาคุณเอง
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 3.5 }}>
            <Button variant="contained" startIcon={<PlayArrowRoundedIcon />} onClick={goToGame} sx={{ fontSize: '1.05rem' }}>
              สร้างห้องเกม
            </Button>
            <Button variant="outlined" startIcon={<LoginRoundedIcon />} onClick={goToGame} sx={{ fontSize: '1.05rem' }}>
              เข้าร่วมห้อง
            </Button>
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 2, sm: 3 } }}>
            {FACTS.map(({ Icon, label, value }) => (
              <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Icon sx={{ fontSize: 19, color: T.wood }} />
                <Box>
                  <Typography sx={{ ...labelCaps, lineHeight: 1.3 }}>{label}</Typography>
                  <Typography sx={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.92rem' }}>
                    {value}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        {/* ─── Miniature table, three-quarter view ─── */}
        <Box
          aria-hidden
          sx={{
            position: 'relative',
            aspectRatio: '1 / 0.92',
            minHeight: { xs: 320, md: 420 },
            animation: 'placeIn 620ms var(--ease-out) 120ms backwards',
          }}
        >
          {/* Blurred diorama backdrop — scenery stays soft, pieces stay sharp */}
          <Box
            sx={{
              position: 'absolute',
              inset: '-6%',
              borderRadius: '50%',
              filter: 'blur(28px)',
              background:
                'radial-gradient(circle at 50% 40%, rgba(217,164,65,0.35) 0%, rgba(123,90,62,0.22) 45%, transparent 72%)',
            }}
          />

          {/* The table itself, tilted back */}
          <Box
            className="wood"
            sx={{
              position: 'absolute',
              inset: '16% 6% 12% 6%',
              borderRadius: '46% 46% 38% 38% / 30% 30% 24% 24%',
              border: `3px solid ${T.woodDark}`,
              boxShadow: 'var(--sh-inset), 0 26px 44px rgba(48,46,40,0.3)',
              transform: 'rotateX(12deg)',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                inset: 14,
                borderRadius: 'inherit',
                border: '2px solid rgba(255,249,238,0.16)',
              }}
            />
          </Box>

          {/* Facedown card at the centre, under a warm spotlight */}
          <Box
            sx={{
              position: 'absolute',
              top: '44%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 3,
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                inset: '-90% -120%',
                background: 'radial-gradient(circle, rgba(255,240,200,0.5) 0%, transparent 68%)',
                pointerEvents: 'none',
              }}
            />
            <Box sx={{ position: 'relative', animation: 'bob 4s ease-in-out infinite' }}>
              <CreatureCard creature="แมลงสาบ" size="md" faceDown tilt={-5} />
            </Box>
          </Box>

          {/* Four seated insects */}
          {HERO_SEATS.map((s) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={s.image}
              src={s.image}
              alt=""
              style={{
                position: 'absolute',
                top: s.top,
                left: s.left,
                width: s.size,
                height: s.size,
                objectFit: 'contain',
                zIndex: 4,
                filter: 'drop-shadow(0 10px 8px rgba(48,46,40,0.3))',
                animation: `bob 3.6s ease-in-out ${s.delay} infinite`,
              }}
            />
          ))}
        </Box>
      </Box>

      {/* ─── How to play: zig-zag, never three equal columns ─── */}
      <Box component="section" sx={{ maxWidth: 1100, mx: 'auto', px: 'clamp(1rem, 4vw, 2.5rem)', py: { xs: 5, md: 8 } }}>
        <Typography sx={{ ...labelCaps, textAlign: 'center', display: 'block', mb: 1 }}>วิธีเล่น</Typography>
        <Typography
          component="h2"
          sx={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            fontWeight: 700,
            textAlign: 'center',
            mb: { xs: 4, md: 7 },
          }}
        >
          สามจังหวะ จบใน 15 นาที
        </Typography>

        {STEPS.map((s, i) => {
          const flipped = i % 2 === 1;
          return (
            <Box
              key={s.n}
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                gap: { xs: 2.5, md: 5 },
                alignItems: 'center',
                mb: { xs: 4, md: 6 },
              }}
            >
              <Box
                className="grain"
                sx={{
                  ...paperCard,
                  p: { xs: 2.5, md: 3.5 },
                  order: { xs: 2, md: flipped ? 2 : 1 },
                  transform: `rotate(${flipped ? 1.2 : -1.2}deg)`,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1.5 }}>
                  <Box
                    sx={{
                      width: 38,
                      height: 38,
                      borderRadius: '50%',
                      bgcolor: s.color,
                      color: T.paper,
                      display: 'grid',
                      placeItems: 'center',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      boxShadow: `0 4px 0 rgba(48,46,40,0.25)`,
                    }}
                  >
                    {s.n}
                  </Box>
                  <s.Icon sx={{ fontSize: 22, color: s.color }} />
                </Box>
                <Typography
                  sx={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 700, mb: 1 }}
                >
                  {s.title}
                </Typography>
                <Typography sx={{ color: T.taupe }}>{s.body}</Typography>
              </Box>

              <Box
                sx={{
                  order: { xs: 1, md: flipped ? 1 : 2 },
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <CreatureCard creature={s.creature} size="md" faceDown tilt={-6} />
                  <Box sx={{ mt: 2 }}>
                    <CreatureCard creature={s.creature} size="md" tilt={5} />
                  </Box>
                </Box>
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* ─── The deck ─── */}
      <Box component="section" sx={{ maxWidth: 1100, mx: 'auto', px: 'clamp(1rem, 4vw, 2.5rem)', pb: { xs: 6, md: 9 } }}>
        <Typography sx={{ ...labelCaps, textAlign: 'center', display: 'block', mb: 1 }}>สำรับ</Typography>
        <Typography
          component="h2"
          sx={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            fontWeight: 700,
            textAlign: 'center',
            mb: 1,
          }}
        >
          แปดชนิด ชนิดละแปดใบ
        </Typography>
        <Typography sx={{ textAlign: 'center', color: T.taupe, mb: 4 }}>
          รวม 64 ใบ แจกให้ทุกคนเท่า ๆ กันตอนเริ่มเกม
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, justifyContent: 'center' }}>
          {CREATURES.map((c, i) => (
            <CreatureCard key={c.name} creature={c.name} size="md" tilt={((i % 5) - 2) * 2} />
          ))}
        </Box>
      </Box>

      {/* ─── Closing call ─── */}
      <Box component="section" sx={{ maxWidth: 780, mx: 'auto', px: 'clamp(1rem, 4vw, 2.5rem)', pb: { xs: 6, md: 9 } }}>
        <Box
          className="grain"
          sx={{
            ...paperCard,
            p: { xs: 3, md: 5 },
            textAlign: 'center',
            boxShadow: T.shRaised,
            position: 'relative',
            overflow: 'visible',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/Rat.png"
            alt=""
            style={{
              position: 'absolute',
              top: -32,
              left: 28,
              width: 60,
              height: 60,
              objectFit: 'contain',
              animation: 'bob 3.2s ease-in-out infinite',
              filter: 'drop-shadow(0 8px 6px rgba(48,46,40,0.25))',
            }}
          />
          <Typography
            component="h2"
            sx={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem, 4vw, 2.25rem)', fontWeight: 700, mb: 1.5 }}
          >
            ชวนเพื่อนมานั่งโต๊ะเดียวกัน
          </Typography>
          <Typography sx={{ color: T.taupe, mb: 3 }}>
            สร้างห้อง ส่งรหัสสี่ตัวให้เพื่อน แล้วดูว่าใครหน้านิ่งกว่ากัน
          </Typography>
          <Button variant="contained" startIcon={<PlayArrowRoundedIcon />} onClick={goToGame} sx={{ fontSize: '1.05rem' }}>
            เริ่มเลย
          </Button>
        </Box>
      </Box>

      <Box component="footer" sx={{ borderTop: `2px solid ${T.stroke}`, py: 3 }}>
        <Typography sx={{ textAlign: 'center', color: T.taupe, fontSize: '0.82rem' }}>
          Cockroach Table — เกมบลัฟสำหรับคนที่ยังอยากคบกันต่อ
        </Typography>
      </Box>
    </Box>
  );
}
