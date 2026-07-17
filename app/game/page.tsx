'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

// MUI imports
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';

// Icons (DESIGN.md: no emojis in UI)
import CasinoRoundedIcon from '@mui/icons-material/CasinoRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import TheaterComedyRoundedIcon from '@mui/icons-material/TheaterComedyRounded';
import RadarRoundedIcon from '@mui/icons-material/RadarRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import GroupAddRoundedIcon from '@mui/icons-material/GroupAddRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import StyleRoundedIcon from '@mui/icons-material/StyleRounded';
import ForumRoundedIcon from '@mui/icons-material/ForumRounded';

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

interface GameLog {
  id: number;
  type: 'receive' | 'send' | 'challenge' | 'gameOver' | 'emote';
  message: string;
  timestamp: Date;
}

interface EmoteBubble {
  id: number;
  from: string;
  text: string;
}

interface ChatMessage {
  id: string;
  from: string;
  fromId: string;
  text: string;
  timestamp: number;
}

interface GameOverInfo {
  loser: string;
  reason: string;
  title: string;
}

const LOG_COLORS: Record<GameLog['type'], string> = {
  receive: '#42A5F5',
  send: '#7CB342',
  challenge: '#FFB74D',
  gameOver: '#E57373',
  emote: '#8D6E63',
};

// ── ของกวนๆ ทั้งหลาย ──────────────────────────────────────────
const FUNNY_NAMES = [
  'เจ้าพ่อแมลงสาบ',
  'แม่มดหน้านิ่ง',
  'โกหกไม่เป็น(มั้ง)',
  'สายตรวจแมงมุม',
  'กบยิ้มยาก',
  'หนูไม่ได้โกง',
  'ค้างคาวกลางวัน',
  'เซียนบลัฟตัวพ่อ',
  'แมงป่องเจ้าเล่ห์',
  'นายจับเท็จ',
  'คุณชายหน้าตาย',
  'ป้าข้างบ้านรู้หมด',
];

const TAUNTS = [
  'หน้าตายมากพี่',
  'โกหกชัวร์ 100%',
  'อย่าหลอกกันดิ๊',
  'ตาสั่นแล้วนะ',
  'เชื่อก็บ้าแล้ว',
  'ส่งมาเลย ไม่กลัว',
  'แมลงสาบอีกแล้วเหรอ',
  'คิดนานจัง เปิดโพยอยู่ป่ะ',
];

const LIAR_QUOTES = [
  'เคล็ดลับ: โกหกสลับพูดจริง เพื่อนจะงงจนเลิกคบ',
  'ผู้เชี่ยวชาญบอกว่าการจ้องตาช่วยจับโกหกได้... หรือแค่ทำให้เขิน',
  'แมลงสาบไม่เคยทำร้ายใคร นอกจากมิตรภาพของคุณ',
  'อย่าเชื่อคนที่พูดว่า "เชื่อผมดิ"',
  'หน้านิ่งไม่ใช่พรสวรรค์ แต่คือการฝึกฝน',
  'ถ้าเพื่อนยิ้มแปลว่าโกหก ถ้าหน้านิ่ง...ก็โกหกเหมือนกัน',
];

const LOSER_TITLES = [
  'ราชาแมลงสาบแห่งปี',
  'นักสะสมตัวยง (แบบไม่ตั้งใจ)',
  'ตำนานคนโดนหลอก',
  'ผู้พิทักษ์สวนสัตว์จำเป็น',
  'เจ้าของฟาร์มคนใหม่',
  'หน้าไม่นิ่งจนโดนอ่านขาด',
];

const DETECTOR_VERDICTS = [
  'โกหกแน่นอน... มั้ง',
  'พูดจริง 51% โกหก 49%',
  'เครื่องขอไม่ฟันธง',
  'ตรวจพบนิ้วสั่นขณะส่งการ์ด: น่าจะโกหก',
  'หน้าซื่อขนาดนี้... จริงแหละ (หรือเปล่า)',
  'ERROR 418: ความกวนเกินขีดจำกัด',
];

const randomOf = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// ── จำตัวตนผู้เล่นไว้ใน localStorage เพื่อให้กลับเข้าห้องเดิมได้หลังหลุด/ปิดเว็บ ──
const SESSION_KEY = 'klp_session_id';
const LAST_ROOM_KEY = 'klp_last_room';
const LAST_ROOM_TTL_MS = 3 * 60 * 60 * 1000; // จำห้องล่าสุดไว้ 3 ชั่วโมง

