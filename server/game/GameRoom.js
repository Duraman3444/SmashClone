class GameRoom {
  constructor(roomId, io) {
    this.roomId = roomId;
    this.name = roomId; // Default name is the room ID
    this.io = io;
    this.players = new Map();
    this.gameState = {
      players: {},
      gameStarted: false,
      gameTime: 0
    };
    this.maxPlayers = 4;
    this.tickRate = 60; // 60 FPS
    this.gameLoop = null;
    
    // Character colors for placeholder characters
    this.characterColors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00'];
    this.usedColors = new Set();
  }

  addPlayer(socket, character = null) {
    if (this.players.size >= this.maxPlayers) {
      return false;
    }

    // Assign a color to the player
    const availableColors = this.characterColors.filter(color => !this.usedColors.has(color));
    const playerColor = availableColors[0];
    this.usedColors.add(playerColor);

    const player = {
      id: socket.id,
      x: 400 + (this.players.size * 100), // Spawn positions
      y: 300,
      velocityX: 0,
      velocityY: 0,
      health: 0, // Damage percentage (0-999)
      lives: 3,
      color: playerColor,
      isGrounded: false,
      isAttacking: false,
      facingRight: true,
      width: 40,
      height: 60,
      character: character // Store selected character info
    };

    this.players.set(socket.id, player);
    this.gameState.players[socket.id] = player;

    // Send initial game state to all players
    this.broadcastGameState();

    // Start game loop if this is the first player
    if (this.players.size === 1) {
      this.startGameLoop();
    }

    return true;
  }

  removePlayer(playerId) {
    const player = this.players.get(playerId);
    if (player) {
      this.usedColors.delete(player.color);
      this.players.delete(playerId);
      delete this.gameState.players[playerId];
      
      this.broadcastGameState();
      
      // Stop game loop if no players left
      if (this.players.size === 0) {
        this.stopGameLoop();
      }
    }
  }

  handlePlayerInput(playerId, inputData) {
    const player = this.players.get(playerId);
    if (!player) return;

    // Handle different input types
    if (inputData.type === 'move') {
      this.handleMovement(player, inputData);
    } else if (inputData.type === 'attack') {
      this.handleAttack(player, inputData);
    } else if (inputData.type === 'jump') {
      this.handleJump(player, inputData);
    }
  }

  handleMovement(player, inputData) {
    const moveSpeed = 200; // pixels per second
    const deltaTime = 1 / this.tickRate;
    
    if (inputData.left) {
      player.velocityX = -moveSpeed;
      player.facingRight = false;
    } else if (inputData.right) {
      player.velocityX = moveSpeed;
      player.facingRight = true;
    } else {
      player.velocityX = 0;
    }
  }

  handleJump(player, inputData) {
    if (inputData.jump && player.isGrounded) {
      player.velocityY = -400; // Jump strength
      player.isGrounded = false;
    }
  }

  handleAttack(player, inputData) {
    if (inputData.attack && !player.isAttacking) {
      player.isAttacking = true;
      
      // Check for hits on other players
      this.checkAttackHits(player);
      
      // Reset attack state after short duration
      setTimeout(() => {
        player.isAttacking = false;
      }, 300);
    }
  }

  checkAttackHits(attacker) {
    const attackRange = 80;
    const attackDirection = attacker.facingRight ? 1 : -1;
    const attackX = attacker.x + (attackDirection * attackRange);
    
    for (const [playerId, player] of this.players) {
      if (playerId === attacker.id) continue;
      
      const distance = Math.abs(player.x - attackX);
      const yDistance = Math.abs(player.y - attacker.y);
      
      if (distance < attackRange && yDistance < 80) {
        // Hit detected
        this.applyDamage(player, attacker, 15);
      }
    }
  }

  applyDamage(target, attacker, damage) {
    target.health += damage;
    
    // Apply knockback based on damage percentage
    const knockbackStrength = Math.min(target.health * 3, 600);
    const knockbackDirection = target.x > attacker.x ? 1 : -1;
    
    target.velocityX = knockbackDirection * knockbackStrength;
    target.velocityY = -knockbackStrength * 0.5;
    
    // Check if player is KO'd (knocked off screen)
    if (target.health > 150) {
      // High damage makes it easier to be KO'd
      target.vulnerableToKO = true;
    }
  }

  updatePhysics() {
    const deltaTime = 1 / this.tickRate;
    const gravity = 800;
    const groundY = 400;
    const stageWidth = 800;
    
    for (const [playerId, player] of this.players) {
      // Apply gravity
      if (!player.isGrounded) {
        player.velocityY += gravity * deltaTime;
      }
      
      // Update position
      player.x += player.velocityX * deltaTime;
      player.y += player.velocityY * deltaTime;
      
      // Ground collision
      if (player.y >= groundY - player.height) {
        player.y = groundY - player.height;
        player.velocityY = 0;
        player.isGrounded = true;
      }
      
      // Keep player on stage (for now)
      if (player.x < 0) player.x = 0;
      if (player.x > stageWidth - player.width) player.x = stageWidth - player.width;
      
      // Check if player fell off stage
      if (player.y > 600) {
        this.respawnPlayer(player);
      }
      
      // Apply friction
      if (player.isGrounded) {
        player.velocityX *= 0.8;
      }
    }
  }

  respawnPlayer(player) {
    player.lives--;
    player.health = 0;
    player.x = 400;
    player.y = 200;
    player.velocityX = 0;
    player.velocityY = 0;
    player.isGrounded = false;
    
    if (player.lives <= 0) {
      // Player is eliminated
      this.eliminatePlayer(player.id);
    }
  }

  eliminatePlayer(playerId) {
    const player = this.players.get(playerId);
    if (player) {
      player.eliminated = true;
      this.checkGameEnd();
    }
  }

  checkGameEnd() {
    const alivePlayers = Array.from(this.players.values()).filter(p => !p.eliminated);
    
    if (alivePlayers.length <= 1) {
      // Game over
      this.io.to(this.roomId).emit('gameEnd', {
        winner: alivePlayers[0]?.id || null
      });
    }
  }

  startGameLoop() {
    this.gameLoop = setInterval(() => {
      this.updatePhysics();
      this.broadcastGameState();
    }, 1000 / this.tickRate);
  }

  stopGameLoop() {
    if (this.gameLoop) {
      clearInterval(this.gameLoop);
      this.gameLoop = null;
    }
  }

  broadcastGameState() {
    this.io.to(this.roomId).emit('gameState', this.gameState);
  }

  isEmpty() {
    return this.players.size === 0;
  }
}

module.exports = GameRoom; 