'use client';

import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

// MUI imports
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Tooltip from '@mui/material/Tooltip';

interface Card {
  animal: string;
  id: string;
}

interface Player {
  id: string;
  name: string;
  cards: Card[];
  deadCards: Card[];
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
  type: 'receive' | 'send' | 'challenge' | 'gameOver';
  message: string;
  timestamp: Date;
}

const LOG_COLORS: Record<GameLog['type'], string> = {
  receive: '#4facfe',
  send: '#FF8C00',
  challenge: '#FFD700',
  gameOver: '#ff6b6b',
};

export default function GamePage() {
  const [socket, setSocket] = useState<Socket | null>(null);
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
  
  // Refs for auto-scrolling
  const logsEndRef = useRef<HTMLDivElement>(null);
  const challengeActionsRef = useRef<HTMLDivElement>(null);

  const ANIMALS = ['แมลงสาบ', 'หนู', 'แมลงวัน', 'แมงป่อง', 'แมลงเขียว', 'แมงมุม', 'ค้างคาว', 'กบ'];

  const addLog = (type: GameLog['type'], message: string) => {
    setGameLogs(prev => [...prev, {
      id: Date.now(),
      type,
      message,
      timestamp: new Date()
    }]);
  };

  // Auto-scroll ไปที่ log ล่าสุด
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [gameLogs]);

  useEffect(() => {
    // Initialize Socket.IO API endpoint first
    fetch('/api/socketio');
    
    // Use the same host as the current page for Socket.IO connection
    const socketUrl = typeof window !== 'undefined' 
      ? `${window.location.protocol}//${window.location.host}`
      : 'http://localhost:3002';
    
    const newSocket = io(socketUrl, {
      path: '/api/socketio',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    newSocket.on('connect', () => {
      console.log('Connected to server at:', socketUrl);
      setSocket(newSocket);
    });

    newSocket.on('roomCreated', ({ roomId, playerId }) => {
      setCurrentRoomId(roomId);
      setPlayerId(playerId);
      setGameState('waiting');
      setMessage(`สร้างห้อง ${roomId} สำเร็จ! แชร์รหัสนี้ให้เพื่อน`);
    });

    newSocket.on('roomJoined', ({ roomId, playerId }) => {
      setCurrentRoomId(roomId);
      setPlayerId(playerId);
      setGameState('waiting');
      setMessage('เข้าร่วมห้องสำเร็จ!');
    });

    newSocket.on('roomUpdate', (updatedRoom) => {
      setRoom(updatedRoom);
    });

    newSocket.on('gameStarted', (updatedRoom) => {
      setRoom(updatedRoom);
      setGameState('playing');
      setMessage('เกมเริ่มแล้ว!');
      setGameLogs([]);
    });

    newSocket.on('yourCards', (cards) => {
      setMyCards(cards);
    });

    newSocket.on('cardSent', (data) => {
      setMessage(`${data.from} ส่งไพ่ให้ ${data.to} โดยอ้างว่าเป็น ${data.claim}`);
      setCurrentAction(data);
      
      // เพิ่ม log เมื่อได้รับไพ่
      addLog('receive', `📩 ${data.from} ส่งไพ่ให้ ${data.to} อ้างว่าเป็น ${data.claim}`);
    });

    newSocket.on('challengeResult', (result) => {
      setMessage(result.message);
      setCurrentAction(null);
      
      // เพิ่ม log ผลการทาย
      addLog('challenge', `⚔️ ${result.message} (จริง: ${result.actualAnimal}, อ้าง: ${result.claimedAnimal})`);
    });

    newSocket.on('gameOver', (data) => {
      // แสดงข้อความจบเกม (ทุกกรณีคือการแพ้)
      const displayMessage = `🎮 จบเกม! ${data.loser} แพ้เพราะ${data.reason}`;
      
      setMessage(displayMessage);
      setGameState('waiting');
      
      // เพิ่ม log จบเกม
      addLog('gameOver', displayMessage);
    });

    newSocket.on('playerLeft', (data) => {
      setMessage(`${data.playerName} ออกจากห้อง`);
    });

    newSocket.on('error', (msg) => {
      setMessage(`❌ ${msg}`);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const createRoom = () => {
    if (!playerName.trim()) {
      setMessage('กรุณาใส่ชื่อของคุณ');
      return;
    }
    socket?.emit('createRoom', { playerName });
  };

  const joinRoom = () => {
    if (!playerName.trim() || !roomId.trim()) {
      setMessage('กรุณาใส่ชื่อและรหัสห้อง');
      return;
    }
    socket?.emit('joinRoom', { roomId: roomId.toUpperCase(), playerName });
  };

  const startGame = () => {
    socket?.emit('startGame', { roomId: currentRoomId });
  };

  const sendCard = () => {
    if (!selectedCard || !selectedPlayer) {
      setMessage('กรุณาเลือกไพ่และผู้เล่นที่จะส่งให้');
      return;
    }
    socket?.emit('sendCard', {
      roomId: currentRoomId,
      targetPlayerId: selectedPlayer,
      cardId: selectedCard,
      claimedAnimal: selectedAnimal
    });
    setSelectedCard(null);
    setSelectedPlayer(null);
  };

  const handleChallenge = (guessIsLie: boolean) => {
    socket?.emit('challenge', { roomId: currentRoomId, guessIsLie });
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
  const glassPaper = {
    bgcolor: 'rgba(39,39,42,0.85)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,215,0,0.15)',
    borderRadius: 4,
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #1a1a1a 0%, #2d1a00 50%, #1a1a1a 100%)',
        color: '#fff',
        fontFamily: "'Kanit', sans-serif",
      }}
    >
      {/* ── TOP BAR ── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 2,
          px: 3,
          bgcolor: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,215,0,0.2)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <Typography
          variant="h5"
          fontWeight={900}
          sx={{ color: '#FFD700', letterSpacing: 2, textTransform: 'uppercase' }}
        >
          🃏 Kaker Laken Poker
        </Typography>
      </Box>

      <Box sx={{ maxWidth: 1400, mx: 'auto', p: { xs: 2, md: 3 } }}>
        {/* ── MESSAGE ALERT ── */}
        {message && (
          <Alert
            severity="info"
            sx={{
              mb: 3,
              bgcolor: 'rgba(255,215,0,0.12)',
              color: '#FFD700',
              border: '1px solid rgba(255,215,0,0.3)',
              borderRadius: 3,
              fontWeight: 600,
              fontSize: '1rem',
              '& .MuiAlert-icon': { color: '#FFD700' },
            }}
          >
            {message}
          </Alert>
        )}

        {/* ══════════════════ LOBBY ══════════════════ */}
        {gameState === 'lobby' && (
          <Box sx={{ maxWidth: 480, mx: 'auto', mt: 6 }}>
            <Paper elevation={0} sx={{ ...glassPaper, p: { xs: 4, md: 6 } }}>
              <Typography variant="h4" fontWeight={900} textAlign="center" sx={{ mb: 1, color: '#FFD700' }}>
                🪳 เข้าร่วมเกม
              </Typography>
              <Typography variant="body2" textAlign="center" sx={{ color: 'rgba(255,255,255,0.5)', mb: 4 }}>
                สร้างห้องใหม่หรือเข้าร่วมห้องที่มีอยู่
              </Typography>

              <TextField
                label="ชื่อของคุณ"
                fullWidth
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                sx={{ mb: 3 }}
              />

              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={createRoom}
                sx={{
                  mb: 3,
                  py: 1.8,
                  fontWeight: 800,
                  fontSize: '1.05rem',
                  background: 'linear-gradient(135deg, #FFD700 0%, #FF8C00 100%)',
                  color: '#1a1a1a',
                  borderRadius: 3,
                  '&:hover': { transform: 'scale(1.02)' },
                  transition: 'transform 0.2s',
                }}
              >
                + สร้างห้องใหม่
              </Button>

              <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 3 }}>
                <Chip
                  label="หรือ"
                  size="small"
                  sx={{ bgcolor: 'rgba(255,215,0,0.15)', color: '#FFD700', fontSize: '0.75rem' }}
                />
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
                onClick={joinRoom}
                sx={{
                  py: 1.8,
                  fontWeight: 800,
                  fontSize: '1.05rem',
                  borderColor: '#FF8C00',
                  color: '#FF8C00',
                  borderRadius: 3,
                  '&:hover': { borderColor: '#FFD700', color: '#FFD700', bgcolor: 'rgba(255,215,0,0.08)' },
                }}
              >
                เข้าร่วมห้อง
              </Button>
            </Paper>
          </Box>
        )}

        {/* ══════════════════ WAITING ROOM ══════════════════ */}
        {gameState === 'waiting' && room && (
          <Box sx={{ maxWidth: 600, mx: 'auto', mt: 6 }}>
            <Paper elevation={0} sx={{ ...glassPaper, p: { xs: 4, md: 6 } }}>
              <Typography variant="h4" fontWeight={900} textAlign="center" sx={{ mb: 1, color: '#FFD700' }}>
                ห้อง: {currentRoomId}
              </Typography>
              <Typography variant="body2" textAlign="center" sx={{ color: 'rgba(255,255,255,0.5)', mb: 4 }}>
                แชร์รหัสนี้ให้เพื่อนเพื่อเข้าร่วมเกม
              </Typography>

              <Paper
                elevation={0}
                sx={{
                  bgcolor: 'rgba(255,215,0,0.08)',
                  border: '1px dashed rgba(255,215,0,0.4)',
                  borderRadius: 3,
                  p: 3,
                  mb: 4,
                  textAlign: 'center',
                }}
              >
                <Typography variant="h3" fontWeight={900} sx={{ color: '#FFD700', letterSpacing: 6 }}>
                  {currentRoomId}
                </Typography>
              </Paper>

              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
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
                      bgcolor:
                        player.id === playerId ? 'rgba(255,215,0,0.12)' : 'rgba(255,255,255,0.05)',
                      borderRadius: 3,
                      border:
                        player.id === playerId
                          ? '1px solid rgba(255,215,0,0.4)'
                          : '1px solid transparent',
                    }}
                  >
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        background:
                          i === 0
                            ? 'linear-gradient(135deg, #FFD700, #FF8C00)'
                            : 'rgba(255,255,255,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 900,
                        fontSize: '0.9rem',
                        color: i === 0 ? '#1a1a1a' : '#fff',
                      }}
                    >
                      {i === 0 ? '👑' : i + 1}
                    </Box>
                    <Typography component="div" fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {player.name}
                      {player.id === playerId && (
                        <Chip
                          label="คุณ"
                          size="small"
                          sx={{
                            bgcolor: '#FFD700',
                            color: '#1a1a1a',
                            fontWeight: 700,
                            height: 20,
                            fontSize: '0.7rem',
                          }}
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
                  onClick={startGame}
                  disabled={room.players.length < 2}
                  sx={{
                    py: 1.8,
                    fontWeight: 800,
                    fontSize: '1.1rem',
                    background:
                      room.players.length >= 2
                        ? 'linear-gradient(135deg, #FFD700 0%, #FF8C00 100%)'
                        : undefined,
                    color: '#1a1a1a',
                    borderRadius: 3,
                  }}
                >
                  {room.players.length < 2
                    ? `รอผู้เล่นเพิ่ม (${room.players.length}/2)`
                    : '🎮 เริ่มเกม!'}
                </Button>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                  <CircularProgress size={20} sx={{ color: '#FFD700' }} />
                  <Typography sx={{ color: 'rgba(255,255,255,0.6)' }}>รอให้โฮสต์เริ่มเกม...</Typography>
                </Box>
              )}
            </Paper>
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
              <Grid container spacing={2} sx={{ mb: 3 }}>
                {room.players.map((player) => {
                  const isActive = player.id === room.currentPlayer;
                  const isMe = player.id === playerId;
                  const animalCount: { [key: string]: number } = {};
                  player.deadCards.forEach((card) => {
                    animalCount[card.animal] = (animalCount[card.animal] || 0) + 1;
                  });
                  const hasFour = Object.values(animalCount).some((c) => c >= 4);
                  const uniqueCount = Object.keys(animalCount).length;

                  return (
                    <Grid key={player.id} size={{ xs: 12, sm: 6, md: 4 }}>
                      <Paper
                        elevation={0}
                        sx={{
                          ...glassPaper,
                          p: 2.5,
                          border: isActive
                            ? '2px solid #FFD700'
                            : isMe
                            ? '2px solid rgba(255,140,0,0.5)'
                            : '1px solid rgba(255,215,0,0.1)',
                          boxShadow: isActive ? '0 0 24px rgba(255,215,0,0.35)' : 'none',
                          transform: isActive ? 'scale(1.02)' : 'scale(1)',
                          transition: 'all 0.3s',
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            mb: 1.5,
                          }}
                        >
                          <Typography component="div" fontWeight={800} variant="h6" sx={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 1 }}>
                            {player.name}
                            {isMe && (
                              <Chip
                                label="คุณ"
                                size="small"
                                sx={{
                                  bgcolor: '#FFD700',
                                  color: '#1a1a1a',
                                  fontWeight: 700,
                                  height: 18,
                                  fontSize: '0.65rem',
                                }}
                              />
                            )}
                          </Typography>
                          {isActive && (
                            <Chip
                              label="🎯 ตานี้"
                              size="small"
                              sx={{
                                bgcolor: 'rgba(255,215,0,0.2)',
                                color: '#FFD700',
                                fontWeight: 700,
                                fontSize: '0.7rem',
                              }}
                            />
                          )}
                        </Box>

                        <Box sx={{ display: 'flex', gap: 2, mb: player.deadCards.length > 0 ? 2 : 0 }}>
                          <Box
                            sx={{
                              flex: 1,
                              bgcolor: 'rgba(255,255,255,0.04)',
                              borderRadius: 2,
                              p: 1.5,
                              textAlign: 'center',
                            }}
                          >
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                              ไพ่ในมือ
                            </Typography>
                            <Typography variant="h5" fontWeight={900} sx={{ color: '#4facfe' }}>
                              {isMe ? myCards.length : player.cards.length}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              flex: 1,
                              bgcolor: 'rgba(255,255,255,0.04)',
                              borderRadius: 2,
                              p: 1.5,
                              textAlign: 'center',
                            }}
                          >
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                              ไพ่สะสม
                            </Typography>
                            <Typography
                              variant="h5"
                              fontWeight={900}
                              sx={{
                                color: hasFour ? '#ff6b6b' : uniqueCount >= 6 ? '#FF8C00' : '#FFD700',
                              }}
                            >
                              {player.deadCards.length}
                            </Typography>
                          </Box>
                        </Box>

                        {player.deadCards.length > 0 && (
                          <>
                            <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mb: 1.5 }} />
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                mb: 1,
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}
                              >
                                ไพ่ที่สะสม
                              </Typography>
                              <Typography
                                variant="caption"
                                fontWeight={700}
                                sx={{ color: uniqueCount >= 8 ? '#ff6b6b' : 'rgba(255,255,255,0.5)' }}
                              >
                                {uniqueCount}/8 ชนิด
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                              {Object.entries(animalCount).map(([animal, count]) => (
                                <Tooltip key={animal} title={animal} placement="top">
                                  <Box
                                    sx={{
                                      display: 'flex',
                                      flexDirection: 'column',
                                      alignItems: 'center',
                                      gap: 0.3,
                                      p: 0.5,
                                      borderRadius: 2,
                                      bgcolor:
                                        count >= 4
                                          ? 'rgba(255,107,107,0.2)'
                                          : 'rgba(255,255,255,0.04)',
                                      border:
                                        count >= 4
                                          ? '1px solid rgba(255,107,107,0.6)'
                                          : '1px solid transparent',
                                    }}
                                  >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={getAnimalImage(animal)}
                                      alt={animal}
                                      style={{ width: 36, height: 36, objectFit: 'contain' }}
                                    />
                                    <Typography
                                      variant="caption"
                                      fontWeight={800}
                                      sx={{
                                        color: count >= 4 ? '#ff6b6b' : '#FFD700',
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
                            {(hasFour || uniqueCount >= 8) && (
                              <Alert
                                severity="error"
                                sx={{
                                  mt: 1.5,
                                  py: 0.5,
                                  bgcolor: 'rgba(255,107,107,0.15)',
                                  color: '#ff6b6b',
                                  border: '1px solid rgba(255,107,107,0.4)',
                                  borderRadius: 2,
                                  '& .MuiAlert-icon': { color: '#ff6b6b' },
                                }}
                              >
                                <Typography variant="caption" fontWeight={700}>
                                  {hasFour ? '⚠️ มีสัตว์ 4 ตัวเหมือนกัน!' : '⚠️ ครบ 8 ชนิด!'}
                                </Typography>
                              </Alert>
                            )}
                          </>
                        )}
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>

              {/* ── MY CARDS ── */}
              <Paper
                elevation={0}
                sx={{ ...glassPaper, p: 3, mb: 3, border: '2px solid rgba(255,215,0,0.25)' }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2,
                  }}
                >
                  <Typography component="div" variant="h6" fontWeight={800} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    🃏 ไพ่ในมือของคุณ
                    <Chip
                      label={myCards.length}
                      size="small"
                      sx={{ bgcolor: '#FFD700', color: '#1a1a1a', fontWeight: 900, height: 22 }}
                    />
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        size="small"
                        checked={sortCards}
                        onChange={(e) => setSortCards(e.target.checked)}
                        sx={{
                          '& .MuiSwitch-thumb': { bgcolor: '#FFD700' },
                          '& .MuiSwitch-track': { bgcolor: 'rgba(255,215,0,0.3)' },
                        }}
                      />
                    }
                    label={<Typography variant="caption">เรียง A-Z</Typography>}
                  />
                </Box>

                {myCards.length === 0 ? (
                  <Typography
                    sx={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', py: 3 }}
                  >
                    ไม่มีไพ่ในมือ
                  </Typography>
                ) : (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
                    {(sortCards
                      ? [...myCards].sort((a, b) => a.animal.localeCompare(b.animal, 'th'))
                      : myCards
                    ).map((card) => (
                      <Tooltip key={card.id} title={card.animal} placement="top">
                        <Box
                          onClick={() => isMyTurn && !currentAction && setSelectedCard(card.id)}
                          sx={{
                            position: 'relative',
                            cursor: isMyTurn && !currentAction ? 'pointer' : 'default',
                            transition: 'all 0.25s',
                            transform:
                              selectedCard === card.id
                                ? 'translateY(-14px) scale(1.12)'
                                : 'none',
                            filter:
                              selectedCard === card.id
                                ? 'drop-shadow(0 14px 28px rgba(255,215,0,0.8)) brightness(1.1)'
                                : 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))',
                            '&:hover':
                              isMyTurn && !currentAction
                                ? {
                                    transform: 'translateY(-6px) scale(1.06)',
                                    filter:
                                      'drop-shadow(0 8px 16px rgba(255,215,0,0.4))',
                                  }
                                : {},
                          }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={getAnimalImage(card.animal)}
                            alt={card.animal}
                            style={{
                              width: 90,
                              height: 90,
                              objectFit: 'contain',
                              borderRadius: 8,
                              display: 'block',
                            }}
                          />
                          {selectedCard === card.id && (
                            <Box
                              sx={{
                                position: 'absolute',
                                top: -10,
                                right: -10,
                                width: 28,
                                height: 28,
                                borderRadius: '50%',
                                bgcolor: '#FFD700',
                                color: '#1a1a1a',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.9rem',
                                fontWeight: 900,
                                boxShadow: '0 4px 12px rgba(255,215,0,0.6)',
                              }}
                            >
                              ✓
                            </Box>
                          )}
                        </Box>
                      </Tooltip>
                    ))}
                  </Box>
                )}
              </Paper>

              {/* ── TURN ACTIONS ── */}
              {isMyTurn && myCards.length > 0 && !currentAction && selectedCard && (
                <Paper
                  elevation={0}
                  sx={{
                    ...glassPaper,
                    p: 3,
                    mb: 3,
                    border: '2px solid rgba(255,215,0,0.4)',
                    boxShadow: '0 0 32px rgba(255,215,0,0.15)',
                  }}
                >
                  <Typography
                    variant="h6"
                    fontWeight={800}
                    textAlign="center"
                    sx={{ mb: 3, color: '#FFD700' }}
                  >
                    🎲 ตาของคุณ — เลือกอ้างว่าเป็น & ส่งให้ใคร
                  </Typography>

                  <Typography
                    variant="subtitle2"
                    fontWeight={700}
                    sx={{ mb: 1.5, color: 'rgba(255,255,255,0.7)' }}
                  >
                    อ้างว่าเป็น:
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
                            ? {
                                background:
                                  'linear-gradient(135deg, #FFD700 0%, #FF8C00 100%)',
                                color: '#1a1a1a',
                                borderRadius: 3,
                                fontWeight: 700,
                                border: 'none',
                              }
                            : {
                                borderColor: 'rgba(255,215,0,0.3)',
                                color: 'rgba(255,255,255,0.8)',
                                borderRadius: 3,
                                '&:hover': {
                                  borderColor: '#FFD700',
                                  color: '#FFD700',
                                  bgcolor: 'rgba(255,215,0,0.08)',
                                },
                              }
                        }
                      >
                        {animal}
                      </Button>
                    ))}
                  </Box>

                  <Typography
                    variant="subtitle2"
                    fontWeight={700}
                    sx={{ mb: 1.5, color: 'rgba(255,255,255,0.7)' }}
                  >
                    ส่งให้:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 3 }}>
                    {room.players
                      .filter((p) => p.id !== playerId)
                      .map((player) => (
                        <Button
                          key={player.id}
                          variant={selectedPlayer === player.id ? 'contained' : 'outlined'}
                          onClick={() => setSelectedPlayer(player.id)}
                          sx={
                            selectedPlayer === player.id
                              ? {
                                  background:
                                    'linear-gradient(135deg, #FFD700 0%, #FF8C00 100%)',
                                  color: '#1a1a1a',
                                  borderRadius: 3,
                                  fontWeight: 700,
                                  border: 'none',
                                }
                              : {
                                  borderColor: 'rgba(255,140,0,0.4)',
                                  color: 'rgba(255,255,255,0.8)',
                                  borderRadius: 3,
                                  '&:hover': {
                                    borderColor: '#FF8C00',
                                    color: '#FF8C00',
                                    bgcolor: 'rgba(255,140,0,0.08)',
                                  },
                                }
                          }
                        >
                          {player.name}
                        </Button>
                      ))}
                  </Box>

                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    onClick={sendCard}
                    disabled={!selectedPlayer}
                    sx={{
                      py: 1.8,
                      fontWeight: 800,
                      fontSize: '1.1rem',
                      background: selectedPlayer
                        ? 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
                        : undefined,
                      color: '#1a1a1a',
                      borderRadius: 3,
                      boxShadow: selectedPlayer
                        ? '0 8px 24px rgba(79,172,254,0.4)'
                        : 'none',
                      '&:hover': { transform: 'scale(1.02)' },
                      transition: 'transform 0.2s',
                    }}
                  >
                    📤 ส่งไพ่!
                  </Button>
                </Paper>
              )}

              {/* ── CHALLENGE ACTIONS ── */}
              {isMyTurn && currentAction && currentAction.toId === playerId && (
                <Paper
                  ref={challengeActionsRef}
                  elevation={0}
                  sx={{
                    ...glassPaper,
                    p: 4,
                    mb: 3,
                    border: '2px solid #FFD700',
                    boxShadow: '0 0 40px rgba(255,215,0,0.25)',
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="h5" fontWeight={900} sx={{ mb: 1, color: '#FFD700' }}>
                    🤔 คุณได้รับไพ่!
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 4, color: 'rgba(255,255,255,0.8)' }}>
                    <strong style={{ color: '#FFD700' }}>{currentAction.from}</strong> บอกว่าเป็น{' '}
                    <strong style={{ color: '#FF8C00', fontSize: '1.2rem' }}>
                      {currentAction.claim}
                    </strong>
                  </Typography>

                  <Grid container spacing={2} justifyContent="center">
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Button
                        variant="contained"
                        fullWidth
                        size="large"
                        onClick={() => handleChallenge(true)}
                        sx={{
                          py: 2,
                          fontWeight: 800,
                          fontSize: '1.1rem',
                          background: 'linear-gradient(135deg, #ff6b6b 0%, #ff0000 100%)',
                          color: '#fff',
                          borderRadius: 3,
                          boxShadow: '0 8px 24px rgba(255,107,107,0.4)',
                          '&:hover': { transform: 'scale(1.03)' },
                          transition: 'transform 0.2s',
                        }}
                      >
                        ❌ โกหก!
                      </Button>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Button
                        variant="contained"
                        fullWidth
                        size="large"
                        onClick={() => handleChallenge(false)}
                        sx={{
                          py: 2,
                          fontWeight: 800,
                          fontSize: '1.1rem',
                          background: 'linear-gradient(135deg, #51cf66 0%, #00b300 100%)',
                          color: '#fff',
                          borderRadius: 3,
                          boxShadow: '0 8px 24px rgba(81,207,102,0.4)',
                          '&:hover': { transform: 'scale(1.03)' },
                          transition: 'transform 0.2s',
                        }}
                      >
                        ✅ จริง!
                      </Button>
                    </Grid>
                  </Grid>
                </Paper>
              )}

              {/* ── WAITING FOR TURN ── */}
              {!isMyTurn && (
                <Paper elevation={0} sx={{ ...glassPaper, p: 3, mb: 3, textAlign: 'center' }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 2,
                    }}
                  >
                    <CircularProgress size={20} sx={{ color: '#FFD700' }} />
                    <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      รอตาของ{' '}
                      <strong style={{ color: '#FFD700' }}>
                        {room.players.find((p) => p.id === room.currentPlayer)?.name}
                      </strong>
                    </Typography>
                  </Box>
                </Paper>
              )}
            </Box>

            {/* ── LOGS SIDEBAR ── */}
            <Box sx={{ width: { xs: '100%', lg: 340 }, flexShrink: 0, order: { xs: -1, lg: 0 } }}>
              <Paper
                elevation={0}
                sx={{
                  ...glassPaper,
                  p: 2.5,
                  maxHeight: { xs: 280, lg: '85vh' },
                  display: 'flex',
                  flexDirection: 'column',
                  position: { lg: 'sticky' },
                  top: { lg: 80 },
                }}
              >
                <Typography
                  variant="h6"
                  fontWeight={800}
                  textAlign="center"
                  sx={{ mb: 2, color: '#FFD700' }}
                >
                  📜 ประวัติการเล่น
                </Typography>

                <Box
                  sx={{
                    flex: 1,
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5,
                    pr: 0.5,
                    '&::-webkit-scrollbar': { width: 4 },
                    '&::-webkit-scrollbar-track': {
                      bgcolor: 'rgba(255,255,255,0.05)',
                      borderRadius: 2,
                    },
                    '&::-webkit-scrollbar-thumb': {
                      bgcolor: 'rgba(255,215,0,0.3)',
                      borderRadius: 2,
                    },
                  }}
                >
                  {gameLogs.length === 0 ? (
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'rgba(255,255,255,0.3)',
                        textAlign: 'center',
                        fontStyle: 'italic',
                        py: 4,
                      }}
                    >
                      ยังไม่มีประวัติ
                    </Typography>
                  ) : (
                    gameLogs.map((log) => (
                      <Box
                        key={log.id}
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: `${LOG_COLORS[log.type]}18`,
                          borderLeft: `3px solid ${LOG_COLORS[log.type]}`,
                          transition: 'all 0.2s',
                          '&:hover': {
                            transform: 'translateX(-2px)',
                            bgcolor: `${LOG_COLORS[log.type]}28`,
                          },
                        }}
                      >
                        <Typography variant="body2" sx={{ lineHeight: 1.5, mb: 0.5 }}>
                          {log.message}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>
                          {log.timestamp.toLocaleTimeString('th-TH', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </Typography>
                      </Box>
                    ))
                  )}
                  <div ref={logsEndRef} />
                </Box>
              </Paper>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
