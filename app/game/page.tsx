'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';

import CasinoRoundedIcon from '@mui/icons-material/CasinoRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import GpsFixedRoundedIcon from '@mui/icons-material/GpsFixedRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import GroupAddRoundedIcon from '@mui/icons-material/GroupAddRounded';
import LoginRoundedIcon from '@mui/icons-material/LoginRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import RadarRoundedIcon from '@mui/icons-material/RadarRounded';
import TheaterComedyRoundedIcon from '@mui/icons-material/TheaterComedyRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import SortRoundedIcon from '@mui/icons-material/SortRounded';
import HourglassEmptyRoundedIcon from '@mui/icons-material/HourglassEmptyRounded';

import CreatureCard from '../components/CreatureCard';
import PlayerToken from '../components/PlayerToken';
import GameLog, { LogEntry } from '../components/GameLog';
import ChatPanel, { ChatMessage } from '../components/ChatPanel';
import CreatureSelector from '../components/CreatureSelector';
import { CREATURE_NAMES, creatureImage, getCreature } from '../lib/creatures';
import { T, playerColor } from '../theme';

// ─── Wire types (must match pages/api/socketio.ts) ──────────────────────────

interface Card {
  animal: string;
  id: string;
}

interface Player {
  id: string;
  name: string;
  cards: Card[];
  deadCards: Card[];
  disconnected?: boolean;
}

interface Room {
  id: string;
  players: Player[];
  gameStarted: boolean;
  currentPlayer: string | null;
}

interface CurrentAction {
  from: string;
  fromId: string;
  to: string;
  toId: string;
  claim: string;
}

interface Reveal {
  actualAnimal: string;
  claimedAnimal: string;
  guessCorrect: boolean;
  loserName: string;
  message: string;
}

interface GameOverInfo {
  loser: string;
  reason: string;
  title: string;
}

// ─── Flavor ────────────────────────────────────────────────────────────────

const FUNNY_NAMES = [
  'เจ้าพ่อแมลงสาบ', 'แม่มดหน้านิ่ง', 'โกหกไม่เป็น(มั้ง)', 'สายตรวจแมงมุม',
  'กบยิ้มยาก', 'หนูไม่ได้โกง', 'ค้างคาวกลางวัน', 'เซียนบลัฟตัวพ่อ',
  'แมงป่องเจ้าเล่ห์', 'นายจับเท็จ', 'คุณชายหน้าตาย', 'ป้าข้างบ้านรู้หมด',
];

const TAUNTS = [
  'หน้าตายมากพี่', 'โกหกชัวร์ 100%', 'อย่าหลอกกันดิ๊', 'ตาสั่นแล้วนะ',
  'เชื่อก็บ้าแล้ว', 'ส่งมาเลย ไม่กลัว', 'แมลงสาบอีกแล้วเหรอ', 'คิดนานจัง เปิดโพยอยู่ป่ะ',
];

const LIAR_QUOTES = [
  'เคล็ดลับ โกหกสลับพูดจริง เพื่อนจะงงจนเลิกคบ',
  'ผู้เชี่ยวชาญบอกว่าการจ้องตาช่วยจับโกหกได้ หรือแค่ทำให้เขิน',
  'แมลงสาบไม่เคยทำร้ายใคร นอกจากมิตรภาพของคุณ',
  'อย่าเชื่อคนที่พูดว่า เชื่อผมดิ',
  'หน้านิ่งไม่ใช่พรสวรรค์ แต่คือการฝึกฝน',
];

const LOSER_TITLES = [
  'ราชาแมลงสาบแห่งปี', 'นักสะสมตัวยง (แบบไม่ตั้งใจ)', 'ตำนานคนโดนหลอก',
  'ผู้พิทักษ์สวนสัตว์จำเป็น', 'เจ้าของฟาร์มคนใหม่', 'หน้าไม่นิ่งจนโดนอ่านขาด',
];

const DETECTOR_VERDICTS = [
  'โกหกแน่นอน มั้ง',
  'พูดจริง 51% โกหก 49%',
  'เครื่องขอไม่ฟันธง',
  'ตรวจพบนิ้วสั่นขณะส่งการ์ด น่าจะโกหก',
  'หน้าซื่อขนาดนี้ จริงแหละ (หรือเปล่า)',
  'ERROR 418 ความกวนเกินขีดจำกัด',
];

const randomOf = <V,>(arr: V[]): V => arr[Math.floor(Math.random() * arr.length)];

// ─── Persisted identity, so a refresh or a dropped socket returns to the seat ──

const SESSION_KEY = 'klp_session_id';
const LAST_ROOM_KEY = 'klp_last_room';
const LAST_ROOM_TTL_MS = 3 * 60 * 60 * 1000;

function getSessionId(): string {
  const make = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  try {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      id = make();
      localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return make();
  }
}

function readSavedRoom(): { roomId: string; playerName: string } | null {
  try {
    const raw = localStorage.getItem(LAST_ROOM_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw);
    if (!saved?.roomId || Date.now() - (saved.ts || 0) > LAST_ROOM_TTL_MS) {
      localStorage.removeItem(LAST_ROOM_KEY);
      return null;
    }
    return { roomId: saved.roomId, playerName: saved.playerName || '' };
  } catch {
    return null;
  }
}

function saveRoom(roomId: string, playerName: string) {
  try {
    localStorage.setItem(LAST_ROOM_KEY, JSON.stringify({ roomId, playerName, ts: Date.now() }));
  } catch {}
}

function clearSavedRoom() {
  try {
    localStorage.removeItem(LAST_ROOM_KEY);
  } catch {}
}

// ─── Shared surfaces ───────────────────────────────────────────────────────

const paperCard = {
  bgcolor: T.paper,
  border: `2px solid ${T.stroke}`,
  borderRadius: 'var(--r-card)',
  boxShadow: T.shCard,
} as const;

const srOnly = {
  position: 'absolute',
  width: 1,
  height: 1,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
} as const;

const labelCaps = {
  fontSize: '0.75rem',
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: T.taupe,
} as const;

