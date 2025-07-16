class BattleRoom {
  constructor(roomId, io) {
    this.roomId = roomId;
    this.io = io;
    this.players = new Map();
    this.maxPlayers = 4;
    this.gameStarted = false;
    
    console.log(`Battle room created: ${roomId}`);
  }

  addPlayer(socket) {
    if (this.players.size >= this.maxPlayers) {
      return false;
    }

    if (this.gameStarted) {
      return false;
    }

    const player = {
      id: socket.id,
      socket: socket,
      character: null,
      ready: false,
      joinTime: Date.now()
    };

    this.players.set(socket.id, player);
    
    console.log(`Player ${socket.id} joined battle room ${this.roomId}`);
    
    // Send current room state to all players
    this.broadcastRoomState();
    
    return true;
  }

  removePlayer(playerId) {
    const player = this.players.get(playerId);
    if (player) {
      this.players.delete(playerId);
      console.log(`Player ${playerId} left battle room ${this.roomId}`);
      
      // Broadcast updated room state
      this.broadcastRoomState();
    }
  }

  setPlayerCharacter(playerId, character) {
    const player = this.players.get(playerId);
    if (player) {
      player.character = character;
      console.log(`Player ${playerId} selected character: ${character.name}`);
      
      // Broadcast updated room state
      this.broadcastRoomState();
    }
  }

  setPlayerReady(playerId, ready) {
    const player = this.players.get(playerId);
    if (player) {
      player.ready = ready;
      console.log(`Player ${playerId} ready status: ${ready}`);
      
      // Broadcast updated room state
      this.broadcastRoomState();
    }
  }

  startBattle() {
    // Check if at least 2 players and all are ready with characters
    const playerArray = Array.from(this.players.values());
    const readyPlayers = playerArray.filter(p => p.ready && p.character);
    
    if (readyPlayers.length < 2) {
      console.log(`Cannot start battle: Only ${readyPlayers.length} players ready`);
      return false;
    }

    this.gameStarted = true;
    
    // Send battle start event to all players
    this.io.to(this.roomId).emit('battleStart', {
      players: readyPlayers.map(p => ({
        id: p.id,
        character: p.character
      }))
    });
    
    console.log(`Battle started in room ${this.roomId} with ${readyPlayers.length} players`);
    return true;
  }

  broadcastRoomState() {
    const playerArray = Array.from(this.players.values());
    const roomState = {
      roomId: this.roomId,
      players: playerArray.map(p => ({
        id: p.id,
        character: p.character,
        ready: p.ready
      })),
      gameStarted: this.gameStarted
    };

    this.io.to(this.roomId).emit('battleRoomUpdate', roomState);
  }

  isEmpty() {
    return this.players.size === 0;
  }

  getPlayerCount() {
    return this.players.size;
  }
}

module.exports = BattleRoom; 