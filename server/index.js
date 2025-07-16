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
const rooms = new Map();

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);

  // Join or create room
  socket.on('joinRoom', (roomId) => {
    if (!roomId) roomId = 'default';
    
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new GameRoom(roomId, io));
    }
    
    const room = rooms.get(roomId);
    const success = room.addPlayer(socket);
    
    if (success) {
      socket.join(roomId);
      socket.roomId = roomId;
      console.log(`Player ${socket.id} joined room ${roomId}`);
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

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id);
    
    if (socket.roomId && rooms.has(socket.roomId)) {
      const room = rooms.get(socket.roomId);
      room.removePlayer(socket.id);
      
      // Clean up empty rooms
      if (room.isEmpty()) {
        rooms.delete(socket.roomId);
      }
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Client available at http://localhost:${PORT}`);
}); 