export default function GamePage() {
  const socketRef = useRef<Socket | null>(null);

  const [playerName, setPlayerName] = useState('');
  const [roomInput, setRoomInput] = useState('');
  const [currentRoomId, setCurrentRoomId] = useState('');
  const [playerId, setPlayerId] = useState('');
  const [room, setRoom] = useState<Room | null>(null);
  const [myCards, setMyCards] = useState<Card[]>([]);
  const [phase, setPhase] = useState<'lobby' | 'waiting' | 'playing'>('lobby');

  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [claim, setClaim] = useState<string>(CREATURE_NAMES[0]);
  const [currentAction, setCurrentAction] = useState<CurrentAction | null>(null);

  const [notice, setNotice] = useState('');
  const [announcement, setAnnouncement] = useState('');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [sortHand, setSortHand] = useState(false);
  const [copied, setCopied] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);

  const [reveal, setReveal] = useState<Reveal | null>(null);
  const [flipped, setFlipped] = useState(false);
  const [shake, setShake] = useState(false);
  const [gameOverInfo, setGameOverInfo] = useState<GameOverInfo | null>(null);
  const [rulesOpen, setRulesOpen] = useState(false);

  const [detectorState, setDetectorState] = useState<'idle' | 'scanning' | 'done'>('idle');
  const [detectorVerdict, setDetectorVerdict] = useState('');

  const [emotes, setEmotes] = useState<{ id: number; from: string; text: string }[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');

  const decisionRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef('');
  const currentRoomIdRef = useRef('');
  const playerNameRef = useRef('');

  const addLog = (entry: Omit<LogEntry, 'id' | 'timestamp'>) => {
    setLogs((prev) => [...prev.slice(-99), { ...entry, id: Date.now() + Math.random(), timestamp: new Date() }]);
  };

  useEffect(() => {
    const timer = setInterval(() => setQuoteIndex((i) => (i + 1) % LIAR_QUOTES.length), 6000);
    return () => clearInterval(timer);
  }, []);

  // ─── Socket wiring. Event names and payloads are unchanged. ───────────────
  useEffect(() => {
    fetch('/api/socketio');
    sessionIdRef.current = getSessionId();

    const socketUrl =
      typeof window !== 'undefined'
        ? `${window.location.protocol}//${window.location.host}`
        : 'http://localhost:3002';

    const socket = io(socketUrl, {
      path: '/api/socketio',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      const saved = readSavedRoom();
      if (saved?.playerName) setPlayerName((prev) => prev || saved.playerName);
      const target = currentRoomIdRef.current
        ? { roomId: currentRoomIdRef.current, playerName: playerNameRef.current }
        : saved;
      if (target?.roomId) {
        socket.emit('joinRoom', {
          roomId: target.roomId,
          playerName: target.playerName,
          sessionId: sessionIdRef.current,
        });
      }
    });

    socket.on('roomCreated', ({ roomId, playerId: id, playerName: joinedName }) => {
      currentRoomIdRef.current = roomId;
      playerNameRef.current = joinedName || '';
      saveRoom(roomId, joinedName || '');
      setCurrentRoomId(roomId);
      setPlayerId(id);
      setRoom(null);
      setMyCards([]);
      setChatMessages([]);
      setLogs([]);
      setCurrentAction(null);
      setGameOverInfo(null);
      setPhase('waiting');
      setNotice(`สร้างห้อง ${roomId} แล้ว ส่งรหัสให้เพื่อนได้เลย`);
    });

    socket.on('roomJoined', ({ roomId, playerId: id, playerName: joinedName, rejoined }) => {
      currentRoomIdRef.current = roomId;
      playerNameRef.current = joinedName || '';
      saveRoom(roomId, joinedName || '');
      setCurrentRoomId(roomId);
      setPlayerId(id);
      setPhase('waiting');
      setNotice(rejoined ? 'กลับเข้าห้องเดิมเรียบร้อย' : 'เข้าร่วมห้องแล้ว');
    });

    socket.on('joinFailed', ({ reason }) => {
      clearSavedRoom();
      currentRoomIdRef.current = '';
      setCurrentRoomId('');
      setRoom(null);
      setPhase('lobby');
      setNotice(reason);
    });

    socket.on('roomUpdate', (updated: Room) => {
      setRoom(updated);
      if (updated && !updated.gameStarted) setPhase((p) => (p === 'playing' ? 'waiting' : p));
    });

    socket.on('gameCancelled', ({ message }) => {
      setCurrentAction(null);
      setPhase('waiting');
      setNotice(message);
    });

    socket.on('playerDisconnected', ({ playerName: leftName }) => {
      setNotice(`${leftName} หลุดการเชื่อมต่อ กำลังรอกลับเข้ามา`);
    });

    socket.on('gameStarted', (updated: Room) => {
      setRoom(updated);
      setPhase('playing');
      setNotice('เกมเริ่มแล้ว หน้านิ่งเข้าไว้');
      setLogs([]);
      setGameOverInfo(null);
      setReveal(null);
      setCurrentAction(null);
      setSelectedCard(null);
      setSelectedTarget(null);
    });

    socket.on('roomClosed', ({ message }) => {
      clearSavedRoom();
      currentRoomIdRef.current = '';
      setCurrentRoomId('');
      setRoom(null);
      setMyCards([]);
      setChatMessages([]);
      setLogs([]);
      setCurrentAction(null);
      setGameOverInfo(null);
      setPhase('lobby');
      setNotice(message);
    });

    socket.on('yourCards', (cards: Card[]) => setMyCards(cards));

    socket.on('cardSent', (data: CurrentAction) => {
      setReveal(null);
      setCurrentAction(data);
      setDetectorState('idle');
      setDetectorVerdict('');
      setNotice(`${data.from} ส่งไพ่ให้ ${data.to} โดยอ้างว่าเป็น ${data.claim}`);
      setAnnouncement(`${data.from} ส่งไพ่ให้ ${data.to} อ้างว่าเป็น ${data.claim}`);
      addLog({ type: 'send', message: `${data.from} ส่งไพ่ให้ ${data.to} อ้างว่าเป็น ${data.claim}`, creature: data.claim });
    });

    // The reveal is client-side theatre over the existing challengeResult payload.
    socket.on('challengeResult', (result) => {
      setCurrentAction(null);
      setNotice(result.message);
      setAnnouncement(`${result.message} ไพ่จริงคือ ${result.actualAnimal} อ้างว่าเป็น ${result.claimedAnimal}`);
      addLog({
        type: 'challenge',
        message: `${result.message} (จริง ${result.actualAnimal} / อ้าง ${result.claimedAnimal})`,
        creature: result.actualAnimal,
        result: result.guessCorrect ? 'correct' : 'incorrect',
      });
      setFlipped(false);
      // A wrong call rattles the table (DESIGN.md → Accusation Result)
      if (!result.guessCorrect) {
        setShake(true);
        setTimeout(() => setShake(false), 520);
      }
      setReveal({
        actualAnimal: result.actualAnimal,
        claimedAnimal: result.claimedAnimal,
        guessCorrect: Boolean(result.guessCorrect),
        loserName: result.loserName ?? '',
        message: result.message,
      });
    });

    socket.on('gameOver', (data) => {
      const title = randomOf(LOSER_TITLES);
      setPhase('waiting');
      setReveal(null);
      setGameOverInfo({ loser: data.loser, reason: data.reason, title });
      setNotice(`จบเกม ${data.loser} แพ้เพราะ${data.reason}`);
      setAnnouncement(`จบเกม ${data.loser} แพ้เพราะ${data.reason}`);
      addLog({ type: 'gameOver', message: `จบเกม ${data.loser} แพ้เพราะ${data.reason} ได้รับฉายา "${title}"` });
    });

    socket.on('emote', (data: { from: string; fromId: string; text: string }) => {
      const bubble = { id: Date.now() + Math.random(), from: data.from, text: data.text };
      setEmotes((prev) => [...prev.slice(-3), bubble]);
      addLog({ type: 'emote', message: `${data.from}: "${data.text}"` });
      setTimeout(() => setEmotes((prev) => prev.filter((e) => e.id !== bubble.id)), 4200);
    });

    socket.on('chatMessage', (msg: ChatMessage) => setChatMessages((prev) => [...prev.slice(-99), msg]));
    socket.on('chatHistory', (msgs: ChatMessage[]) => setChatMessages(msgs));
    socket.on('chatCleared', () => setChatMessages([]));
    socket.on('playerLeft', (data) => setNotice(`${data.playerName} ออกจากห้อง (หนีความพ่ายแพ้สินะ)`));
    socket.on('error', (msg: string) => setNotice(msg));

    return () => {
      socket.close();
    };
  }, []);

  // Run the flip once a reveal lands, then clear the scene.
  useEffect(() => {
    if (!reveal) return;
    const flip = setTimeout(() => setFlipped(true), 260);
    const close = setTimeout(() => setReveal(null), 5200);
    return () => {
      clearTimeout(flip);
      clearTimeout(close);
    };
  }, [reveal]);

  const isMyTurn = room?.currentPlayer === playerId;
  const awaitingMyDecision = Boolean(isMyTurn && currentAction && currentAction.toId === playerId);
  const isHost = room?.players[0]?.id === playerId;
  const activePlayer = room?.players.find((p) => p.id === room.currentPlayer);

  useEffect(() => {
    if (awaitingMyDecision) {
      setTimeout(() => decisionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 120);
    }
  }, [awaitingMyDecision]);

  // Derived, not stored — the live region re-reads it whenever the turn moves.
  const turnAnnouncement =
    phase === 'playing' && activePlayer
      ? isMyTurn
        ? 'ถึงตาของคุณแล้ว'
        : `ถึงตาของ ${activePlayer.name}`
      : '';

  // ─── Actions ──────────────────────────────────────────────────────────────

  const createRoom = () => {
    if (!playerName.trim()) return setNotice('ใส่ชื่อก่อน หรือกดลูกเต๋าให้ระบบตั้งให้');
    socketRef.current?.emit('createRoom', { playerName, sessionId: sessionIdRef.current });
  };

  const joinRoom = () => {
    if (!playerName.trim() || !roomInput.trim()) return setNotice('ต้องใส่ทั้งชื่อและรหัสห้อง');
    socketRef.current?.emit('joinRoom', {
      roomId: roomInput.toUpperCase(),
      playerName,
      sessionId: sessionIdRef.current,
    });
  };

  const startGame = () => socketRef.current?.emit('startGame', { roomId: currentRoomId });

  const restartGame = () => {
    if (!window.confirm('เริ่มใหม่เลยไหม ห้องนี้จะถูกปิด ทุกคนจะถูกเตะออก แล้วคุณจะได้ห้องใหม่พร้อมรหัสใหม่')) return;
    socketRef.current?.emit('restartGame', { roomId: currentRoomId });
  };

  const sendCard = () => {
    if (!selectedCard || !selectedTarget) return setNotice('เลือกไพ่และคนที่จะส่งให้ก่อน');
    socketRef.current?.emit('sendCard', {
      roomId: currentRoomId,
      targetPlayerId: selectedTarget,
      cardId: selectedCard,
      claimedAnimal: claim,
    });
    setSelectedCard(null);
    setSelectedTarget(null);
  };

  const challenge = (guessIsLie: boolean) => {
    socketRef.current?.emit('challenge', { roomId: currentRoomId, guessIsLie });
    setDetectorState('idle');
    setDetectorVerdict('');
  };

  const sendTaunt = (text: string) => socketRef.current?.emit('sendEmote', { roomId: currentRoomId, text });

  const sendChat = () => {
    const text = chatInput.trim();
    if (!text) return;
    socketRef.current?.emit('sendChatMessage', { roomId: currentRoomId, text });
    setChatInput('');
  };

  const copyRoomCode = useCallback(() => {
    navigator.clipboard?.writeText(currentRoomId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [currentRoomId]);

  const runLieDetector = () => {
    if (detectorState === 'scanning') return;
    setDetectorState('scanning');
    setDetectorVerdict('');
    setTimeout(() => {
      setDetectorVerdict(randomOf(DETECTOR_VERDICTS));
      setDetectorState('done');
    }, 1700);
  };

  const handCards = sortHand
    ? [...myCards].sort((a, b) => a.animal.localeCompare(b.animal, 'th'))
    : myCards;

  // ─── Pieces ───────────────────────────────────────────────────────────────

  const tauntStrip = (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <TheaterComedyRoundedIcon sx={{ fontSize: 18, color: T.wood, flexShrink: 0 }} />
      <Box
        sx={{
          display: 'flex',
          gap: 0.75,
          overflowX: 'auto',
          py: 0.5,
          '&::-webkit-scrollbar': { height: 0 },
        }}
      >
        {TAUNTS.map((t) => (
          <Box
            key={t}
            component="button"
            type="button"
            onClick={() => sendTaunt(t)}
            sx={{
              flexShrink: 0,
              px: 1.5,
              py: 0.6,
              font: 'inherit',
              fontSize: '0.78rem',
              fontWeight: 700,
              color: T.wood,
              bgcolor: T.paper,
              cursor: 'pointer',
              borderRadius: 'var(--r-pill)',
              border: `2px solid ${T.stroke}`,
              boxShadow: '0 3px 0 rgba(80,58,38,0.14)',
              transition: 'transform 160ms var(--spring)',
              '&:hover': { transform: 'translateY(-2px)', borderColor: T.mustard },
              '&:active': { transform: 'translateY(2px)', boxShadow: '0 1px 0 rgba(80,58,38,0.14)' },
            }}
          >
            {t}
          </Box>
        ))}
      </Box>
    </Box>
  );

  const roomCodePlate = (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1.5,
        px: 2.5,
        py: 1.75,
        borderRadius: 'var(--r-md)',
        bgcolor: 'rgba(217,164,65,0.16)',
        border: `2px dashed ${T.mustard}`,
      }}
    >
      <Box>
        <Typography sx={{ ...labelCaps, textAlign: 'center', mb: 0.25 }}>รหัสห้อง</Typography>
        <Typography
          sx={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'clamp(1.75rem, 5vw, 2.5rem)',
            fontWeight: 700,
            letterSpacing: '0.18em',
            color: T.wood,
            lineHeight: 1,
          }}
        >
          {currentRoomId}
        </Typography>
      </Box>
      <Tooltip title={copied ? 'คัดลอกแล้ว' : 'คัดลอกรหัส'} placement="top">
        <IconButton
          onClick={copyRoomCode}
          aria-label="คัดลอกรหัสห้อง"
          sx={{ width: 44, height: 44, color: copied ? T.leaf : T.wood }}
        >
          {copied ? <CheckRoundedIcon /> : <ContentCopyRoundedIcon />}
        </IconButton>
      </Tooltip>
    </Box>
  );

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        bgcolor: T.table,
        color: T.charcoal,
        // Softly blurred diorama light coming from above the table
        backgroundImage:
          'radial-gradient(90% 55% at 50% -8%, rgba(217,164,65,0.22) 0%, transparent 60%),' +
          'radial-gradient(70% 50% at 100% 100%, rgba(95,122,58,0.12) 0%, transparent 60%)',
        pb: 6,
      }}
    >
      {/* Turn changes and reveals are announced to assistive tech */}
      <Box component="output" aria-live="polite" sx={srOnly}>
        {[turnAnnouncement, announcement].filter(Boolean).join(' ')}
      </Box>

      {/* ─── Top bar ─── */}
      <Box
        component="header"
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: { xs: 2, md: 3 },
          py: 1.25,
          bgcolor: 'rgba(243,233,215,0.94)',
          borderBottom: `2px solid ${T.stroke}`,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/Cockroach.png" alt="" style={{ width: 30, height: 30, objectFit: 'contain' }} />
        <Typography
          sx={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 700, letterSpacing: '-0.01em' }}
        >
          Cockroach <Box component="span" sx={{ color: T.moss }}>Table</Box>
        </Typography>

        {currentRoomId && (
          <Box
            sx={{
              ml: 0.5,
              px: 1.25,
              py: 0.35,
              borderRadius: 'var(--r-pill)',
              bgcolor: 'rgba(95,122,58,0.14)',
              border: `1.5px solid rgba(95,122,58,0.35)`,
              display: 'flex',
              alignItems: 'center',
              gap: 0.6,
            }}
          >
            <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: T.mossDark }}>ห้อง</Typography>
            <Typography
              sx={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 700, color: T.mossDark, letterSpacing: '0.08em' }}
            >
              {currentRoomId}
            </Typography>
          </Box>
        )}

        <Box sx={{ flex: 1 }} />

        <Button
          variant="outlined"
          size="small"
          startIcon={<MenuBookRoundedIcon />}
          onClick={() => setRulesOpen(true)}
          sx={{ py: 0.75, px: 1.75, fontSize: '0.82rem' }}
        >
          กติกา
        </Button>
      </Box>

      <Box sx={{ maxWidth: 1440, mx: 'auto', px: 'clamp(1rem, 4vw, 2.5rem)', pt: 3 }}>
        {/* ─── Notice: a paper slip pinned to the table ─── */}
        {notice && (
          <Box
            sx={{
              ...paperCard,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              px: 2,
              py: 1.25,
              mb: 3,
              borderLeft: `6px solid ${T.mustard}`,
              animation: 'placeIn 260ms var(--ease-out)',
            }}
          >
            <Typography sx={{ flex: 1, fontSize: '0.92rem', fontWeight: 600 }}>{notice}</Typography>
            <IconButton onClick={() => setNotice('')} aria-label="ปิดข้อความ" size="small" sx={{ color: T.taupe }}>
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          </Box>
        )}

        {/* ══════════════ LOBBY ══════════════ */}
        {phase === 'lobby' && (
          <Box sx={{ maxWidth: 480, mx: 'auto', mt: { xs: 2, md: 5 }, animation: 'placeIn 420ms var(--ease-out)' }}>
            <Box className="grain" sx={{ ...paperCard, p: { xs: 3, md: 4 }, position: 'relative', overflow: 'visible' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/Frog.png"
                alt=""
                style={{
                  position: 'absolute',
                  top: -34,
                  right: 24,
                  width: 62,
                  height: 62,
                  objectFit: 'contain',
                  animation: 'bob 3.4s ease-in-out infinite',
                  filter: 'drop-shadow(0 8px 6px rgba(48,46,40,0.22))',
                }}
              />

              <Typography sx={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, mb: 0.5 }}>
                นั่งลงที่โต๊ะ
              </Typography>
              <Typography sx={{ color: T.taupe, mb: 3 }}>สร้างโต๊ะใหม่ หรือเข้าโต๊ะที่เพื่อนเปิดไว้</Typography>

              <Typography component="label" htmlFor="nickname" sx={{ ...labelCaps, display: 'block', mb: 0.75 }}>
                ชื่อผู้เล่น
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                <TextField
                  id="nickname"
                  fullWidth
                  placeholder="ตั้งชื่อที่ดูน่าเชื่อถือ"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                />
                <Tooltip title="ขี้เกียจคิดชื่อ กดเลย" placement="top">
                  <IconButton
                    onClick={() => setPlayerName(randomOf(FUNNY_NAMES))}
                    aria-label="สุ่มชื่อ"
                    sx={{
                      width: 52,
                      height: 52,
                      flexShrink: 0,
                      borderRadius: 'var(--r-sm)',
                      bgcolor: 'rgba(217,164,65,0.22)',
                      color: T.wood,
                      border: `2px solid ${T.stroke}`,
                      '&:hover': { bgcolor: 'rgba(217,164,65,0.4)', transform: 'rotate(18deg)' },
                      transition: 'all 200ms var(--spring)',
                    }}
                  >
                    <CasinoRoundedIcon />
                  </IconButton>
                </Tooltip>
              </Box>

              <Button
                variant="contained"
                fullWidth
                startIcon={<GroupAddRoundedIcon />}
                onClick={createRoom}
                sx={{ mb: 2.5, fontSize: '1.02rem' }}
              >
                สร้างห้องเกม
              </Button>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                <Box sx={{ flex: 1, height: 2, bgcolor: T.stroke, borderRadius: 1 }} />
                <Typography sx={{ ...labelCaps, color: T.taupe }}>หรือ</Typography>
                <Box sx={{ flex: 1, height: 2, bgcolor: T.stroke, borderRadius: 1 }} />
              </Box>

              <Typography component="label" htmlFor="roomcode" sx={{ ...labelCaps, display: 'block', mb: 0.75 }}>
                รหัสห้อง
              </Typography>
              <TextField
                id="roomcode"
                fullWidth
                placeholder="ABCD"
                value={roomInput}
                onChange={(e) => setRoomInput(e.target.value.toUpperCase())}
                sx={{ mb: 2 }}
                slotProps={{
                  htmlInput: {
                    style: {
                      textTransform: 'uppercase',
                      letterSpacing: '0.35em',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      fontSize: '1.1rem',
                    },
                  },
                }}
              />
              <Button variant="outlined" fullWidth startIcon={<LoginRoundedIcon />} onClick={joinRoom} sx={{ fontSize: '1.02rem' }}>
                เข้าร่วมห้อง
              </Button>
            </Box>

            <Typography
              key={quoteIndex}
              sx={{
                mt: 2.5,
                textAlign: 'center',
                color: T.taupe,
                fontStyle: 'italic',
                fontSize: '0.88rem',
                animation: 'placeIn 420ms var(--ease-out)',
              }}
            >
              {LIAR_QUOTES[quoteIndex]}
            </Typography>
          </Box>
        )}

        {/* ══════════════ WAITING ROOM ══════════════ */}
        {phase === 'waiting' && room && (
          <Box
            sx={{
              maxWidth: 1000,
              mx: 'auto',
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1.35fr 1fr' },
              gap: 3,
              alignItems: 'start',
              animation: 'placeIn 420ms var(--ease-out)',
            }}
          >
            <Box className="grain" sx={{ ...paperCard, p: { xs: 2.5, md: 3.5 } }}>
              <Typography sx={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 700, mb: 0.5 }}>
                ห้องรอเพื่อน
              </Typography>
              <Typography sx={{ color: T.taupe, mb: 2.5 }}>
                ส่งรหัสนี้ให้เพื่อน แล้วรอให้ทุกคนมานั่งครบโต๊ะ
              </Typography>

              <Box sx={{ mb: 3 }}>{roomCodePlate}</Box>

              {/* Mini table: filled seats plus the empty ones still waiting */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <PeopleAltRoundedIcon sx={{ fontSize: 18, color: T.wood }} />
                <Typography sx={{ ...labelCaps }}>ที่นั่ง</Typography>
                <Typography sx={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: T.charcoal }}>
                  {room.players.length}/6
                </Typography>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.25, mb: 3 }}>
                {room.players.map((p, i) => (
                  <Box key={p.id} sx={{ animation: `placeIn 420ms var(--ease-out) ${i * 70}ms backwards` }}>
                    <PlayerToken
                      player={{ ...p, handCount: p.id === playerId ? myCards.length : p.cards.length }}
                      index={i}
                      isMe={p.id === playerId}
                      isActive={false}
                      isHost={i === 0}
                      compact
                    />
                  </Box>
                ))}
                {Array.from({ length: Math.max(0, 2 - room.players.length) }).map((_, i) => (
                  <Box
                    key={`empty-${i}`}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.25,
                      p: 1.25,
                      minHeight: 68,
                      borderRadius: 'var(--r-md)',
                      border: `2px dashed ${T.stroke}`,
                      color: T.taupe,
                    }}
                  >
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        border: `2px dashed ${T.stroke}`,
                        display: 'grid',
                        placeItems: 'center',
                      }}
                    >
                      <HourglassEmptyRoundedIcon sx={{ fontSize: 18, color: T.stroke }} />
                    </Box>
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }}>ที่นั่งว่าง</Typography>
                  </Box>
                ))}
              </Box>

              {isHost ? (
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<PlayArrowRoundedIcon />}
                  onClick={startGame}
                  disabled={room.players.length < 2}
                  sx={{ fontSize: '1.05rem' }}
                >
                  {room.players.length < 2 ? `รอผู้เล่นอีกอย่างน้อย 1 คน (${room.players.length}/2)` : 'เริ่มเกม'}
                </Button>
              ) : (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1.25,
                    py: 1.5,
                    borderRadius: 'var(--r-sm)',
                    bgcolor: 'rgba(48,46,40,0.04)',
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/Cockroach.png"
                    alt=""
                    style={{ width: 26, height: 26, objectFit: 'contain', animation: 'bob 2.4s ease-in-out infinite' }}
                  />
                  <Typography sx={{ color: T.taupe, fontWeight: 600 }}>
                    หัวหน้าห้องกำลังจัดไพ่ รอสักครู่
                  </Typography>
                </Box>
              )}
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <ChatPanel
                messages={chatMessages}
                myId={playerId}
                value={chatInput}
                onChange={setChatInput}
                onSend={sendChat}
                height={240}
              />
              <Typography
                key={quoteIndex}
                sx={{ textAlign: 'center', color: T.taupe, fontStyle: 'italic', fontSize: '0.85rem' }}
              >
                {LIAR_QUOTES[quoteIndex]}
              </Typography>
            </Box>
          </Box>
        )}

        {/* ══════════════ GAME TABLE ══════════════ */}
        {phase === 'playing' && room && (
          <Box
            sx={{
              display: 'grid',
              gap: 2.5,
              alignItems: 'start',
              gridTemplateColumns: {
                xs: '1fr',
                lg: 'minmax(200px, 0.85fr) minmax(420px, 2.3fr) minmax(280px, 1.1fr)',
              },
            }}
          >
            {/* ─── Zone 1: players ─── */}
            <Box
              component="section"
              aria-label="ผู้เล่นในเกม"
              sx={{
                order: { xs: 2, lg: 1 },
                display: 'flex',
                flexDirection: { xs: 'row', lg: 'column' },
                gap: 1.25,
                overflowX: { xs: 'auto', lg: 'visible' },
                pb: { xs: 1, lg: 0 },
                '&::-webkit-scrollbar': { height: 6 },
                '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(123,90,62,0.3)', borderRadius: 3 },
              }}
            >
              <Typography sx={{ ...labelCaps, display: { xs: 'none', lg: 'block' }, mb: 0.5 }}>
                ผู้เล่น
              </Typography>
              {room.players.map((p, i) => (
                <Box key={p.id} sx={{ minWidth: { xs: 210, lg: 'auto' }, flexShrink: 0 }}>
                  <PlayerToken
                    player={{ ...p, handCount: p.id === playerId ? myCards.length : p.cards.length }}
                    index={i}
                    isMe={p.id === playerId}
                    isActive={p.id === room.currentPlayer}
                    isHost={i === 0}
                  />
                </Box>
              ))}
            </Box>

            {/* ─── Zone 2: the table ─── */}
            <Box component="section" aria-label="โต๊ะเกม" sx={{ order: { xs: 1, lg: 2 }, minWidth: 0 }}>
              <Box
                className="wood"
                sx={{
                  position: 'relative',
                  borderRadius: '32px',
                  border: `3px solid ${T.woodDark}`,
                  boxShadow: `${T.shInset}, 0 14px 30px rgba(48,46,40,0.22)`,
                  p: { xs: 2, md: 3 },
                  minHeight: 320,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  animation: shake ? 'tableShake 480ms ease-in-out' : undefined,
                }}
              >
                {/* Thin inner border, as on a real board */}
                <Box
                  aria-hidden
                  sx={{
                    position: 'absolute',
                    inset: 10,
                    borderRadius: '24px',
                    border: '2px solid rgba(255,249,238,0.14)',
                    pointerEvents: 'none',
                  }}
                />
                {/* Spotlight over the centre during a decision */}
                <Box
                  aria-hidden
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '32px',
                    pointerEvents: 'none',
                    background:
                      'radial-gradient(60% 55% at 50% 30%, rgba(255,249,238,0.20) 0%, transparent 70%)',
                    opacity: currentAction ? 1 : 0.45,
                    transition: 'opacity 300ms ease',
                  }}
                />

                <Box sx={{ position: 'relative', textAlign: 'center' }}>
                  {/* ── State A: a card is in the air, and it is aimed at me ── */}
                  {awaitingMyDecision && currentAction && (
                    <Box ref={decisionRef} sx={{ animation: 'placeIn 320ms var(--ease-out)' }}>
                      <Typography sx={{ ...labelCaps, color: 'rgba(255,249,238,0.75)' }}>ไพ่ถึงมือคุณแล้ว</Typography>
                      <Typography
                        sx={{
                          fontFamily: 'var(--font-display)',
                          fontSize: 'clamp(1.4rem, 3.5vw, 2rem)',
                          fontWeight: 700,
                          color: T.paper,
                          mb: 2,
                        }}
                      >
                        {currentAction.from} บอกว่านี่คือ {currentAction.claim}
                      </Typography>

                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2.5, mb: 2.5 }}>
                        <Box sx={{ textAlign: 'center' }}>
                          <CreatureCard creature={currentAction.claim} size="lg" faceDown />
                          <Typography sx={{ ...labelCaps, color: 'rgba(255,249,238,0.7)', mt: 1 }}>ไพ่จริง</Typography>
                        </Box>
                        <Box sx={{ textAlign: 'center' }}>
                          <CreatureCard creature={currentAction.claim} size="lg" tilt={-2} />
                          <Typography sx={{ ...labelCaps, color: 'rgba(255,249,238,0.7)', mt: 1 }}>คำกล่าวอ้าง</Typography>
                        </Box>
                      </Box>

                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                          gap: 1.5,
                          maxWidth: 460,
                          mx: 'auto',
                        }}
                      >
                        <Button
                          variant="contained"
                          color="error"
                          fullWidth
                          startIcon={<GpsFixedRoundedIcon />}
                          onClick={() => challenge(true)}
                          sx={{ fontSize: '1rem' }}
                        >
                          จับโกหก
                        </Button>
                        <Button
                          variant="contained"
                          color="success"
                          fullWidth
                          startIcon={<VisibilityRoundedIcon />}
                          onClick={() => challenge(false)}
                          sx={{ fontSize: '1rem' }}
                        >
                          เชื่อว่าพูดจริง
                        </Button>
                      </Box>
                    </Box>
                  )}

                  {/* ── State B: a card is in the air between two other people ── */}
                  {currentAction && !awaitingMyDecision && (
                    <Box sx={{ animation: 'placeIn 320ms var(--ease-out)' }}>
                      <CreatureCard creature={currentAction.claim} size="lg" faceDown />
                      <Typography sx={{ ...labelCaps, color: 'rgba(255,249,238,0.75)', mt: 2 }}>
                        การ์ดกำลังลอยอยู่กลางโต๊ะ
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: 'var(--font-display)',
                          fontSize: '1.25rem',
                          fontWeight: 700,
                          color: T.paper,
                          mt: 0.5,
                        }}
                      >
                        {currentAction.from} → {currentAction.to}
                      </Typography>
                      <Typography sx={{ color: 'rgba(255,249,238,0.8)', mt: 0.5 }}>
                        อ้างว่าเป็น {currentAction.claim} · รอ {currentAction.to} ตัดสินใจ
                      </Typography>
                    </Box>
                  )}

                  {/* ── State C: my turn, nothing in the air yet ── */}
                  {!currentAction && isMyTurn && (
                    <Box sx={{ animation: 'placeIn 320ms var(--ease-out)' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={creatureImage(claim)}
                        alt=""
                        style={{ width: 84, height: 84, objectFit: 'contain', animation: 'bob 3s ease-in-out infinite' }}
                      />
                      <Typography
                        sx={{
                          fontFamily: 'var(--font-display)',
                          fontSize: 'clamp(1.4rem, 3.5vw, 2rem)',
                          fontWeight: 700,
                          color: T.paper,
                          mt: 1,
                        }}
                      >
                        ตาของคุณแล้ว
                      </Typography>
                      <Typography sx={{ color: 'rgba(255,249,238,0.82)', mt: 0.5 }}>
                        เลือกไพ่จากมือ ตั้งคำกล่าวอ้าง แล้วเลือกเหยื่อทางขวา
                      </Typography>
                    </Box>
                  )}

                  {/* ── State D: waiting for someone else ── */}
                  {!currentAction && !isMyTurn && (
                    <Box>
                      <Box sx={{ display: 'inline-flex', gap: -1, mb: 1.5 }}>
                        {[-4, 0, 4].map((t, i) => (
                          <Box key={t} sx={{ ml: i === 0 ? 0 : -5 }}>
                            <CreatureCard creature="แมลงสาบ" size="sm" faceDown tilt={t} />
                          </Box>
                        ))}
                      </Box>
                      <Typography sx={{ ...labelCaps, color: 'rgba(255,249,238,0.75)' }}>กำลังรอ</Typography>
                      <Typography
                        sx={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, color: T.paper }}
                      >
                        ตาของ {activePlayer?.name ?? '...'}
                      </Typography>
                      <Typography sx={{ color: 'rgba(255,249,238,0.75)', mt: 0.5, fontSize: '0.9rem' }}>
                        ระหว่างนี้แซวเพื่อนไปก่อนได้
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Taunts live on the table edge, never over the controls */}
                <Box
                  sx={{
                    position: 'relative',
                    mt: 2.5,
                    pt: 2,
                    borderTop: '2px solid rgba(255,249,238,0.14)',
                  }}
                >
                  {tauntStrip}
                </Box>
              </Box>

              {/* ─── My hand ─── */}
              <Box className="grain" sx={{ ...paperCard, p: { xs: 1.75, md: 2.25 }, mt: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1.5 }}>
                  <Typography sx={{ ...labelCaps }}>ไพ่ในมือคุณ</Typography>
                  <Typography
                    sx={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      px: 1,
                      borderRadius: 'var(--r-pill)',
                      bgcolor: 'rgba(95,122,58,0.16)',
                      color: T.mossDark,
                    }}
                  >
                    {myCards.length}
                  </Typography>
                  <Box sx={{ flex: 1 }} />
                  <Button
                    size="small"
                    variant={sortHand ? 'contained' : 'outlined'}
                    startIcon={<SortRoundedIcon />}
                    onClick={() => setSortHand((v) => !v)}
                    sx={{ py: 0.5, px: 1.5, fontSize: '0.78rem', minHeight: 36 }}
                  >
                    เรียงไพ่
                  </Button>
                </Box>

                {myCards.length === 0 ? (
                  <Typography sx={{ color: T.taupe, textAlign: 'center', py: 3 }}>ไม่มีไพ่ในมือแล้ว</Typography>
                ) : (
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 1,
                      flexWrap: { xs: 'nowrap', md: 'wrap' },
                      overflowX: { xs: 'auto', md: 'visible' },
                      pt: 2,
                      pb: 1.5,
                      justifyContent: { xs: 'flex-start', md: 'center' },
                      '&::-webkit-scrollbar': { height: 6 },
                      '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(123,90,62,0.3)', borderRadius: 3 },
                    }}
                  >
                    {handCards.map((card, i) => (
                      <CreatureCard
                        key={card.id}
                        creature={card.animal}
                        selected={selectedCard === card.id}
                        disabled={!isMyTurn || Boolean(currentAction)}
                        tilt={((i % 7) - 3) * 1.1}
                        onClick={
                          isMyTurn && !currentAction
                            ? () => setSelectedCard((prev) => (prev === card.id ? null : card.id))
                            : undefined
                        }
                      />
                    ))}
                  </Box>
                )}
              </Box>
            </Box>

            {/* ─── Zone 3: actions, log, chat ─── */}
            <Box
              component="section"
              aria-label="แผงควบคุม"
              sx={{ order: 3, display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}
            >
              {/* Send controls appear only when there is something to send */}
              {isMyTurn && !currentAction && myCards.length > 0 && (
                <Box
                  className="grain"
                  sx={{
                    ...paperCard,
                    p: 2,
                    border: `2px solid ${T.moss}`,
                    animation: 'placeIn 300ms var(--ease-out)',
                  }}
                >
                  <Typography sx={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, mb: 0.25 }}>
                    ส่งไพ่ให้ใครสักคน
                  </Typography>
                  <Typography sx={{ color: T.taupe, fontSize: '0.82rem', mb: 2 }}>
                    {selectedCard ? 'เลือกสัตว์ที่จะอ้าง แล้วเลือกเป้าหมาย' : 'แตะไพ่ในมือของคุณก่อน'}
                  </Typography>

                  <Typography sx={{ ...labelCaps, display: 'block', mb: 1 }}>อ้างว่าเป็น</Typography>
                  <Box sx={{ mb: 2, opacity: selectedCard ? 1 : 0.5, pointerEvents: selectedCard ? 'auto' : 'none' }}>
                    <CreatureSelector value={claim} onChange={setClaim} />
                  </Box>

                  <Typography sx={{ ...labelCaps, display: 'block', mb: 1 }}>ส่งให้</Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1,
                      mb: 2,
                      opacity: selectedCard ? 1 : 0.5,
                      pointerEvents: selectedCard ? 'auto' : 'none',
                    }}
                  >
                    {room.players
                      .filter((p) => p.id !== playerId)
                      .map((p) => {
                        const seat = room.players.findIndex((x) => x.id === p.id);
                        const active = selectedTarget === p.id;
                        return (
                          <Box
                            key={p.id}
                            component="button"
                            type="button"
                            aria-pressed={active}
                            onClick={() => setSelectedTarget(p.id)}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              px: 1.25,
                              py: 1,
                              minHeight: 48,
                              font: 'inherit',
                              cursor: 'pointer',
                              textAlign: 'left',
                              borderRadius: 'var(--r-sm)',
                              bgcolor: active ? 'rgba(217,164,65,0.18)' : T.paper,
                              border: `2px solid ${active ? T.mustard : T.stroke}`,
                              boxShadow: active ? '0 4px 0 rgba(169,119,31,0.5)' : '0 3px 0 rgba(80,58,38,0.12)',
                              transition: 'transform 160ms var(--spring)',
                              '&:hover': { transform: 'translateY(-2px)' },
                            }}
                          >
                            <Box
                              sx={{
                                width: 26,
                                height: 26,
                                flexShrink: 0,
                                borderRadius: '50%',
                                bgcolor: playerColor(seat),
                                color: T.paper,
                                display: 'grid',
                                placeItems: 'center',
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                              }}
                            >
                              {seat + 1}
                            </Box>
                            <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {p.name}
                            </Typography>
                            {active && <CheckRoundedIcon sx={{ ml: 'auto', fontSize: 18, color: '#A9771F' }} />}
                          </Box>
                        );
                      })}
                  </Box>

                  <Button
                    variant="contained"
                    fullWidth
                    endIcon={<SendRoundedIcon />}
                    onClick={sendCard}
                    disabled={!selectedCard || !selectedTarget}
                  >
                    ส่งไพ่
                  </Button>
                </Box>
              )}

              {/* The joke lie detector, available while deciding */}
              {awaitingMyDecision && (
                <Box className="grain" sx={{ ...paperCard, p: 2, textAlign: 'center' }}>
                  <Typography sx={{ ...labelCaps, display: 'block', mb: 1 }}>ตัวช่วยที่ช่วยอะไรไม่ได้</Typography>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={
                      <RadarRoundedIcon
                        sx={detectorState === 'scanning' ? { animation: 'needleSweep 0.8s ease-in-out infinite' } : undefined}
                      />
                    }
                    onClick={runLieDetector}
                    disabled={detectorState === 'scanning'}
                    sx={{ fontSize: '0.85rem' }}
                  >
                    {detectorState === 'scanning' ? 'กำลังสแกน' : 'เครื่องจับโกหก (แม่น 50/50)'}
                  </Button>
                  {detectorState === 'done' && detectorVerdict && (
                    <Typography
                      sx={{ mt: 1.25, fontWeight: 700, fontSize: '0.85rem', color: T.wood, animation: 'tokenPop 300ms var(--spring)' }}
                    >
                      {detectorVerdict}
                    </Typography>
                  )}
                </Box>
              )}

              <GameLog entries={logs} maxHeight={280} />

              <ChatPanel
                messages={chatMessages}
                myId={playerId}
                value={chatInput}
                onChange={setChatInput}
                onSend={sendChat}
                height={180}
              />

              {isHost && (
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<RestartAltRoundedIcon />}
                  onClick={restartGame}
                  sx={{ borderColor: T.accuse, color: T.accuse, fontSize: '0.85rem', '&:hover': { borderColor: T.accuse, bgcolor: 'rgba(184,74,58,0.08)' } }}
                >
                  ปิดห้องนี้ แล้วเปิดห้องใหม่
                </Button>
              )}
            </Box>
          </Box>
        )}
      </Box>

      {/* ══════════ REVEAL: the flip, then the stamp ══════════ */}
      {reveal && (
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            zIndex: 280,
            display: 'grid',
            placeItems: 'center',
            p: 3,
            bgcolor: 'rgba(48,46,40,0.62)',
          }}
          onClick={() => setReveal(null)}
        >
          <Box
            className="grain"
            sx={{
              ...paperCard,
              position: 'relative',
              maxWidth: 460,
              width: '100%',
              p: { xs: 3, md: 4 },
              textAlign: 'center',
              boxShadow: T.shRaised,
              animation: 'placeIn 320ms var(--ease-out)',
            }}
          >
            <Typography sx={{ ...labelCaps, display: 'block', mb: 2 }}>เปิดไพ่</Typography>

            {/* Flip: back → actual creature, perspective on the parent */}
            <Box sx={{ perspective: '1000px', display: 'grid', placeItems: 'center', mb: 2.5 }}>
              <Box
                sx={{
                  position: 'relative',
                  width: 132,
                  height: 184,
                  transformStyle: 'preserve-3d',
                  transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  transition: 'transform 420ms var(--ease-out)',
                }}
              >
                <Box sx={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden' }}>
                  <CreatureCard creature={reveal.claimedAnimal} size="lg" faceDown />
                </Box>
                <Box sx={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                  <CreatureCard creature={reveal.actualAnimal} size="lg" />
                </Box>
              </Box>
            </Box>

            {flipped && (
              <Box sx={{ animation: 'placeIn 300ms var(--ease-out)' }}>
                <Typography sx={{ color: T.taupe, fontSize: '0.88rem', mb: 0.5 }}>
                  อ้างว่าเป็น {reveal.claimedAnimal} · ไพ่จริงคือ{' '}
                  <Box component="strong" sx={{ color: getCreature(reveal.actualAnimal).tint }}>
                    {reveal.actualAnimal}
                  </Box>
                </Typography>

                {/* Result stamp — icon and words, not color alone */}
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 2,
                    py: 0.75,
                    my: 1.5,
                    borderRadius: 'var(--r-sm)',
                    border: `3px solid ${reveal.guessCorrect ? T.leaf : T.accuse}`,
                    color: reveal.guessCorrect ? T.leaf : T.accuse,
                    animation: 'stampDown 400ms var(--spring)',
                  }}
                >
                  {reveal.guessCorrect ? <CheckRoundedIcon /> : <GpsFixedRoundedIcon />}
                  <Typography sx={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 700 }}>
                    {reveal.guessCorrect ? 'ทายถูก' : 'ทายผิด'}
                  </Typography>
                </Box>

                <Typography sx={{ fontWeight: 600 }}>{reveal.message}</Typography>

                <Button variant="outlined" onClick={() => setReveal(null)} sx={{ mt: 2.5 }}>
                  เข้าใจแล้ว
                </Button>
              </Box>
            )}
          </Box>
        </Box>
      )}

      {/* ══════════ Emote bubbles ══════════ */}
      <Box
        aria-hidden
        sx={{
          position: 'fixed',
          bottom: 20,
          left: 16,
          zIndex: 250,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          pointerEvents: 'none',
          maxWidth: '80vw',
        }}
      >
        {emotes.map((e) => (
          <Box
            key={e.id}
            sx={{
              px: 1.5,
              py: 0.9,
              borderRadius: '16px 16px 16px 4px',
              bgcolor: T.paper,
              border: `2px solid ${T.stroke}`,
              boxShadow: T.shCard,
              animation: 'bubbleUp 4.2s ease-in-out forwards',
            }}
          >
            <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: T.wood }}>{e.from}</Typography>
            <Typography sx={{ fontSize: '0.88rem', fontWeight: 600 }}>{e.text}</Typography>
          </Box>
        ))}
      </Box>

      {/* ══════════ Game over ══════════ */}
      {gameOverInfo && (
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            zIndex: 300,
            display: 'grid',
            placeItems: 'center',
            p: 3,
            overflow: 'hidden',
            bgcolor: 'rgba(48,46,40,0.7)',
          }}
        >
          {Array.from({ length: 14 }).map((_, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src="/Cockroach.png"
              alt=""
              style={{
                position: 'absolute',
                top: 0,
                left: `${(i * 67) % 100}%`,
                width: 30 + ((i * 13) % 26),
                height: 30 + ((i * 13) % 26),
                objectFit: 'contain',
                animation: `scatter ${2.8 + ((i * 7) % 18) / 10}s linear ${((i * 11) % 22) / 10}s infinite`,
                pointerEvents: 'none',
              }}
            />
          ))}

          <Box
            className="grain"
            sx={{
              ...paperCard,
              position: 'relative',
              maxWidth: 440,
              width: '100%',
              p: { xs: 3, md: 4 },
              textAlign: 'center',
              boxShadow: T.shRaised,
              animation: 'placeIn 380ms var(--ease-out)',
            }}
          >
            <IconButton
              onClick={() => setGameOverInfo(null)}
              aria-label="ปิด"
              sx={{ position: 'absolute', top: 8, right: 8, color: T.taupe }}
            >
              <CloseRoundedIcon />
            </IconButton>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/Cockroach.png"
              alt=""
              style={{ width: 88, height: 88, objectFit: 'contain', animation: 'wobble 0.9s ease-in-out infinite' }}
            />
            <Typography sx={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, mt: 1.5 }}>
              จบเกม
            </Typography>
            <Typography sx={{ color: T.taupe, mb: 2 }}>
              <Box component="strong" sx={{ color: T.accuse }}>{gameOverInfo.loser}</Box> แพ้เพราะ{gameOverInfo.reason}
            </Typography>
            <Box
              sx={{
                display: 'inline-block',
                px: 2,
                py: 1,
                mb: 3,
                borderRadius: 'var(--r-sm)',
                bgcolor: 'rgba(217,164,65,0.22)',
                border: `2px solid ${T.mustard}`,
              }}
            >
              <Typography sx={{ ...labelCaps, mb: 0.25 }}>ฉายาที่ได้รับ</Typography>
              <Typography sx={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: T.wood }}>
                {gameOverInfo.title}
              </Typography>
            </Box>
            <Button variant="contained" fullWidth onClick={() => setGameOverInfo(null)}>
              กลับห้องรอ เล่นใหม่อีกรอบ
            </Button>
          </Box>
        </Box>
      )}

      {/* ══════════ Rules: an instruction sheet, not a glass modal ══════════ */}
      <Dialog
        open={rulesOpen}
        onClose={() => setRulesOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { className: 'grain', sx: { ...paperCard, boxShadow: T.shRaised } } }}
      >
        <Box sx={{ p: { xs: 3, md: 4 }, position: 'relative' }}>
          {/* A strip of tape at the top, like a rule card pinned to the box lid */}
          <Box
            aria-hidden
            sx={{
              position: 'absolute',
              top: -10,
              left: '50%',
              transform: 'translateX(-50%) rotate(-2deg)',
              width: 96,
              height: 22,
              bgcolor: 'rgba(217,164,65,0.5)',
              border: '1px solid rgba(169,119,31,0.4)',
            }}
          />
          <IconButton
            onClick={() => setRulesOpen(false)}
            aria-label="ปิดกติกา"
            sx={{ position: 'absolute', top: 10, right: 10, color: T.taupe }}
          >
            <CloseRoundedIcon />
          </IconButton>

          <Typography sx={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 700, mb: 2.5 }}>
            กติกาบนโต๊ะนี้
          </Typography>

          {[
            { n: '1', title: 'ส่งการ์ด', body: 'ในตาของคุณ เลือกการ์ด 1 ใบ วางคว่ำส่งให้เพื่อน แล้วบอกว่ามันคือตัวอะไร จะพูดจริงหรือโกหกก็ได้' },
            { n: '2', title: 'ตัดสินใจ', body: 'คนที่ได้รับต้องเลือกว่าจะจับโกหก หรือเชื่อว่าพูดจริง แล้วเปิดการ์ดพิสูจน์' },
            { n: '3', title: 'รับกรรม', body: 'ฝ่ายที่ผิดต้องเก็บการ์ดใบนั้นวางหงายไว้หน้าตัวเอง แล้วเป็นคนเล่นตาต่อไป' },
            { n: '4', title: 'เงื่อนไขแพ้', body: 'สะสมสัตว์ชนิดเดียวกันครบ 4 ใบ หรือครบทั้ง 8 ชนิด หรือไพ่ในมือหมด คุณแพ้ทันที' },
          ].map((r) => (
            <Box key={r.n} sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  flexShrink: 0,
                  borderRadius: '50%',
                  bgcolor: T.moss,
                  color: T.paper,
                  display: 'grid',
                  placeItems: 'center',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  boxShadow: '0 3px 0 rgba(75,97,45,1)',
                }}
              >
                {r.n}
              </Box>
              <Box>
                <Typography sx={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.05rem' }}>
                  {r.title}
                </Typography>
                <Typography sx={{ color: T.taupe, fontSize: '0.9rem' }}>{r.body}</Typography>
              </Box>
            </Box>
          ))}

          <Box sx={{ mt: 3, pt: 2.5, borderTop: `2px solid ${T.stroke}` }}>
            <Typography sx={{ ...labelCaps, display: 'block', mb: 1.25 }}>สัตว์ทั้ง 8 ชนิด</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {CREATURE_NAMES.map((n) => (
                <Box
                  key={n}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    px: 1,
                    py: 0.5,
                    borderRadius: 'var(--r-pill)',
                    border: `1.5px solid ${T.stroke}`,
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={creatureImage(n)} alt="" style={{ width: 22, height: 22, objectFit: 'contain' }} />
                  <Typography sx={{ fontSize: '0.8rem', fontWeight: 700 }}>{n}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
}
