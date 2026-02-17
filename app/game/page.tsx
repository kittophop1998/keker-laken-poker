'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import styles from './game.module.css';
import BugReportIcon from '@mui/icons-material/BugReport';
import PestControlIcon from '@mui/icons-material/PestControl';
import GrassIcon from '@mui/icons-material/Grass';
import MoodBadIcon from '@mui/icons-material/MoodBad';
import FlightIcon from '@mui/icons-material/Flight';
import NightsStayIcon from '@mui/icons-material/NightsStay';
import WaterIcon from '@mui/icons-material/Water';
import CoronavirusIcon from '@mui/icons-material/Coronavirus';

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
  const [revealedCard, setRevealedCard] = useState<Card | null>(null);
  const [currentAction, setCurrentAction] = useState<CurrentAction | null>(null);
  const [gameLogs, setGameLogs] = useState<GameLog[]>([]);

  const ANIMALS = ['แมลงสาบ', 'หนู', 'แมลงเขียว', 'แมงมุม', 'แมลงวัน', 'ค้างคาว', 'กบ', 'แมงป่อง'];

  const addLog = (type: GameLog['type'], message: string) => {
    setGameLogs(prev => [...prev, {
      id: Date.now(),
      type,
      message,
      timestamp: new Date()
    }]);
  };

  useEffect(() => {
    const newSocket = io('http://localhost:3000', {
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('Connected to server');
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
      setRevealedCard(null);
      
      // เพิ่ม log เมื่อได้รับไพ่
      addLog('receive', `📩 ${data.from} ส่งไพ่ให้ ${data.to} อ้างว่าเป็น ${data.claim}`);
    });

    newSocket.on('revealCard', (card) => {
      setRevealedCard(card);
      setMessage(`ไพ่ที่ได้รับคือ ${card.animal}`);
      
      // เพิ่ม log เมื่อเปิดดูไพ่
      addLog('receive', `👁️ คุณเปิดดูไพ่: ${card.animal}`);
    });

    newSocket.on('challengeResult', (result) => {
      setMessage(result.message);
      setCurrentAction(null);
      setRevealedCard(null);
      
      // เพิ่ม log ผลการทาย
      addLog('challenge', `⚔️ ${result.message} (จริง: ${result.actualAnimal}, อ้าง: ${result.claimedAnimal})`);
    });

    newSocket.on('gameOver', (data) => {
      setMessage(`🎮 จบเกม! ${data.loser} แพ้เพราะ${data.reason}`);
      setGameState('waiting');
      
      // เพิ่ม log จบเกม
      addLog('gameOver', `🎮 จบเกม! ${data.loser} แพ้เพราะ${data.reason}`);
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
    setRevealedCard(null);
  };

  const sendRevealedCard = () => {
    if (!revealedCard || !selectedPlayer) {
      setMessage('กรุณาเลือกผู้เล่นที่จะส่งให้');
      return;
    }
    socket?.emit('sendRevealedCard', {
      roomId: currentRoomId,
      targetPlayerId: selectedPlayer,
      cardId: revealedCard.id,
      claimedAnimal: selectedAnimal
    });
    setSelectedPlayer(null);
    setRevealedCard(null);
    setCurrentAction(null);
  };

  const handleChallenge = (guessIsLie: boolean) => {
    socket?.emit('challenge', { roomId: currentRoomId, guessIsLie });
  };

  const handlePass = () => {
    socket?.emit('passCard', { roomId: currentRoomId });
  };

  const getAnimalIcon = (animal: string) => {
    const icons: { [key: string]: JSX.Element } = {
      'แมลงสาบ': <BugReportIcon sx={{ fontSize: 'inherit', color: '#8B4513' }} />,
      'หนู': <PestControlIcon sx={{ fontSize: 'inherit', color: '#696969' }} />,
      'แมลงเขียว': <GrassIcon sx={{ fontSize: 'inherit', color: '#32CD32' }} />,
      'แมงมุม': <MoodBadIcon sx={{ fontSize: 'inherit', color: '#000000' }} />,
      'แมลงวัน': <FlightIcon sx={{ fontSize: 'inherit', color: '#4169E1' }} />,
      'ค้างคาว': <NightsStayIcon sx={{ fontSize: 'inherit', color: '#8B008B' }} />,
      'กบ': <WaterIcon sx={{ fontSize: 'inherit', color: '#228B22' }} />,
      'แมงป่อง': <CoronavirusIcon sx={{ fontSize: 'inherit', color: '#DC143C' }} />
    };
    return icons[animal] || <BugReportIcon sx={{ fontSize: 'inherit' }} />;
  };

  const isMyTurn = room?.currentPlayer === playerId;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>🃏 Kaker Laken Poker</h1>

      {message && <div className={styles.message}>{message}</div>}

      {gameState === 'lobby' && (
        <div className={styles.lobby}>
          <input
            type="text"
            placeholder="ชื่อของคุณ"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className={styles.input}
          />
          <div className={styles.buttonGroup}>
            <button onClick={createRoom} className={styles.button}>
              สร้างห้อง
            </button>
            <div className={styles.joinGroup}>
              <input
                type="text"
                placeholder="รหัสห้อง"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                className={styles.input}
              />
              <button onClick={joinRoom} className={styles.button}>
                เข้าร่วมห้อง
              </button>
            </div>
          </div>
        </div>
      )}

      {gameState === 'waiting' && room && (
        <div className={styles.waiting}>
          <h2>ห้อง: {currentRoomId}</h2>
          <div className={styles.players}>
            <h3>ผู้เล่น ({room.players.length})</h3>
            {room.players.map((player) => (
              <div key={player.id} className={styles.playerItem}>
                {player.name} {player.id === playerId && '(คุณ)'}
              </div>
            ))}
          </div>
          {room.players[0]?.id === playerId && (
            <button onClick={startGame} className={styles.button}>
              เริ่มเกม (ต้องมีผู้เล่น 2 คนขึ้นไป)
            </button>
          )}
        </div>
      )}

      {gameState === 'playing' && room && (
        <div className={styles.game}>
          <div className={styles.gameLayout}>
            <div className={styles.mainGame}>
              <div className={styles.playersGrid}>
                {room.players.map((player) => (
                  <div
                    key={player.id}
                    className={`${styles.playerCard} ${
                      player.id === room.currentPlayer ? styles.activePlayer : ''
                    } ${player.id === playerId ? styles.myPlayer : ''}`}
                  >
                    <h3>
                      {player.name}
                      {player.id === playerId && ' (คุณ)'}
                      {player.id === room.currentPlayer && ' 🎯'}
                    </h3>
                    <div className={styles.playerInfo}>
                      <div className={styles.statLine}>
                        <span>ไพ่ในมือ:</span>
                        <strong>{player.id === playerId ? myCards.length : player.cards.length} ใบ</strong>
                      </div>
                      <div className={styles.statLine}>
                        <span>ไพ่ที่เก็บ:</span>
                        <strong>{player.deadCards.length} ใบ</strong>
                      </div>
                      
                      {player.deadCards.length > 0 && (
                        <div className={styles.deadCardsSection}>
                          <div className={styles.deadCardsTitle}>ไพ่ที่เก็บ:</div>
                          <div className={styles.deadCardsGrid}>
                            {(() => {
                              // นับจำนวนแต่ละชนิด
                              const animalCount: { [key: string]: number } = {};
                              player.deadCards.forEach(card => {
                                animalCount[card.animal] = (animalCount[card.animal] || 0) + 1;
                              });
                              
                              return Object.entries(animalCount).map(([animal, count]) => (
                                <div 
                                  key={animal} 
                                  className={`${styles.animalGroup} ${count >= 4 ? styles.dangerCard : ''}`}
                                >
                                  <span className={styles.animalEmoji}>{getAnimalIcon(animal)}</span>
                                  <span className={styles.animalCount}>x{count}</span>
                                </div>
                              ));
                            })()}
                          </div>
                          {(() => {
                            const animalCount: { [key: string]: number } = {};
                            player.deadCards.forEach(card => {
                              animalCount[card.animal] = (animalCount[card.animal] || 0) + 1;
                            });
                            const uniqueCount = Object.keys(animalCount).length;
                            const hasFourOfKind = Object.values(animalCount).some(count => count >= 4);
                            
                            return (
                              <div className={styles.warningZone}>
                                {hasFourOfKind && (
                                  <div className={styles.warningText}>⚠️ มีสัตว์ 4 ตัวเหมือนกัน!</div>
                                )}
                                {uniqueCount >= 8 && (
                                  <div className={styles.warningText}>⚠️ มีสัตว์ครบทุกชนิด!</div>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

          {isMyTurn && myCards.length > 0 && !currentAction && (
            <div className={styles.turnActions}>
              <h3>🎲 ตาของคุณ!</h3>
              <div className={styles.myCards}>
                <h4>ไพ่ในมือ:</h4>
                <div className={styles.cardList}>
                  {myCards.map((card) => (
                    <div
                      key={card.id}
                      className={`${styles.card} ${
                        selectedCard === card.id ? styles.selectedCard : ''
                      }`}
                      onClick={() => setSelectedCard(card.id)}
                    >
                      <div className={styles.cardEmoji}>{getAnimalIcon(card.animal)}</div>
                      <div className={styles.cardName}>{card.animal}</div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedCard && (
                <>
                  <div className={styles.selectAnimal}>
                    <h4>อ้างว่าเป็น:</h4>
                    <div className={styles.animalButtons}>
                      {ANIMALS.map((animal) => (
                        <button
                          key={animal}
                          className={`${styles.animalButton} ${
                            selectedAnimal === animal ? styles.selectedAnimal : ''
                          }`}
                          onClick={() => setSelectedAnimal(animal)}
                        >
                          <span className={styles.buttonIcon}>{getAnimalIcon(animal)}</span> {animal}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={styles.selectPlayer}>
                    <h4>ส่งให้:</h4>
                    <div className={styles.playerButtons}>
                      {room.players
                        .filter((p) => p.id !== playerId)
                        .map((player) => (
                          <button
                            key={player.id}
                            className={`${styles.playerButton} ${
                              selectedPlayer === player.id ? styles.selectedPlayerBtn : ''
                            }`}
                            onClick={() => setSelectedPlayer(player.id)}
                          >
                            {player.name}
                          </button>
                        ))}
                    </div>
                  </div>

                  <button onClick={sendCard} className={styles.sendButton}>
                    ส่งไพ่
                  </button>
                </>
              )}
            </div>
          )}

          {isMyTurn && currentAction && currentAction.toId === playerId && (
            <div className={styles.challengeActions}>
              <h3>🤔 คุณได้รับไพ่!</h3>
              <p>
                {currentAction.from} บอกว่าเป็น <strong>{currentAction.claim}</strong>
              </p>

              {!revealedCard ? (
                <div className={styles.actionButtons}>
                  <button
                    onClick={() => handleChallenge(true)}
                    className={`${styles.button} ${styles.lieButton}`}
                  >
                    ❌ โกหก!
                  </button>
                  <button
                    onClick={() => handleChallenge(false)}
                    className={`${styles.button} ${styles.truthButton}`}
                  >
                    ✅ จริง!
                  </button>
                  <button onClick={handlePass} className={styles.button}>
                    👁️ ดูไพ่และส่งต่อ
                  </button>
                </div>
              ) : (
                <div className={styles.revealedCard}>
                  <h4>ไพ่ที่คุณได้รับคือ:</h4>
                  <div className={styles.bigCard}>
                    <div className={styles.bigCardEmoji}>{getAnimalIcon(revealedCard.animal)}</div>
                    <div className={styles.bigCardName}>{revealedCard.animal}</div>
                  </div>
                  <p>ตอนนี้คุณสามารถเลือกผู้เล่นและส่งไพ่ต่อได้</p>
                  
                  <div className={styles.selectAnimal}>
                    <h4>อ้างว่าเป็น:</h4>
                    <div className={styles.animalButtons}>
                      {ANIMALS.map((animal) => (
                        <button
                          key={animal}
                          className={`${styles.animalButton} ${
                            selectedAnimal === animal ? styles.selectedAnimal : ''
                          }`}
                          onClick={() => setSelectedAnimal(animal)}
                        >
                          <span className={styles.buttonIcon}>{getAnimalIcon(animal)}</span> {animal}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={styles.selectPlayer}>
                    <h4>ส่งให้:</h4>
                    <div className={styles.playerButtons}>
                      {room.players
                        .filter((p) => p.id !== playerId)
                        .map((player) => (
                          <button
                            key={player.id}
                            className={`${styles.playerButton} ${
                              selectedPlayer === player.id ? styles.selectedPlayerBtn : ''
                            }`}
                            onClick={() => setSelectedPlayer(player.id)}
                          >
                            {player.name}
                          </button>
                        ))}
                    </div>
                  </div>

                  <button onClick={sendRevealedCard} className={styles.sendButton}>
                    ส่งไพ่ต่อ
                  </button>
                </div>
              )}
            </div>
          )}

          {!isMyTurn && (
            <div className={styles.waitingTurn}>
              <p>รอตาของ {room.players.find((p) => p.id === room.currentPlayer)?.name}</p>
            </div>
          )}
            </div>

            {/* Game Logs Sidebar */}
            <div className={styles.logsSidebar}>
              <h3>📜 ประวัติการเล่น</h3>
              <div className={styles.logsContainer}>
                {gameLogs.length === 0 ? (
                  <div className={styles.noLogs}>ยังไม่มีประวัติ</div>
                ) : (
                  gameLogs.map((log) => (
                    <div key={log.id} className={`${styles.logItem} ${styles[`log${log.type}`]}`}>
                      <div className={styles.logMessage}>{log.message}</div>
                      <div className={styles.logTime}>
                        {log.timestamp.toLocaleTimeString('th-TH', { 
                          hour: '2-digit', 
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
