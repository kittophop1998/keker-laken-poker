import { Server as SocketIOServer } from 'socket.io';
import type { NextApiRequest } from 'next';
import type { Server as HTTPServer } from 'http';
import type { Socket as NetSocket } from 'net';

interface SocketServer extends HTTPServer {
  io?: SocketIOServer;
}

interface SocketWithIO extends NetSocket {
  server: SocketServer;
}

interface NextApiResponseWithSocket {
  socket: SocketWithIO;
  end: () => void;
}

// Card types and animals - 8 สัตว์ ชนิดละ 8 ใบ = รวม 64 ใบ
const ANIMALS = ['แมลงสาบ', 'หนู', 'แมลงเขียว', 'แมงมุม', 'แมลงวัน', 'ค้างคาว', 'กบ', 'แมงป่อง'];
const CARDS_PER_ANIMAL = 8; // แต่ละสัตว์มี 8 ใบ

interface Card {
  animal: string;
  id: string;
}

interface Player {
  id: string;
  sessionId: string;
  name: string;
  cards: Card[];
  deadCards: Card[];
  disconnected?: boolean;
}

interface ChatMessage {
  id: string;
  from: string;
  fromId: string;
  text: string;
  timestamp: number;
}

interface Room {
  id: string;
  players: Player[];
  gameStarted: boolean;
  currentPlayer: string | null;
  currentCard: Card | null;
  currentClaim: string | null;
  currentCardSender: string | null;
  deck: Card[];
  chatMessages: ChatMessage[];
}

const MAX_CHAT_MESSAGES = 100;
const MAX_CHAT_LENGTH = 200;

function createDeck(): Card[] {
  const deck: Card[] = [];
  
  // สร้างไพ่ 8 ชนิด ชนิดละ 8 ใบ
  ANIMALS.forEach(animal => {
    for (let i = 0; i < CARDS_PER_ANIMAL; i++) {
      deck.push({ animal, id: `${animal}-${i}` });
    }
  });
  
  return shuffleDeck(deck);
}

