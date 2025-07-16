const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));
app.use(cors());

// Game state management
const GameRoom = require('./game/GameRoom');
const BattleRoom = require('./game/BattleRoom');
const rooms = new Map();
const battleRooms = new Map();

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);

  // Create room
  socket.on('createRoom', (data) => {
    const { roomId, roomName, character } = data;
    
    if (!rooms.has(roomId)) {
      const room = new GameRoom(roomId, io);
      room.name = roomName;
      rooms.set(roomId, room);
      console.log(`Room created: ${roomId} (${roomName})`);
    }
    
    socket.emit('roomCreated', { roomId, roomName });
  });

  // Request room list
  socket.on('requestRoomList', () => {
    const roomList = Array.from(rooms.values()).map(room => ({
      id: room.roomId,
      name: room.name || room.roomId,
      playerCount: room.players.size,
      maxPlayers: room.maxPlayers,
      gameStarted: room.gameState.gameStarted
    }));
    
    socket.emit('roomList', roomList);
  });

  // Join or create room (enhanced)
  socket.on('joinRoom', (data) => {
    let roomId, character;
    
    if (typeof data === 'string') {
      // Legacy support
      roomId = data;
      character = null;
    } else {
      roomId = data.roomId;
      character = data.character;
    }
    
    if (!roomId) roomId = 'default';
    
    if (!rooms.has(roomId)) {
      const room = new GameRoom(roomId, io);
      room.name = roomId;
      rooms.set(roomId, room);
    }
    
    const room = rooms.get(roomId);
    const success = room.addPlayer(socket, character);
    
    if (success) {
      socket.join(roomId);
      socket.roomId = roomId;
      console.log(`Player ${socket.id} joined room ${roomId}${character ? ' with character: ' + character.name : ''}`);
      socket.emit('roomJoined', { roomId, roomName: room.name });
    } else {
      socket.emit('roomFull');
    }
  });

  // Handle player input
  socket.on('playerInput', (inputData) => {
    if (socket.roomId && rooms.has(socket.roomId)) {
      const room = rooms.get(socket.roomId);
      room.handlePlayerInput(socket.id, inputData);
    }
  });

  // Battle room handlers
  socket.on('joinBattleRoom', (roomId) => {
    if (!battleRooms.has(roomId)) {
      battleRooms.set(roomId, new BattleRoom(roomId, io));
    }
    
    const battleRoom = battleRooms.get(roomId);
    const success = battleRoom.addPlayer(socket);
    
    if (success) {
      socket.join(roomId);
      socket.battleRoomId = roomId;
      console.log(`Player ${socket.id} joined battle room ${roomId}`);
    } else {
      socket.emit('battleRoomFull');
    }
  });

  socket.on('leaveBattleRoom', () => {
    if (socket.battleRoomId && battleRooms.has(socket.battleRoomId)) {
      const battleRoom = battleRooms.get(socket.battleRoomId);
      battleRoom.removePlayer(socket.id);
      
      socket.leave(socket.battleRoomId);
      
      if (battleRoom.isEmpty()) {
        battleRooms.delete(socket.battleRoomId);
      }
      
      socket.battleRoomId = null;
    }
  });

  socket.on('selectCharacter', (character) => {
    if (socket.battleRoomId && battleRooms.has(socket.battleRoomId)) {
      const battleRoom = battleRooms.get(socket.battleRoomId);
      battleRoom.setPlayerCharacter(socket.id, character);
    }
  });

  socket.on('setReady', (ready) => {
    if (socket.battleRoomId && battleRooms.has(socket.battleRoomId)) {
      const battleRoom = battleRooms.get(socket.battleRoomId);
      battleRoom.setPlayerReady(socket.id, ready);
    }
  });

  socket.on('startBattle', () => {
    if (socket.battleRoomId && battleRooms.has(socket.battleRoomId)) {
      const battleRoom = battleRooms.get(socket.battleRoomId);
      battleRoom.startBattle();
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id);
    
    // Clean up regular game rooms
    if (socket.roomId && rooms.has(socket.roomId)) {
      const room = rooms.get(socket.roomId);
      room.removePlayer(socket.id);
      
      // Clean up empty rooms
      if (room.isEmpty()) {
        rooms.delete(socket.roomId);
      }
    }
    
    // Clean up battle rooms
    if (socket.battleRoomId && battleRooms.has(socket.battleRoomId)) {
      const battleRoom = battleRooms.get(socket.battleRoomId);
      battleRoom.removePlayer(socket.id);
      
      // Clean up empty battle rooms
      if (battleRoom.isEmpty()) {
        battleRooms.delete(socket.battleRoomId);
      }
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Client available at http://localhost:${PORT}`);
}); 