function getSessionId(): string {
  try {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
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

export default function GamePage() {
  const socketRef = useRef<Socket | null>(null);
  const [playerName, setPlayerName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [currentRoomId, setCurrentRoomId] = useState('');
  const [playerId, setPlayerId] = useState('');
  const [room, setRoom] = useState<Room | null>(null);
  const [myCards, setMyCards] = useState<Card[]>([]);
  const [gameState, setGameState] = useState<'lobby' | 'waiting' | 'playing'>('lobby');
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [selectedAnimal, setSelectedAnimal] = useState<string>('แมลงสาบ');
  const [message, setMessage] = useState('');
  const [currentAction, setCurrentAction] = useState<CurrentAction | null>(null);
  const [gameLogs, setGameLogs] = useState<GameLog[]>([]);
  const [sortCards, setSortCards] = useState<boolean>(false);

  // ── ฟีเจอร์กวนๆ ──
  const [emotes, setEmotes] = useState<EmoteBubble[]>([]);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [detectorState, setDetectorState] = useState<'idle' | 'scanning' | 'done'>('idle');
  const [detectorVerdict, setDetectorVerdict] = useState('');
  const [gameOverInfo, setGameOverInfo] = useState<GameOverInfo | null>(null);
  const [copied, setCopied] = useState(false);

  // ── แชทในห้อง (ล้างทิ้งเมื่อจบเกม) ──
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');

  // Refs for auto-scrolling (เลื่อนเฉพาะในกล่อง ไม่เลื่อนทั้งหน้า)
  const logsBoxRef = useRef<HTMLDivElement>(null);
  const challengeActionsRef = useRef<HTMLDivElement>(null);
  const chatBoxRef = useRef<HTMLDivElement>(null);

  // Refs สำหรับ auto-rejoin — ให้ handler ใน socket effect อ่านค่าล่าสุดได้เสมอ
  const sessionIdRef = useRef('');
  const currentRoomIdRef = useRef('');
  const playerNameRef = useRef('');

  const ANIMALS = ['แมลงสาบ', 'หนู', 'แมลงวัน', 'แมงป่อง', 'แมลงเขียว', 'แมงมุม', 'ค้างคาว', 'กบ'];

  const addLog = (type: GameLog['type'], message: string) => {
    setGameLogs(prev => [...prev, {
      id: Date.now() + Math.random(),
      type,
      message,
      timestamp: new Date()
    }]);
  };

  // Auto-scroll ไปที่ log ล่าสุด — เลื่อนแค่ในกล่อง log ไม่ดึงทั้งหน้าขึ้นไป
  useEffect(() => {
    const el = logsBoxRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [gameLogs]);

  // Auto-scroll ไปที่ข้อความแชทล่าสุด — เลื่อนแค่ในกล่องแชทเช่นกัน
  useEffect(() => {
    const el = chatBoxRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [chatMessages]);

  // หมุนคำคมนักโกหกทุก 6 วินาที
  useEffect(() => {
    const timer = setInterval(() => setQuoteIndex((i) => (i + 1) % LIAR_QUOTES.length), 6000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Initialize Socket.IO API endpoint first
    fetch('/api/socketio');

    sessionIdRef.current = getSessionId();

    // Use the same host as the current page for Socket.IO connection
    const socketUrl = typeof window !== 'undefined'
      ? `${window.location.protocol}//${window.location.host}`
      : 'http://localhost:3002';

    const newSocket = io(socketUrl, {
      path: '/api/socketio',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000
    });

    socketRef.current = newSocket;

    newSocket.on('connect', () => {
      console.log('Connected to server at:', socketUrl);

      // เคยอยู่ในห้อง (หลุดชั่วคราว หรือปิดเว็บแล้วกลับมา) → กลับเข้าห้องเดิมอัตโนมัติ
      const saved = readSavedRoom();
      if (saved?.playerName) {
        // เติมชื่อเดิมในช่องกรอกให้ (เฉพาะตอนที่ยังไม่ได้พิมพ์อะไรไว้)
        setPlayerName(prev => prev || saved.playerName);
      }
      const target = currentRoomIdRef.current
        ? { roomId: currentRoomIdRef.current, playerName: playerNameRef.current }
        : saved;
      if (target?.roomId) {
        newSocket.emit('joinRoom', {
          roomId: target.roomId,
          playerName: target.playerName,
          sessionId: sessionIdRef.current
        });
      }
    });

    newSocket.on('roomCreated', ({ roomId, playerId, playerName: joinedName }) => {
      currentRoomIdRef.current = roomId;
      playerNameRef.current = joinedName || '';
      saveRoom(roomId, joinedName || '');
      setCurrentRoomId(roomId);
      setPlayerId(playerId);
      setGameState('waiting');
      setMessage(`สร้างห้อง ${roomId} สำเร็จ! แชร์รหัสนี้ให้เพื่อน`);
    });

    newSocket.on('roomJoined', ({ roomId, playerId, playerName: joinedName, rejoined }) => {
      currentRoomIdRef.current = roomId;
      playerNameRef.current = joinedName || '';
      saveRoom(roomId, joinedName || '');
      setCurrentRoomId(roomId);
      setPlayerId(playerId);
      setGameState('waiting');
      setMessage(rejoined ? 'กลับเข้าห้องเดิมสำเร็จ!' : 'เข้าร่วมห้องสำเร็จ!');
    });

    newSocket.on('joinFailed', ({ reason }) => {
      // ห้องเดิมไม่อยู่แล้ว (หรือเข้าไม่ได้) → ล้างค่าที่จำไว้ กลับหน้า lobby
      clearSavedRoom();
      currentRoomIdRef.current = '';
      setCurrentRoomId('');
      setRoom(null);
      setGameState('lobby');
      setMessage(reason);
    });

    newSocket.on('roomUpdate', (updatedRoom) => {
      setRoom(updatedRoom);
      // เกมถูกยกเลิก/จบไปแล้วระหว่างที่เราหลุด → กลับไปหน้าห้องรอ
      if (updatedRoom && !updatedRoom.gameStarted) {
        setGameState(prev => (prev === 'playing' ? 'waiting' : prev));
      }
    });

    newSocket.on('gameCancelled', ({ message: cancelMessage }) => {
      setCurrentAction(null);
      setGameState('waiting');
      setMessage(cancelMessage);
    });

    newSocket.on('playerDisconnected', ({ playerName: leftName }) => {
      setMessage(`${leftName} หลุดการเชื่อมต่อ กำลังรอกลับเข้ามา...`);
    });

    newSocket.on('gameStarted', (updatedRoom) => {
      setRoom(updatedRoom);
      setGameState('playing');
      setMessage('เกมเริ่มแล้ว! หน้านิ่งเข้าไว้');
      setGameLogs([]);
      setGameOverInfo(null);
    });

    newSocket.on('yourCards', (cards) => {
      setMyCards(cards);
    });

    newSocket.on('cardSent', (data) => {
      setMessage(`${data.from} ส่งไพ่ให้ ${data.to} โดยอ้างว่าเป็น ${data.claim}`);
      setCurrentAction(data);
      setDetectorState('idle');
      setDetectorVerdict('');
      addLog('receive', `${data.from} ส่งไพ่ให้ ${data.to} อ้างว่าเป็น ${data.claim}`);
    });

    newSocket.on('challengeResult', (result) => {
      setMessage(result.message);
      setCurrentAction(null);
      addLog('challenge', `${result.message} (จริง: ${result.actualAnimal}, อ้าง: ${result.claimedAnimal})`);
    });

    newSocket.on('gameOver', (data) => {
      const title = randomOf(LOSER_TITLES);
      const displayMessage = `จบเกม! ${data.loser} แพ้เพราะ${data.reason}`;

      setMessage(displayMessage);
      setGameState('waiting');
      setGameOverInfo({ loser: data.loser, reason: data.reason, title });
      addLog('gameOver', `${displayMessage} — ได้รับฉายา "${title}"`);
    });

    newSocket.on('emote', (data: { from: string; fromId: string; text: string }) => {
      const bubble: EmoteBubble = { id: Date.now() + Math.random(), from: data.from, text: data.text };
      setEmotes(prev => [...prev.slice(-3), bubble]);
      addLog('emote', `${data.from}: "${data.text}"`);
      setTimeout(() => {
        setEmotes(prev => prev.filter(e => e.id !== bubble.id));
      }, 4200);
    });

    newSocket.on('chatMessage', (msg: ChatMessage) => {
      setChatMessages(prev => [...prev.slice(-99), msg]);
    });

    newSocket.on('chatHistory', (messages: ChatMessage[]) => {
      setChatMessages(messages);
    });

    newSocket.on('chatCleared', () => {
      setChatMessages([]);
    });

    newSocket.on('playerLeft', (data) => {
      setMessage(`${data.playerName} ออกจากห้อง (หนีความพ่ายแพ้สินะ)`);
    });

    newSocket.on('error', (msg) => {
      setMessage(msg);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const createRoom = () => {
    if (!playerName.trim()) {
      setMessage('กรุณาใส่ชื่อของคุณ (หรือกดลูกเต๋าให้ระบบตั้งให้)');
      return;
    }
    socketRef.current?.emit('createRoom', { playerName, sessionId: sessionIdRef.current });
  };

  const joinRoom = () => {
    if (!playerName.trim() || !roomId.trim()) {
      setMessage('กรุณาใส่ชื่อและรหัสห้อง');
      return;
    }
    socketRef.current?.emit('joinRoom', { roomId: roomId.toUpperCase(), playerName, sessionId: sessionIdRef.current });
  };

  const startGame = () => {
    socketRef.current?.emit('startGame', { roomId: currentRoomId });
  };

  const sendCard = () => {
    if (!selectedCard || !selectedPlayer) {
      setMessage('กรุณาเลือกไพ่และผู้เล่นที่จะส่งให้');
      return;
    }
    socketRef.current?.emit('sendCard', {
      roomId: currentRoomId,
      targetPlayerId: selectedPlayer,
      cardId: selectedCard,
      claimedAnimal: selectedAnimal
    });
    setSelectedCard(null);
    setSelectedPlayer(null);
  };

  const handleChallenge = (guessIsLie: boolean) => {
    socketRef.current?.emit('challenge', { roomId: currentRoomId, guessIsLie });
    setDetectorState('idle');
    setDetectorVerdict('');
  };

  const sendTaunt = (text: string) => {
    socketRef.current?.emit('sendEmote', { roomId: currentRoomId, text });
  };

  const sendChat = () => {
    const text = chatInput.trim();
    if (!text) return;
    socketRef.current?.emit('sendChatMessage', { roomId: currentRoomId, text });
    setChatInput('');
  };

  const rollFunnyName = () => {
    setPlayerName(randomOf(FUNNY_NAMES));
  };

  const copyRoomCode = useCallback(() => {
    navigator.clipboard?.writeText(currentRoomId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [currentRoomId]);

  // เครื่องจับโกหก (ความแม่นยำระดับเหรียญเสี่ยงทาย)
  const runLieDetector = () => {
    if (detectorState === 'scanning') return;
    setDetectorState('scanning');
    setDetectorVerdict('');
    setTimeout(() => {
      setDetectorVerdict(randomOf(DETECTOR_VERDICTS));
      setDetectorState('done');
    }, 1700);
  };

  const getAnimalImage = (animal: string) => {
    const imageMap: { [key: string]: string } = {
      'แมลงสาบ': '/Cockroach.png',
      'หนู': '/Rat.png',
      'แมลงเขียว': '/Cricket.png',
      'แมงมุม': '/Spider.png',
      'แมลงวัน': '/Fly.png',
      'ค้างคาว': '/Bat.png',
      'กบ': '/Frog.png',
      'แมงป่อง': '/Scorpion.png'
    };
    return imageMap[animal] || '/Cockroach.png';
  };

  const isMyTurn = room?.currentPlayer === playerId;

  // Auto-scroll ไปที่ challenge actions เมื่อได้รับไพ่
  useEffect(() => {
    if (isMyTurn && currentAction && currentAction.toId === playerId) {
      setTimeout(() => {
        challengeActionsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [currentAction, isMyTurn, playerId]);

  // ─── shared style ───────────────────────────────────────────────────────────
  const softCard = {
    bgcolor: '#FFFFFF',
    border: '1px solid rgba(55,71,79,0.08)',
    borderRadius: '1.5rem',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  };

  // ── กล่องแชทในห้อง (ใช้ทั้งห้องรอและตอนเล่น) ──
  const chatPanel = (
    <Paper elevation={0} sx={{ ...softCard, p: 2.5, display: 'flex', flexDirection: 'column' }}>
      <Typography
        component="div"
        variant="h6"
        fontWeight={700}
        sx={{ mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}
      >
        <ForumRoundedIcon sx={{ color: '#42A5F5' }} />
        แชทในห้อง
      </Typography>
      <Typography variant="caption" sx={{ color: '#B0BEC5', mb: 1.5 }}>
        เห็นเฉพาะคนในห้องนี้ และจะถูกล้างเมื่อจบเกม
      </Typography>

      <Box
        ref={chatBoxRef}
        sx={{
          height: 220,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          mb: 1.5,
          pr: 0.5,
          '&::-webkit-scrollbar': { width: 4 },
          '&::-webkit-scrollbar-track': { bgcolor: 'rgba(55,71,79,0.05)', borderRadius: 2 },
          '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(66,165,245,0.4)', borderRadius: 2 },
        }}
      >
        {chatMessages.length === 0 ? (
          <Typography
            variant="body2"
            sx={{ color: '#B0BEC5', textAlign: 'center', fontStyle: 'italic', py: 4 }}
          >
            ยังไม่มีข้อความ ทักไปเลย อย่าอาย
          </Typography>
        ) : (
          chatMessages.map((msg) => {
            const mine = msg.fromId === playerId;
            return (
              <Box key={msg.id} sx={{ alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                <Box
                  sx={{
                    px: 1.5,
                    py: 0.8,
                    borderRadius: mine ? '1rem 1rem 0.25rem 1rem' : '1rem 1rem 1rem 0.25rem',
                    bgcolor: mine ? 'rgba(124,179,66,0.15)' : 'rgba(55,71,79,0.05)',
                    border: mine ? '1px solid rgba(124,179,66,0.35)' : '1px solid rgba(55,71,79,0.08)',
                  }}
                >
                  {!mine && (
                    <Typography variant="caption" fontWeight={700} sx={{ color: '#8D6E63', display: 'block' }}>
                      {msg.from}
                    </Typography>
                  )}
                  <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                    {msg.text}
                  </Typography>
                </Box>
              </Box>
            );
          })
        )}
      </Box>

      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          size="small"
          fullWidth
          placeholder="พิมพ์ข้อความ..."
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendChat();
            }
          }}
          inputProps={{ maxLength: 200 }}
        />
        <IconButton
          onClick={sendChat}
          disabled={!chatInput.trim()}
          sx={{
            bgcolor: '#42A5F5',
            color: '#fff',
            borderRadius: '0.75rem',
            '&:hover': { bgcolor: '#1E88E5' },
            '&.Mui-disabled': { bgcolor: 'rgba(55,71,79,0.08)', color: '#B0BEC5' },
          }}
        >
          <SendRoundedIcon fontSize="small" />
        </IconButton>
      </Box>
    </Paper>
  );

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        background: 'linear-gradient(180deg, #DCEFFB 0%, #EAF5E3 45%, #FAFAFA 100%)',
        color: '#37474F',
        fontFamily: "'Kanit', sans-serif",
        pb: gameState === 'playing' ? 12 : 4,
      }}
    >
      {/* ── TOP BAR ── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1.5,
          py: 1.5,
          px: 3,
          bgcolor: 'rgba(250,250,250,0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(55,71,79,0.08)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/Cockroach.png" alt="" style={{ width: 30, height: 30, objectFit: 'contain' }} />
        <Typography variant="h6" fontWeight={700} sx={{ letterSpacing: '-0.01em' }}>
          Kaker Laken <Box component="span" sx={{ color: '#7CB342' }}>Poker</Box>
        </Typography>
        {currentRoomId && (
          <Chip
            label={`ห้อง ${currentRoomId}`}
            size="small"
            sx={{ ml: 1, bgcolor: 'rgba(124,179,66,0.15)', color: '#558B2F' }}
          />
        )}
      </Box>

      <Box sx={{ maxWidth: 1400, mx: 'auto', p: { xs: 2, md: 3 } }}>
        {/* ── MESSAGE ALERT ── */}
        {message && (
          <Alert
            severity="info"
            icon={false}
            sx={{
              mb: 3,
              bgcolor: 'rgba(66,165,245,0.1)',
              color: '#1E88E5',
              border: '1px solid rgba(66,165,245,0.3)',
              fontWeight: 500,
              fontSize: '0.95rem',
              animation: 'riseIn 300ms ease-out',
            }}
          >
            {message}
          </Alert>
        )}

        {/* ══════════════════ LOBBY ══════════════════ */}
        {gameState === 'lobby' && (
          <Box sx={{ maxWidth: 480, mx: 'auto', mt: 6, animation: 'riseIn 540ms ease-out' }}>
            <Paper elevation={0} sx={{ ...softCard, p: { xs: 4, md: 5 }, position: 'relative', overflow: 'visible' }}>
              {/* mascot on the roof */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/Frog.png"
                alt=""
                style={{
                  position: 'absolute',
                  top: -38,
                  right: 28,
                  width: 64,
                  height: 64,
                  objectFit: 'contain',
                  animation: 'bob 3.2s ease-in-out infinite',
                  filter: 'drop-shadow(0 8px 8px rgba(55,71,79,0.2))',
                }}
              />
              <Typography variant="h4" fontWeight={700} textAlign="center" sx={{ mb: 1 }}>
                เข้าร่วมเกม
              </Typography>
              <Typography variant="body2" textAlign="center" sx={{ color: '#78909C', mb: 4 }}>
                สร้างห้องใหม่หรือเข้าร่วมห้องของเพื่อน
              </Typography>

              <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                <TextField
                  label="ชื่อของคุณ"
                  fullWidth
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                />
                <Tooltip title="ขี้เกียจคิดชื่อ? กดเลย" placement="top">
                  <IconButton
                    onClick={rollFunnyName}
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: '1rem',
                      bgcolor: 'rgba(255,204,128,0.35)',
                      color: '#8D6E63',
                      '&:hover': { bgcolor: 'rgba(255,204,128,0.6)', transform: 'rotate(20deg)' },
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
                size="large"
                startIcon={<GroupAddRoundedIcon />}
                onClick={createRoom}
                sx={{ mb: 3, py: 1.6, fontSize: '1.05rem' }}
              >
                สร้างห้องใหม่
              </Button>

              <Divider sx={{ mb: 3 }}>
                <Chip label="หรือ" size="small" sx={{ bgcolor: 'rgba(124,179,66,0.12)', color: '#558B2F' }} />
              </Divider>

              <TextField
                label="รหัสห้อง"
                fullWidth
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                sx={{ mb: 2 }}
                inputProps={{ style: { textTransform: 'uppercase', letterSpacing: 4, fontWeight: 700 } }}
              />
              <Button
                variant="outlined"
                fullWidth
                size="large"
                color="secondary"
                onClick={joinRoom}
                sx={{ py: 1.6, fontSize: '1.05rem' }}
              >
                เข้าร่วมห้อง
              </Button>
            </Paper>

            {/* คำคมนักโกหกหมุนเวียน */}
            <Typography
              key={quoteIndex}
              variant="body2"
              textAlign="center"
              sx={{ mt: 3, color: '#9E9E9E', fontStyle: 'italic', animation: 'riseIn 540ms ease-out' }}
            >
              &quot;{LIAR_QUOTES[quoteIndex]}&quot;
            </Typography>
          </Box>
        )}

        {/* ══════════════════ WAITING ROOM ══════════════════ */}
        {gameState === 'waiting' && room && (
          <Box sx={{ maxWidth: 600, mx: 'auto', mt: 6, animation: 'riseIn 540ms ease-out' }}>
            <Paper elevation={0} sx={{ ...softCard, p: { xs: 4, md: 5 } }}>
              <Typography variant="h4" fontWeight={700} textAlign="center" sx={{ mb: 1 }}>
                ห้องรอเพื่อน
              </Typography>
              <Typography variant="body2" textAlign="center" sx={{ color: '#78909C', mb: 4 }}>
                แชร์รหัสนี้ให้เพื่อนเพื่อเข้าร่วมเกม
              </Typography>

              <Paper
                elevation={0}
                sx={{
                  bgcolor: 'rgba(255,204,128,0.2)',
                  border: '2px dashed #FFB74D',
                  borderRadius: '1.5rem',
                  boxShadow: 'none',
                  p: 3,
                  mb: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 2,
                }}
              >
                <Typography variant="h3" fontWeight={700} sx={{ color: '#8D6E63', letterSpacing: 6 }}>
                  {currentRoomId}
                </Typography>
                <Tooltip title={copied ? 'คัดลอกแล้ว!' : 'คัดลอกรหัส'} placement="top">
                  <IconButton onClick={copyRoomCode} sx={{ color: copied ? '#7CB342' : '#8D6E63' }}>
                    {copied ? <CheckRoundedIcon /> : <ContentCopyRoundedIcon />}
                  </IconButton>
                </Tooltip>
              </Paper>

              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                ผู้เล่น ({room.players.length}/6)
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 4 }}>
                {room.players.map((player, i) => (
                  <Box
                    key={player.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      p: 2,
                      bgcolor: player.id === playerId ? 'rgba(124,179,66,0.1)' : 'rgba(55,71,79,0.03)',
                      borderRadius: '1rem',
                      border: player.id === playerId ? '1.5px solid rgba(124,179,66,0.5)' : '1.5px solid transparent',
                      animation: `riseIn 540ms ease-out ${i * 120}ms backwards`,
                    }}
                  >
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        bgcolor: i === 0 ? '#FFCC80' : 'rgba(55,71,79,0.08)',
                        color: i === 0 ? '#8D6E63' : '#78909C',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        flexShrink: 0,
                      }}
                    >
                      {i === 0 ? <StarRoundedIcon fontSize="small" /> : i + 1}
                    </Box>
                    <Typography component="div" fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {player.name}
                      {player.id === playerId && (
                        <Chip
                          label="คุณ"
                          size="small"
                          sx={{ bgcolor: '#7CB342', color: '#fff', height: 20, fontSize: '0.7rem' }}
                        />
                      )}
                      {player.disconnected && (
                        <Chip
                          label="หลุดการเชื่อมต่อ"
                          size="small"
                          sx={{ bgcolor: 'rgba(229,115,115,0.15)', color: '#E57373', height: 20, fontSize: '0.7rem' }}
                        />
                      )}
                    </Typography>
                  </Box>
                ))}
              </Box>

              {room.players[0]?.id === playerId ? (
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  startIcon={<PlayArrowRoundedIcon />}
                  onClick={startGame}
                  disabled={room.players.length < 2}
                  sx={{ py: 1.6, fontSize: '1.1rem' }}
                >
                  {room.players.length < 2
                    ? `รอผู้เล่นเพิ่ม (${room.players.length}/2)`
                    : 'เริ่มเกม!'}
                </Button>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                  <CircularProgress size={20} sx={{ color: '#7CB342' }} />
                  <Typography sx={{ color: '#78909C' }}>รอให้โฮสต์เริ่มเกม...</Typography>
                </Box>
              )}
            </Paper>

            <Box sx={{ mt: 3, animation: 'riseIn 540ms ease-out 200ms backwards' }}>
              {chatPanel}
            </Box>

            <Typography
              key={quoteIndex}
              variant="body2"
              textAlign="center"
              sx={{ mt: 3, color: '#9E9E9E', fontStyle: 'italic', animation: 'riseIn 540ms ease-out' }}
            >
              &quot;{LIAR_QUOTES[quoteIndex]}&quot;
            </Typography>
          </Box>
        )}

        {/* ══════════════════ PLAYING ══════════════════ */}
        {gameState === 'playing' && room && (
          <Box
            sx={{
              display: 'flex',
              gap: 3,
              alignItems: 'flex-start',
              flexDirection: { xs: 'column', lg: 'row' },
            }}
          >
            {/* ── MAIN GAME AREA ── */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              {/* Players Grid */}
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2, mb: 3 }}>
                {room.players.map((player, pi) => {
                  const isActive = player.id === room.currentPlayer;
                  const isMe = player.id === playerId;
                  const animalCount: { [key: string]: number } = {};
                  player.deadCards.forEach((card) => {
                    animalCount[card.animal] = (animalCount[card.animal] || 0) + 1;
                  });
                  const hasFour = Object.values(animalCount).some((c) => c >= 4);
                  const nearFour = Object.values(animalCount).some((c) => c === 3);

                  return (
                    <Paper
                      key={player.id}
                      elevation={0}
                      sx={{
                        ...softCard,
                        p: 2.5,
                        border: isActive
                          ? '2px solid #7CB342'
                          : isMe
                          ? '2px solid rgba(66,165,245,0.5)'
                          : '1px solid rgba(55,71,79,0.08)',
                        boxShadow: isActive ? '0 8px 24px rgba(124,179,66,0.25)' : '0 2px 12px rgba(0,0,0,0.06)',
                        transform: isActive ? 'scale(1.02)' : 'scale(1)',
                        transition: 'all 300ms var(--spring)',
                        animation: `riseIn 540ms ease-out ${pi * 120}ms backwards`,
                        ...(nearFour && !hasFour ? { animation: 'dangerPulse 1.6s ease-in-out infinite' } : {}),
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                        <Typography component="div" fontWeight={700} sx={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 1 }}>
                          {player.name}
                          {isMe && (
                            <Chip
                              label="คุณ"
                              size="small"
                              sx={{ bgcolor: '#42A5F5', color: '#fff', height: 18, fontSize: '0.65rem' }}
                            />
                          )}
                          {player.disconnected && (
                            <Chip
                              label="หลุด"
                              size="small"
                              sx={{ bgcolor: 'rgba(229,115,115,0.15)', color: '#E57373', height: 18, fontSize: '0.65rem' }}
                            />
                          )}
                        </Typography>
                        {isActive && (
                          <Chip
                            label="ตานี้"
                            size="small"
                            sx={{ bgcolor: '#7CB342', color: '#fff', fontSize: '0.7rem' }}
                          />
                        )}
                      </Box>

                      <Box sx={{ display: 'flex', gap: 1.5, mb: player.deadCards.length > 0 ? 2 : 0 }}>
                        <Box sx={{ flex: 1, bgcolor: 'rgba(66,165,245,0.08)', borderRadius: '1rem', p: 1.2, textAlign: 'center' }}>
                          <Typography variant="caption" sx={{ color: '#78909C' }}>
                            ไพ่ในมือ
                          </Typography>
                          <Typography variant="h5" fontWeight={700} sx={{ color: '#1E88E5' }}>
                            {isMe ? myCards.length : player.cards.length}
                          </Typography>
                        </Box>
                        <Box sx={{ flex: 1, bgcolor: hasFour ? 'rgba(229,115,115,0.12)' : 'rgba(255,204,128,0.2)', borderRadius: '1rem', p: 1.2, textAlign: 'center' }}>
                          <Typography variant="caption" sx={{ color: '#78909C' }}>
                            ไพ่สะสม
                          </Typography>
                          <Typography variant="h5" fontWeight={700} sx={{ color: hasFour ? '#E57373' : '#8D6E63' }}>
                            {player.deadCards.length}
                          </Typography>
                        </Box>
                      </Box>

                      {player.deadCards.length > 0 && (
                        <>
                          <Divider sx={{ mb: 1.5 }} />
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {Object.entries(animalCount).map(([animal, count]) => (
                              <Tooltip key={animal} title={animal} placement="top">
                                <Box
                                  sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: 0.3,
                                    p: 0.6,
                                    borderRadius: '0.75rem',
                                    bgcolor: count >= 4 ? 'rgba(229,115,115,0.15)' : count === 3 ? 'rgba(255,204,128,0.3)' : 'rgba(55,71,79,0.04)',
                                    border: count >= 4 ? '1.5px solid #E57373' : count === 3 ? '1.5px solid #FFB74D' : '1.5px solid transparent',
                                  }}
                                >
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={getAnimalImage(animal)}
                                    alt={animal}
                                    style={{ width: 34, height: 34, objectFit: 'contain' }}
                                  />
                                  <Typography
                                    variant="caption"
                                    fontWeight={700}
                                    sx={{
                                      color: count >= 4 ? '#E57373' : count === 3 ? '#EF6C00' : '#78909C',
                                      lineHeight: 1,
                                      fontSize: '0.7rem',
                                    }}
                                  >
                                    ×{count}
                                  </Typography>
                                </Box>
                              </Tooltip>
                            ))}
                          </Box>
                          {(hasFour || nearFour) && (
                            <Box
                              sx={{
                                mt: 1.5,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                p: 1,
                                borderRadius: '0.75rem',
                                bgcolor: hasFour ? 'rgba(229,115,115,0.12)' : 'rgba(255,204,128,0.25)',
                              }}
                            >
                              <WarningAmberRoundedIcon sx={{ fontSize: 18, color: hasFour ? '#E57373' : '#EF6C00' }} />
                              <Typography variant="caption" fontWeight={600} sx={{ color: hasFour ? '#E57373' : '#EF6C00' }}>
                                {hasFour ? 'มีสัตว์ 4 ตัวเหมือนกันแล้ว!' : 'อีกใบเดียวจะครบ 4 — ลุ้นหนักมาก'}
                              </Typography>
                            </Box>
                          )}
                        </>
                      )}
                    </Paper>
                  );
                })}
              </Box>

              {/* ── MY CARDS ── */}
              <Paper elevation={0} sx={{ ...softCard, p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography component="div" variant="h6" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <StyleRoundedIcon sx={{ color: '#7CB342' }} />
                    ไพ่ในมือของคุณ
                    <Chip
                      label={myCards.length}
                      size="small"
                      sx={{ bgcolor: '#7CB342', color: '#fff', fontWeight: 700, height: 22 }}
                    />
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        size="small"
                        checked={sortCards}
                        onChange={(e) => setSortCards(e.target.checked)}
                        color="primary"
                      />
                    }
                    label={<Typography variant="caption">จัดเรียงไพ่</Typography>}
                  />
                </Box>

                {myCards.length === 0 ? (
                  <Typography sx={{ color: '#B0BEC5', textAlign: 'center', py: 3 }}>
                    ไม่มีไพ่ในมือ
                  </Typography>
                ) : (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, justifyContent: 'center' }}>
                    {(sortCards
                      ? [...myCards].sort((a, b) => a.animal.localeCompare(b.animal, 'th'))
                      : myCards
                    ).map((card) => {
                      const isSelected = selectedCard === card.id;
                      const clickable = isMyTurn && !currentAction;
                      return (
                        <Tooltip key={card.id} title={card.animal} placement="top">
                          <Paper
                            elevation={0}
                            onClick={() => clickable && setSelectedCard(isSelected ? null : card.id)}
                            sx={{
                              position: 'relative',
                              width: 88,
                              py: 1.5,
                              px: 1,
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: 0.5,
                              borderRadius: '1rem',
                              cursor: clickable ? 'pointer' : 'default',
                              border: isSelected ? '2px solid #7CB342' : '1.5px solid rgba(55,71,79,0.1)',
                              bgcolor: isSelected ? 'rgba(124,179,66,0.08)' : '#fff',
                              boxShadow: isSelected
                                ? '0 12px 24px rgba(124,179,66,0.3)'
                                : '0 2px 8px rgba(0,0,0,0.06)',
                              transform: isSelected ? 'translateY(-10px)' : 'none',
                              transition: 'all 200ms var(--spring)',
                              '&:hover': clickable && !isSelected
                                ? { transform: 'translateY(-6px) scale(1.03)', boxShadow: '0 8px 16px rgba(55,71,79,0.15)' }
                                : {},
                            }}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={getAnimalImage(card.animal)}
                              alt={card.animal}
                              style={{
                                width: 56,
                                height: 56,
                                objectFit: 'contain',
                                animation: isSelected ? 'wobble 0.6s ease-in-out infinite' : 'none',
                              }}
                            />
                            <Typography variant="caption" fontWeight={600} sx={{ color: '#78909C' }}>
                              {card.animal}
                            </Typography>
                            {isSelected && (
                              <Box
                                sx={{
                                  position: 'absolute',
                                  top: -9,
                                  right: -9,
                                  width: 24,
                                  height: 24,
                                  borderRadius: '50%',
                                  bgcolor: '#7CB342',
                                  color: '#fff',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  animation: 'popIn 300ms var(--spring)',
                                }}
                              >
                                <CheckRoundedIcon sx={{ fontSize: 16 }} />
                              </Box>
                            )}
                          </Paper>
                        </Tooltip>
                      );
                    })}
                  </Box>
                )}
              </Paper>

              {/* ── TURN ACTIONS ── */}
              {isMyTurn && myCards.length > 0 && !currentAction && selectedCard && (
                <Paper
                  elevation={0}
                  sx={{
                    ...softCard,
                    p: 3,
                    mb: 3,
                    border: '2px solid rgba(124,179,66,0.4)',
                    animation: 'riseIn 400ms ease-out',
                  }}
                >
                  <Typography variant="h6" fontWeight={700} textAlign="center" sx={{ mb: 3, color: '#558B2F' }}>
                    ตาของคุณ — จะอ้างว่าเป็นตัวอะไร แล้วส่งให้ใครดี?
                  </Typography>

                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5, color: '#78909C' }}>
                    อ้างว่าเป็น (โกหกได้นะ เขาไม่รู้หรอก):
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 3 }}>
                    {ANIMALS.map((animal) => (
                      <Button
                        key={animal}
                        variant={selectedAnimal === animal ? 'contained' : 'outlined'}
                        size="small"
                        onClick={() => setSelectedAnimal(animal)}
                        startIcon={
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={getAnimalImage(animal)}
                            alt={animal}
                            style={{ width: 20, height: 20, objectFit: 'contain' }}
                          />
                        }
                        sx={
                          selectedAnimal === animal
                            ? { px: 2 }
                            : {
                                px: 2,
                                borderColor: 'rgba(55,71,79,0.2)',
                                color: '#78909C',
                                '&:hover': { borderColor: '#7CB342', color: '#558B2F', bgcolor: 'rgba(124,179,66,0.06)' },
                              }
                        }
                      >
                        {animal}
                      </Button>
                    ))}
                  </Box>

                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5, color: '#78909C' }}>
                    ส่งให้เหยื่อคนไหน:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 3 }}>
                    {room.players
                      .filter((p) => p.id !== playerId)
                      .map((player) => (
                        <Button
                          key={player.id}
                          variant={selectedPlayer === player.id ? 'contained' : 'outlined'}
                          color="secondary"
                          onClick={() => setSelectedPlayer(player.id)}
                          sx={
                            selectedPlayer === player.id
                              ? { px: 3 }
                              : {
                                  px: 3,
                                  borderColor: 'rgba(55,71,79,0.2)',
                                  color: '#78909C',
                                  '&:hover': { borderColor: '#42A5F5', color: '#1E88E5', bgcolor: 'rgba(66,165,245,0.06)' },
                                }
                          }
                        >
                          {player.name}
                        </Button>
                      ))}
                  </Box>

                  <Button
                    variant="contained"
                    color="secondary"
                    fullWidth
                    size="large"
                    endIcon={<SendRoundedIcon />}
                    onClick={sendCard}
                    disabled={!selectedPlayer}
                    sx={{ py: 1.6, fontSize: '1.05rem' }}
                  >
                    ส่งไพ่พร้อมหน้านิ่งที่สุดในชีวิต
                  </Button>
                </Paper>
              )}

              {/* ── CHALLENGE ACTIONS ── */}
              {isMyTurn && currentAction && currentAction.toId === playerId && (
                <Paper
                  ref={challengeActionsRef}
                  elevation={0}
                  sx={{
                    ...softCard,
                    p: { xs: 3, md: 4 },
                    mb: 3,
                    border: '2px solid #FFB74D',
                    boxShadow: '0 12px 32px rgba(255,183,77,0.25)',
                    textAlign: 'center',
                    animation: 'popIn 400ms var(--spring)',
                  }}
                >
                  <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
                    คุณได้รับไพ่ปริศนา!
                  </Typography>
                  <Typography component="div" variant="body1" sx={{ mb: 2, color: '#78909C' }}>
                    <Box component="strong" sx={{ color: '#37474F' }}>{currentAction.from}</Box> บอกว่ามันคือ...
                  </Typography>

                  {/* claimed animal card */}
                  <Paper
                    elevation={0}
                    sx={{
                      display: 'inline-flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 1,
                      px: 4,
                      py: 2.5,
                      mb: 3,
                      borderRadius: '1.5rem',
                      bgcolor: 'rgba(255,204,128,0.2)',
                      border: '2px dashed #FFB74D',
                      boxShadow: 'none',
                      animation: 'bob 3s ease-in-out infinite',
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getAnimalImage(currentAction.claim)}
                      alt={currentAction.claim}
                      style={{ width: 84, height: 84, objectFit: 'contain' }}
                    />
                    <Typography variant="h6" fontWeight={700} sx={{ color: '#8D6E63' }}>
                      {currentAction.claim}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#9E9E9E' }}>
                      (ตามคำกล่าวอ้าง... ซึ่งอาจมั่ว)
                    </Typography>
                  </Paper>

                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2, mb: 3 }}>
                    <Button
                      variant="contained"
                      fullWidth
                      size="large"
                      startIcon={<ClearRoundedIcon />}
                      onClick={() => handleChallenge(true)}
                      sx={{
                        py: 1.8,
                        fontSize: '1.05rem',
                        bgcolor: '#E57373',
                        '&:hover': { bgcolor: '#D66161', boxShadow: '0 6px 16px rgba(229,115,115,0.35)', transform: 'translateY(-2px)' },
                      }}
                    >
                      โกหกชัดๆ!
                    </Button>
                    <Button
                      variant="contained"
                      fullWidth
                      size="large"
                      startIcon={<CheckRoundedIcon />}
                      onClick={() => handleChallenge(false)}
                      sx={{ py: 1.8, fontSize: '1.05rem' }}
                    >
                      เชื่อว่าจริง
                    </Button>
                  </Box>

                  {/* ── เครื่องจับโกหก (กวนๆ) ── */}
                  <Divider sx={{ mb: 2 }}>
                    <Chip
                      label="ตัวช่วย (ที่ช่วยอะไรไม่ได้)"
                      size="small"
                      sx={{ bgcolor: 'rgba(141,110,99,0.1)', color: '#8D6E63', fontSize: '0.7rem' }}
                    />
                  </Divider>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={
                      <RadarRoundedIcon
                        sx={detectorState === 'scanning' ? { animation: 'needleSweep 0.8s ease-in-out infinite' } : {}}
                      />
                    }
                    onClick={runLieDetector}
                    disabled={detectorState === 'scanning'}
                    sx={{
                      borderColor: 'rgba(141,110,99,0.4)',
                      color: '#8D6E63',
                      '&:hover': { borderColor: '#8D6E63', bgcolor: 'rgba(141,110,99,0.06)' },
                    }}
                  >
                    {detectorState === 'scanning' ? 'กำลังสแกนความตอแหล...' : 'ใช้เครื่องจับโกหก (แม่นยำ 50/50)'}
                  </Button>
                  {detectorState === 'done' && detectorVerdict && (
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      sx={{ mt: 1.5, color: '#8D6E63', animation: 'popIn 400ms var(--spring)' }}
                    >
                      ผลวิเคราะห์: {detectorVerdict}
                    </Typography>
                  )}
                </Paper>
              )}

              {/* ── WAITING FOR TURN ── */}
              {!isMyTurn && (
                <Paper elevation={0} sx={{ ...softCard, p: 3, mb: 3, textAlign: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                    <CircularProgress size={20} sx={{ color: '#7CB342' }} />
                    <Typography component="div" variant="h6" fontWeight={500} sx={{ color: '#78909C' }}>
                      รอตาของ{' '}
                      <Box component="strong" sx={{ color: '#558B2F' }}>
                        {room.players.find((p) => p.id === room.currentPlayer)?.name}
                      </Box>
                      {' '}— ระหว่างนี้กดแซวได้ที่แถบด้านล่าง
                    </Typography>
                  </Box>
                </Paper>
              )}
            </Box>

            {/* ── LOGS SIDEBAR ── */}
            <Box sx={{ width: { xs: '100%', lg: 340 }, flexShrink: 0, order: { xs: -1, lg: 0 } }}>
              <Box
                sx={{
                  position: { lg: 'sticky' },
                  top: { lg: 80 },
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                }}
              >
              <Paper
                elevation={0}
                sx={{
                  ...softCard,
                  p: 2.5,
                  maxHeight: { xs: 280, lg: '42vh' },
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Typography
                  component="div"
                  variant="h6"
                  fontWeight={700}
                  sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}
                >
                  <HistoryRoundedIcon sx={{ color: '#7CB342' }} />
                  ประวัติการเล่น
                </Typography>

                <Box
                  ref={logsBoxRef}
                  sx={{
                    flex: 1,
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5,
                    pr: 0.5,
                    '&::-webkit-scrollbar': { width: 4 },
                    '&::-webkit-scrollbar-track': { bgcolor: 'rgba(55,71,79,0.05)', borderRadius: 2 },
                    '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(124,179,66,0.4)', borderRadius: 2 },
                  }}
                >
                  {gameLogs.length === 0 ? (
                    <Typography
                      variant="body2"
                      sx={{ color: '#B0BEC5', textAlign: 'center', fontStyle: 'italic', py: 4 }}
                    >
                      ยังไม่มีใครโกหกใคร... เดี๋ยวก็มี
                    </Typography>
                  ) : (
                    gameLogs.map((log) => (
                      <Box
                        key={log.id}
                        sx={{
                          p: 1.5,
                          borderRadius: '0.75rem',
                          bgcolor: `${LOG_COLORS[log.type]}14`,
                          borderLeft: `3px solid ${LOG_COLORS[log.type]}`,
                          animation: 'riseIn 300ms ease-out',
                        }}
                      >
                        <Typography variant="body2" sx={{ lineHeight: 1.5, mb: 0.5 }}>
                          {log.message}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#B0BEC5' }}>
                          {log.timestamp.toLocaleTimeString('th-TH', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </Typography>
                      </Box>
                    ))
                  )}
                </Box>
              </Paper>

              {chatPanel}
              </Box>
            </Box>
          </Box>
        )}
      </Box>

      {/* ══════════ TAUNT BAR (แถบแซวเพื่อน) ══════════ */}
      {gameState === 'playing' && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 200,
            bgcolor: 'rgba(250,250,250,0.9)',
            backdropFilter: 'blur(12px)',
            borderTop: '1px solid rgba(55,71,79,0.08)',
            px: 2,
            py: 1.5,
          }}
        >
          <Box sx={{ maxWidth: 1400, mx: 'auto', display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <TheaterComedyRoundedIcon sx={{ color: '#8D6E63', flexShrink: 0 }} />
            <Box
              sx={{
                display: 'flex',
                gap: 1,
                overflowX: 'auto',
                pb: 0.5,
                '&::-webkit-scrollbar': { height: 0 },
              }}
            >
              {TAUNTS.map((t) => (
                <Chip
                  key={t}
                  label={t}
                  onClick={() => sendTaunt(t)}
                  sx={{
                    bgcolor: '#fff',
                    border: '1.5px solid rgba(141,110,99,0.25)',
                    color: '#8D6E63',
                    flexShrink: 0,
                    cursor: 'pointer',
                    transition: 'all 200ms var(--spring)',
                    '&:hover': {
                      bgcolor: 'rgba(255,204,128,0.35)',
                      borderColor: '#FFB74D',
                      transform: 'translateY(-2px)',
                    },
                  }}
                />
              ))}
            </Box>
          </Box>
        </Box>
      )}

      {/* ══════════ EMOTE BUBBLES ══════════ */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 88,
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
          <Paper
            key={e.id}
            elevation={0}
            sx={{
              px: 2,
              py: 1,
              borderRadius: '1rem 1rem 1rem 0.25rem',
              bgcolor: '#fff',
              border: '1.5px solid rgba(141,110,99,0.3)',
              boxShadow: '0 8px 24px rgba(55,71,79,0.15)',
              animation: 'bubbleUp 4.2s ease-in-out forwards',
            }}
          >
            <Typography variant="caption" fontWeight={700} sx={{ color: '#8D6E63', display: 'block' }}>
              {e.from}
            </Typography>
            <Typography variant="body2" fontWeight={500}>
              {e.text}
            </Typography>
          </Paper>
        ))}
      </Box>

      {/* ══════════ GAME OVER: ฝนแมลงสาบ + ฉายาผู้แพ้ ══════════ */}
      {gameOverInfo && (
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            zIndex: 300,
            bgcolor: 'rgba(55,71,79,0.55)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 3,
            overflow: 'hidden',
          }}
        >
          {/* cockroach rain */}
          {Array.from({ length: 16 }).map((_, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src="/Cockroach.png"
              alt=""
              style={{
                position: 'absolute',
                top: 0,
                left: `${(i * 61) % 100}%`,
                width: 32 + ((i * 13) % 28),
                height: 32 + ((i * 13) % 28),
                objectFit: 'contain',
                animation: `roachFall ${2.6 + ((i * 7) % 20) / 10}s linear ${((i * 11) % 24) / 10}s infinite`,
                pointerEvents: 'none',
              }}
            />
          ))}

          <Paper
            elevation={0}
            sx={{
              position: 'relative',
              maxWidth: 440,
              width: '100%',
              p: { xs: 4, md: 5 },
              textAlign: 'center',
              animation: 'popIn 500ms var(--spring)',
            }}
          >
            <IconButton
              onClick={() => setGameOverInfo(null)}
              sx={{ position: 'absolute', top: 12, right: 12, color: '#9E9E9E' }}
            >
              <CloseRoundedIcon />
            </IconButton>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/Cockroach.png"
              alt=""
              style={{ width: 96, height: 96, objectFit: 'contain', animation: 'wobble 0.8s ease-in-out infinite' }}
            />
            <Typography variant="h4" fontWeight={700} sx={{ mt: 2, mb: 1 }}>
              จบเกม!
            </Typography>
            <Typography variant="body1" sx={{ color: '#78909C', mb: 2 }}>
              <Box component="strong" sx={{ color: '#E57373' }}>{gameOverInfo.loser}</Box> แพ้เพราะ{gameOverInfo.reason}
            </Typography>
            <Chip
              label={`ได้รับฉายา: ${gameOverInfo.title}`}
              sx={{
                bgcolor: 'rgba(255,204,128,0.35)',
                color: '#8D6E63',
                fontWeight: 700,
                px: 1,
                py: 2.2,
                mb: 3,
              }}
            />
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button variant="contained" onClick={() => setGameOverInfo(null)} sx={{ px: 4 }}>
                กลับห้องรอ เล่นใหม่อีกรอบ
              </Button>
            </Box>
          </Paper>
        </Box>
      )}
    </Box>
  );
}