function shuffleDeck(deck: Card[]): Card[] {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

const rooms = new Map<string, Room>();

// ผู้เล่นที่หลุดการเชื่อมต่อจะยังถือที่นั่งในห้องไว้ชั่วคราว เผื่อรีเฟรช/เน็ตหลุด/จอดับ แล้วกลับเข้ามาใหม่
const WAITING_GRACE_MS = 60_000; // ห้องรอ: รอกลับมา 1 นาที
const PLAYING_GRACE_MS = 180_000; // ระหว่างเล่น: รอกลับมา 3 นาที
const disconnectTimers = new Map<string, ReturnType<typeof setTimeout>>();

const timerKey = (roomId: string, sessionId: string) => `${roomId}:${sessionId}`;

function clearDisconnectTimer(roomId: string, sessionId: string) {
  const key = timerKey(roomId, sessionId);
  const timer = disconnectTimers.get(key);
  if (timer) {
    clearTimeout(timer);
    disconnectTimers.delete(key);
  }
}

// ลบผู้เล่นออกจากห้องจริงๆ หลังหมดเวลารอกลับเข้ามา
function removePlayer(io: SocketIOServer, roomId: string, sessionId: string) {
  clearDisconnectTimer(roomId, sessionId);
  const room = rooms.get(roomId);
  if (!room) return;

  const playerIndex = room.players.findIndex(p => p.sessionId === sessionId);
  if (playerIndex === -1) return;

  const [player] = room.players.splice(playerIndex, 1);

  if (room.players.length === 0) {
    rooms.delete(roomId);
    return;
  }

  // ถ้ามีไพ่ค้างอยู่กลางวง แล้วคนส่งหรือคนรับหายไป ให้ยกเลิกไพ่ใบนั้น
  if (room.currentCard && (player.id === room.currentCardSender || player.id === room.currentPlayer)) {
    room.currentCard = null;
    room.currentClaim = null;
    room.currentCardSender = null;
    room.currentPlayer = null;
  }

  if (room.gameStarted) {
    if (room.players.length < 2) {
      // เหลือคนเดียว เล่นต่อไม่ได้ กลับไปห้องรอ
      room.gameStarted = false;
      room.currentPlayer = null;
      room.currentCard = null;
      room.currentClaim = null;
      room.currentCardSender = null;
      io.to(roomId).emit('gameCancelled', {
        message: `${player.name} ออกจากเกมจนผู้เล่นไม่พอ กลับไปห้องรอเพื่อน`
      });
    } else if (!room.currentPlayer || room.currentPlayer === player.id) {
      const nextPlayer = room.players.find(p => !p.disconnected) || room.players[0];
      room.currentPlayer = nextPlayer.id;
    }
  }

  io.to(roomId).emit('playerLeft', { playerName: player.name });
  io.to(roomId).emit('roomUpdate', room);
}

export default function SocketHandler(req: NextApiRequest, res: NextApiResponseWithSocket) {
  if (res.socket?.server?.io) {
    console.log('Socket.IO server already running');
    res.end();
    return;
  }

  console.log('Initializing Socket.IO server...');
  
  const httpServer: SocketServer = res.socket.server;
  const io = new SocketIOServer(httpServer, {
    path: '/api/socketio',
    addTrailingSlash: false,
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      credentials: true
    },
    transports: ['websocket', 'polling'],
    allowEIO3: true,
    pingTimeout: 60000,
    pingInterval: 25000
  });

  httpServer.io = io;

  io.on('connection', (socket) => {
    console.log('Player connected:', socket.id);

    socket.on('createRoom', ({ playerName, sessionId }: { playerName: string; sessionId?: string }) => {
      const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
      rooms.set(roomId, {
        id: roomId,
        players: [{
          id: socket.id,
          sessionId: sessionId || socket.id,
          name: playerName,
          cards: [],
          deadCards: []
        }],
        gameStarted: false,
        currentPlayer: null,
        currentCard: null,
        currentClaim: null,
        currentCardSender: null,
        deck: [],
        chatMessages: []
      });

      socket.join(roomId);
      socket.emit('roomCreated', { roomId, playerId: socket.id, playerName });
      io.to(roomId).emit('roomUpdate', rooms.get(roomId));
    });

    socket.on('joinRoom', ({ roomId, playerName, sessionId }: { roomId: string; playerName: string; sessionId?: string }) => {
      const room = rooms.get(roomId);
      if (!room) {
        socket.emit('joinFailed', { reason: 'ไม่พบห้องนี้ (ห้องอาจถูกปิดไปแล้ว)' });
        return;
      }

      // เคยอยู่ห้องนี้แล้วหลุดไป → กลับเข้ามาแทนที่เดิม (ตำแหน่งหัวหน้าห้องและไพ่ในมือคงอยู่)
      const existing = sessionId ? room.players.find(p => p.sessionId === sessionId) : undefined;
      if (existing) {
        clearDisconnectTimer(roomId, existing.sessionId);
        const oldId = existing.id;
        existing.id = socket.id;
        existing.disconnected = false;
        if (playerName?.trim()) existing.name = playerName.trim();

        // อัพเดท socket.id เก่าที่ยังถูกอ้างถึงในสถานะเกมและแชท
        if (room.currentPlayer === oldId) room.currentPlayer = socket.id;
        if (room.currentCardSender === oldId) room.currentCardSender = socket.id;
        room.chatMessages.forEach(m => {
          if (m.fromId === oldId) m.fromId = socket.id;
        });

        socket.join(roomId);
        socket.emit('roomJoined', { roomId, playerId: socket.id, playerName: existing.name, rejoined: true });
        socket.emit('chatHistory', room.chatMessages);

        if (room.gameStarted) {
          socket.emit('gameStarted', room);
          socket.emit('yourCards', existing.cards);
          // ถ้ามีไพ่ค้างอยู่กลางวง ส่งสถานะให้คนที่เพิ่งกลับมาเห็นด้วย
          if (room.currentCard && room.currentClaim && room.currentCardSender && room.currentPlayer) {
            const cardSender = room.players.find(p => p.id === room.currentCardSender);
            const cardTarget = room.players.find(p => p.id === room.currentPlayer);
            if (cardSender && cardTarget) {
              socket.emit('cardSent', {
                from: cardSender.name,
                fromId: cardSender.id,
                to: cardTarget.name,
                toId: cardTarget.id,
                claim: room.currentClaim
              });
            }
          }
        }

        io.to(roomId).emit('roomUpdate', room);
        return;
      }

      if (room.gameStarted) {
        socket.emit('joinFailed', { reason: 'เกมเริ่มแล้ว ไม่สามารถเข้าร่วมได้' });
        return;
      }

      room.players.push({
        id: socket.id,
        sessionId: sessionId || socket.id,
        name: playerName,
        cards: [],
        deadCards: []
      });

      socket.join(roomId);
      socket.emit('roomJoined', { roomId, playerId: socket.id, playerName });
      socket.emit('chatHistory', room.chatMessages);
      io.to(roomId).emit('roomUpdate', room);
    });

    socket.on('startGame', ({ roomId }: { roomId: string }) => {
      const room = rooms.get(roomId);
      if (!room || room.players.length < 2) {
        socket.emit('error', 'ต้องมีผู้เล่นอย่างน้อย 2 คน');
        return;
      }

      room.gameStarted = true;
      room.deck = createDeck();
      
      // คำนวณจำนวนไพ่ที่แต่ละคนจะได้รับ
      const totalCards = room.deck.length; // 64 ใบ
      const numPlayers = room.players.length;
      const cardsPerPlayer = Math.floor(totalCards / numPlayers);
      
      // แจกไพ่ให้ผู้เล่นทุกคนตามจำนวนที่คำนวณได้
      room.players.forEach((player) => {
        player.cards = room.deck.splice(0, cardsPerPlayer);
        player.deadCards = [];
      });

      room.currentPlayer = room.players[0].id;
      
      // ส่งข้อมูลห้องและไพ่ให้ผู้เล่นแต่ละคน
      io.to(roomId).emit('gameStarted', room);
      
      room.players.forEach((player) => {
        io.to(player.id).emit('yourCards', player.cards);
      });
    });

    // ส่งไพ่จากมือให้ผู้เล่นคนอื่น
    socket.on('sendCard', ({ roomId, targetPlayerId, cardId, claimedAnimal }: { 
      roomId: string; 
      targetPlayerId: string; 
      cardId: string; 
      claimedAnimal: string 
    }) => {
      const room = rooms.get(roomId);
      if (!room) return;

      const sender = room.players.find(p => p.id === socket.id);
      const target = room.players.find(p => p.id === targetPlayerId);
      
      if (!sender || !target) return;

      // หาไพ่ที่จะส่ง
      const cardIndex = sender.cards.findIndex(c => c.id === cardId);
      if (cardIndex === -1) return;

      const card = sender.cards[cardIndex];
      sender.cards.splice(cardIndex, 1);

      // เก็บข้อมูลไพ่ที่กำลังส่ง
      room.currentCard = card;
      room.currentClaim = claimedAnimal;
      room.currentCardSender = socket.id;
      room.currentPlayer = targetPlayerId;

      // แจ้งทุกคนว่ามีการส่งไพ่
      io.to(roomId).emit('cardSent', {
        from: sender.name,
        fromId: sender.id,
        to: target.name,
        toId: target.id,
        claim: claimedAnimal
      });

      io.to(roomId).emit('roomUpdate', room);
      
      // ส่งไพ่ที่อัพเดทให้ผู้ส่ง
      io.to(socket.id).emit('yourCards', sender.cards);
    });

    // ทายว่าเป็นความจริงหรือโกหก
    socket.on('challenge', ({ roomId, guessIsLie }: { roomId: string; guessIsLie: boolean }) => {
      const room = rooms.get(roomId);
      if (!room || !room.currentCard || !room.currentClaim || !room.currentCardSender) return;

      const challenger = room.players.find(p => p.id === socket.id);
      const sender = room.players.find(p => p.id === room.currentCardSender);
      
      if (!challenger || !sender) return;

      // ตรวจสอบว่าเป็นการโกหกหรือไม่
      const actualIsLie = room.currentCard.animal !== room.currentClaim;
      const guessCorrect = guessIsLie === actualIsLie;

      let loserPlayer: Player;
      let message: string;

      if (guessCorrect) {
        // ทายถูก - คนส่งได้ไพ่ไปเก็บ
        loserPlayer = sender;
        message = `${challenger.name} ทายถูก! ${sender.name} ต้องเก็บไพ่`;
      } else {
        // ทายผิด - คนทายได้ไพ่ไปเก็บ
        loserPlayer = challenger;
        message = `${challenger.name} ทายผิด! ${challenger.name} ต้องเก็บไพ่`;
      }

      loserPlayer.deadCards.push(room.currentCard);

      io.to(roomId).emit('challengeResult', {
        message,
        actualAnimal: room.currentCard.animal,
        claimedAnimal: room.currentClaim,
        guessIsLie,
        guessCorrect,
        loserId: loserPlayer.id,
        loserName: loserPlayer.name
      });

      // คนที่แพ้การทายเป็นคนเล่นต่อ
      room.currentPlayer = loserPlayer.id;
      room.currentCard = null;
      room.currentClaim = null;
      room.currentCardSender = null;

      io.to(roomId).emit('roomUpdate', room);

      // ตรวจสอบเงื่อนไขการแพ้เกม
      checkGameEnd(roomId, io);
    });

    // ส่งคำแซวกวนๆ ให้ทุกคนในห้องเห็น
    socket.on('sendEmote', ({ roomId, text }: { roomId: string; text: string }) => {
      const room = rooms.get(roomId);
      if (!room) return;

      const sender = room.players.find(p => p.id === socket.id);
      if (!sender) return;

      // กันสแปมข้อความยาวเกิน
      const safeText = String(text).slice(0, 60);

      io.to(roomId).emit('emote', {
        from: sender.name,
        fromId: sender.id,
        text: safeText
      });
    });

    // แชทในห้อง — เห็นเฉพาะคนในห้องนี้ และถูกล้างเมื่อจบเกม
    socket.on('sendChatMessage', ({ roomId, text }: { roomId: string; text: string }) => {
      const room = rooms.get(roomId);
      if (!room) return;

      const sender = room.players.find(p => p.id === socket.id);
      if (!sender) return;

      const safeText = String(text).trim().slice(0, MAX_CHAT_LENGTH);
      if (!safeText) return;

      const chatMessage: ChatMessage = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        from: sender.name,
        fromId: sender.id,
        text: safeText,
        timestamp: Date.now()
      };

      room.chatMessages.push(chatMessage);
      if (room.chatMessages.length > MAX_CHAT_MESSAGES) {
        room.chatMessages.shift();
      }

      io.to(roomId).emit('chatMessage', chatMessage);
    });

    socket.on('disconnect', () => {
      console.log('Player disconnected:', socket.id);

      rooms.forEach((room, roomId) => {
        // เทียบด้วย id ปัจจุบันเท่านั้น — ถ้าผู้เล่น rejoin ด้วย socket ใหม่ไปแล้ว
        // disconnect ของ socket เก่าจะไม่มากระทบ
        const player = room.players.find(p => p.id === socket.id);
        if (!player) return;

        // ยังไม่ลบทันที — ถือที่นั่งไว้รอกลับเข้ามาภายใน grace period
        player.disconnected = true;
        io.to(roomId).emit('playerDisconnected', { playerName: player.name });
        io.to(roomId).emit('roomUpdate', room);

        const graceMs = room.gameStarted ? PLAYING_GRACE_MS : WAITING_GRACE_MS;
        clearDisconnectTimer(roomId, player.sessionId);
        disconnectTimers.set(timerKey(roomId, player.sessionId), setTimeout(() => {
          const r = rooms.get(roomId);
          const p = r?.players.find(pl => pl.sessionId === player.sessionId);
          if (p?.disconnected) {
            removePlayer(io, roomId, player.sessionId);
          } else {
            disconnectTimers.delete(timerKey(roomId, player.sessionId));
          }
        }, graceMs));
      });
    });
  });

  function checkGameEnd(roomId: string, io: SocketIOServer) {
    const room = rooms.get(roomId);
    if (!room) return;

    for (const player of room.players) {
      // เงื่อนไข 1: ไพ่ในมือหมด (แพ้)
      if (player.cards.length === 0) {
        io.to(roomId).emit('gameOver', {
          loser: player.name,
          loserId: player.id,
          reason: 'ไพ่ในมือหมด'
        });
        room.gameStarted = false;
        room.currentPlayer = null;
        room.currentCard = null;
        room.currentClaim = null;
        room.currentCardSender = null;
        // เกมจบแล้ว ล้างแชทของห้องทิ้งทั้งหมด
        room.chatMessages = [];
        io.to(roomId).emit('chatCleared');
        return;
      }

      // นับจำนวนสัตว์แต่ละชนิดในไพ่ที่เก็บ
      const animalCount: { [key: string]: number } = {};
      player.deadCards.forEach(card => {
        animalCount[card.animal] = (animalCount[card.animal] || 0) + 1;
      });

      // เงื่อนไข 2: มีสัตว์ชนิดเดียวกัน 4 ใบในไพ่ที่เก็บ (แพ้)
      for (const [animal, count] of Object.entries(animalCount)) {
        if (count >= 4) {
          io.to(roomId).emit('gameOver', {
            loser: player.name,
            loserId: player.id,
            reason: `มี${animal} 4 ตัว`
          });
          room.gameStarted = false;
          room.currentPlayer = null;
          room.currentCard = null;
          room.currentClaim = null;
          room.currentCardSender = null;
          // เกมจบแล้ว ล้างแชทของห้องทิ้งทั้งหมด
          room.chatMessages = [];
          io.to(roomId).emit('chatCleared');
          return;
        }
      }

      // เงื่อนไข 3: มีสัตว์ครบ 8 ชนิดในไพ่ที่เก็บ (แพ้)
      const uniqueAnimals = Object.keys(animalCount);
      if (uniqueAnimals.length >= 8) {
        io.to(roomId).emit('gameOver', {
          loser: player.name,
          loserId: player.id,
          reason: `มีสัตว์ครบ 8 ชนิด`
        });
        room.gameStarted = false;
        room.currentPlayer = null;
        room.currentCard = null;
        room.currentClaim = null;
        room.currentCardSender = null;
        // เกมจบแล้ว ล้างแชทของห้องทิ้งทั้งหมด
        room.chatMessages = [];
        io.to(roomId).emit('chatCleared');
        return;
      }
    }
  }

  console.log('Socket.IO server initialized');
  res.end();
}
