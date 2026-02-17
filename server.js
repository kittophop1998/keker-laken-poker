import { createServer } from 'http';
import { Server } from 'socket.io';
import next from 'next';

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = 3002;

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

// Game state
const rooms = new Map();

// Card types and animals - 8 ชนิด x 4 ใบ = 32 ใบ (คนละ 16 ใบสำหรับ 2 คน)
const ANIMALS = ['แมลงสาบ', 'หนู', 'แมลงเขียว', 'แมงมุม', 'แมลงวัน', 'ค้างคาว', 'กบ', 'แมงป่อง'];

function createDeck() {
  const deck = [];
  ANIMALS.forEach(animal => {
    for (let i = 0; i < 4; i++) {
      deck.push({ animal, id: `${animal}-${i}` });
    }
  });
  return shuffleDeck(deck);
}

function shuffleDeck(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

app.prepare().then(() => {
  const httpServer = createServer(handler);
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.NODE_ENV === 'production' 
        ? process.env.ALLOWED_ORIGINS?.split(',') || []
        : true,
      methods: ["GET", "POST"],
      credentials: true
    },
    transports: ['websocket', 'polling'],
    allowEIO3: true,
    pingTimeout: 60000,
    pingInterval: 25000
  });

  io.on('connection', (socket) => {
    console.log('Player connected:', socket.id);

    socket.on('createRoom', ({ playerName }) => {
      const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
      rooms.set(roomId, {
        id: roomId,
        players: [{
          id: socket.id,
          name: playerName,
          cards: [],
          deadCards: []
        }],
        gameStarted: false,
        currentPlayer: null,
        currentCard: null,
        currentClaim: null,
        deck: []
      });
      
      socket.join(roomId);
      socket.emit('roomCreated', { roomId, playerId: socket.id });
      io.to(roomId).emit('roomUpdate', rooms.get(roomId));
    });

    socket.on('joinRoom', ({ roomId, playerName }) => {
      const room = rooms.get(roomId);
      if (!room) {
        socket.emit('error', 'ไม่พบห้องนี้');
        return;
      }
      if (room.gameStarted) {
        socket.emit('error', 'เกมเริ่มแล้ว ไม่สามารถเข้าร่วมได้');
        return;
      }
      
      room.players.push({
        id: socket.id,
        name: playerName,
        cards: [],
        deadCards: []
      });
      
      socket.join(roomId);
      socket.emit('roomJoined', { roomId, playerId: socket.id });
      io.to(roomId).emit('roomUpdate', room);
    });

    socket.on('startGame', ({ roomId }) => {
      const room = rooms.get(roomId);
      if (!room || room.players.length < 2) {
        socket.emit('error', 'ต้องมีผู้เล่นอย่างน้อย 2 คน');
        return;
      }

      room.gameStarted = true;
      room.deck = createDeck();
      
      // แจกไพ่ให้ผู้เล่นทุกคน
      const cardsPerPlayer = Math.floor(room.deck.length / room.players.length);
      room.players.forEach((player, index) => {
        player.cards = room.deck.slice(index * cardsPerPlayer, (index + 1) * cardsPerPlayer);
        player.deadCards = [];
      });

      // สุ่มผู้เล่นเริ่มต้น
      room.currentPlayer = room.players[Math.floor(Math.random() * room.players.length)].id;
      room.currentCard = null;
      room.currentClaim = null;
      room.lastSender = null;

      io.to(roomId).emit('gameStarted', room);
      room.players.forEach(player => {
        io.to(player.id).emit('yourCards', player.cards);
      });
    });

    socket.on('sendCard', ({ roomId, targetPlayerId, cardId, claimedAnimal }) => {
      const room = rooms.get(roomId);
      if (!room) return;

      const sender = room.players.find(p => p.id === socket.id);
      if (!sender) return;
      
      const cardIndex = sender.cards.findIndex(c => c.id === cardId);
      
      if (cardIndex === -1) return;

      const card = sender.cards.splice(cardIndex, 1)[0];
      
      console.log(`${sender.name} ส่งไพ่ (${card.animal}) ให้ ${room.players.find(p => p.id === targetPlayerId)?.name} โดยอ้างว่าเป็น ${claimedAnimal}`);
      
      room.currentCard = card;
      room.currentClaim = claimedAnimal;
      room.currentPlayer = targetPlayerId;
      room.lastSender = socket.id;

      io.to(roomId).emit('cardSent', {
        from: sender.name,
        fromId: socket.id,
        to: room.players.find(p => p.id === targetPlayerId)?.name,
        toId: targetPlayerId,
        claim: claimedAnimal
      });

      // ส่ง roomUpdate ให้ทุกคนเห็นว่า currentPlayer เปลี่ยน
      io.to(roomId).emit('roomUpdate', room);

      // ส่งการ์ดที่เหลือให้ผู้ส่ง
      io.to(socket.id).emit('yourCards', sender.cards);

      // ตรวจสอบเงื่อนไขชนะ/แพ้
      checkGameEnd(roomId, io);
    });

    socket.on('challenge', ({ roomId, guessIsLie }) => {
      const room = rooms.get(roomId);
      if (!room || !room.currentCard) return;

      const challenger = room.players.find(p => p.id === socket.id);
      const sender = room.players.find(p => p.id === room.lastSender);
      
      const isLie = room.currentCard.animal !== room.currentClaim;
      const challengeSuccess = guessIsLie === isLie;

      if (challengeSuccess) {
        // ทายถูก - คนส่งเก็บไพ่
        sender.deadCards.push(room.currentCard);
        io.to(roomId).emit('challengeResult', {
          challenger: challenger.name,
          success: true,
          actualAnimal: room.currentCard.animal,
          claimedAnimal: room.currentClaim,
          loser: sender.name,
          message: `${challenger.name} ทายถูก! ${sender.name} ต้องเก็บไพ่`
        });
        room.currentPlayer = sender.id;
      } else {
        // ทายผิด - คนทายเก็บไพ่
        challenger.deadCards.push(room.currentCard);
        io.to(roomId).emit('challengeResult', {
          challenger: challenger.name,
          success: false,
          actualAnimal: room.currentCard.animal,
          claimedAnimal: room.currentClaim,
          loser: challenger.name,
          message: `${challenger.name} ทายผิด! ต้องเก็บไพ่`
        });
        room.currentPlayer = challenger.id;
      }

      room.currentCard = null;
      room.currentClaim = null;
      room.lastSender = null;

      // ส่ง roomUpdate ให้ทุกคนเห็น deadCards ที่อัพเดททันที
      io.to(roomId).emit('roomUpdate', room);

      // ส่งการ์ดที่อัพเดทให้ทุกคน
      room.players.forEach(player => {
        io.to(player.id).emit('yourCards', player.cards);
      });

      // ตรวจสอบเงื่อนไขชนะ/แพ้
      setTimeout(() => checkGameEnd(roomId, io), 1000);
    });

    socket.on('passCard', ({ roomId }) => {
      const room = rooms.get(roomId);
      if (!room) return;

      io.to(socket.id).emit('revealCard', room.currentCard);
    });

    socket.on('sendRevealedCard', ({ roomId, targetPlayerId, claimedAnimal }) => {
      const room = rooms.get(roomId);
      if (!room || !room.currentCard) return;

      const sender = room.players.find(p => p.id === socket.id);
      if (!sender) return;
      
      console.log(`${sender.name} ส่งไพ่ที่เปิดดูแล้ว (${room.currentCard.animal}) ให้ ${room.players.find(p => p.id === targetPlayerId)?.name} โดยอ้างว่าเป็น ${claimedAnimal}`);
      
      // ใช้ไพ่ที่กำลังถูกส่งอยู่ (currentCard)
      const card = room.currentCard;
      
      room.currentCard = card;
      room.currentClaim = claimedAnimal;
      room.currentPlayer = targetPlayerId;
      room.lastSender = socket.id;

      // ส่ง cardSent ให้ทุกคนในห้อง
      io.to(roomId).emit('cardSent', {
        from: sender.name,
        fromId: socket.id,
        to: room.players.find(p => p.id === targetPlayerId)?.name,
        toId: targetPlayerId,
        claim: claimedAnimal
      });

      // ส่ง roomUpdate ให้ทุกคนเห็นว่า currentPlayer เปลี่ยน
      io.to(roomId).emit('roomUpdate', room);

      // ตรวจสอบเงื่อนไขชนะ/แพ้
      checkGameEnd(roomId, io);
    });

    socket.on('disconnect', () => {
      console.log('Player disconnected:', socket.id);
      
      // ลบผู้เล่นออกจากห้อง
      rooms.forEach((room, roomId) => {
        const playerIndex = room.players.findIndex(p => p.id === socket.id);
        if (playerIndex !== -1) {
          const player = room.players[playerIndex];
          room.players.splice(playerIndex, 1);
          
          if (room.players.length === 0) {
            rooms.delete(roomId);
          } else {
            io.to(roomId).emit('playerLeft', { playerName: player.name });
            io.to(roomId).emit('roomUpdate', room);
          }
        }
      });
    });
  });

  function checkGameEnd(roomId, io) {
    const room = rooms.get(roomId);
    if (!room) return;

    // ตรวจสอบว่ามีผู้เล่นคนไหนมีไพ่ชนิดเดียกัน 4 ใบหรือไม่
    for (const player of room.players) {
      const animalCount = {};
      player.deadCards.forEach(card => {
        animalCount[card.animal] = (animalCount[card.animal] || 0) + 1;
      });

      // เงื่อนไข 1: มีไพ่ชนิดเดียวกัน 4 ใบ
      for (const animal in animalCount) {
        if (animalCount[animal] >= 4) {
          io.to(roomId).emit('gameOver', {
            loser: player.name,
            reason: `มี${animal}ครบ 4 ใบ`
          });
          room.gameStarted = false;
          return;
        }
      }

      // เงื่อนไข 2: มีสัตว์ครบทุกชนิด (8 ชนิด)
      const uniqueAnimals = Object.keys(animalCount).length;
      if (uniqueAnimals >= ANIMALS.length) {
        io.to(roomId).emit('gameOver', {
          loser: player.name,
          reason: 'มีสัตว์ครบทุกชนิด'
        });
        room.gameStarted = false;
        return;
      }
    }

    // เงื่อนไข 3: ไพ่หมดมือ
    for (const player of room.players) {
      if (player.cards.length === 0 && room.gameStarted) {
        io.to(roomId).emit('gameOver', {
          loser: player.name,
          reason: 'ไพ่ในมือหมด'
        });
        room.gameStarted = false;
        return;
      }
    }
  }

  httpServer
    .once('error', (err) => {
      console.error('Server error:', err);
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${port} is already in use. Please kill the process using this port or use a different port.`);
      }
      process.exit(1);
    })
    .listen(port, hostname, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
      console.log(`> Access from other devices: http://<your-ip>:${port}`);
      console.log(`> WebSocket server is running`);
    });
});
