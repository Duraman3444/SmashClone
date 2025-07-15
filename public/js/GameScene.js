class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.players = {};
        this.platforms = [];
        this.myPlayerId = null;
        this.networkManager = null;
        this.inputManager = null;
    }

    init(data) {
        this.mode = data.mode || 'multiplayer';
        Logger.log('GameScene init with mode', this.mode);
        if(this.mode === 'multiplayer'){
            this.networkManager = new NetworkManager();
            this.inputManager = new InputManager(this.networkManager);
        }else{
            this.networkManager = null; // offline
            this.inputManager = new InputManager({
                isConnected: ()=>true,
                sendPlayerInput: ()=>{},
                onGameStateUpdate: ()=>{},
                onGameEnd: ()=>{}
            });
        }
        this.myPlayerId = data.playerId;
    }

    preload() {
        Logger.log('GameScene preload');
        // Remove problematic data URI loading
        // We'll create graphics programmatically instead
    }

    create() {
        Logger.log('GameScene create');
        
        // Set background color
        this.cameras.main.setBackgroundColor('#87CEEB');
        
        // Create stage background rectangle
        this.add.rectangle(400, 300, 800, 600, 0x87CEEB); // Sky blue background
        
        // Create ground and platforms
        this.createStage();
        
        // Set up camera
        this.cameras.main.setBounds(0, 0, 800, 600);
        
        // Mode-specific setup
        if(this.mode === 'multiplayer'){
            this.setupMultiplayer();
        } else {
            this.setupLocal();
        }
        
        // Set up input handling
        if(this.inputManager) {
            this.inputManager.setupInputs(this);
        }
        
        // Update UI
        this.updateUI();
    }

    setupMultiplayer(){
        Logger.log('Setting up multiplayer');
        const serverUrl = window.location.origin;
        this.networkManager.connect(serverUrl);
        const connectingText = this.add.text(400,300,'Connecting to server...',{fontSize:'20px', color:'#fff'}).setOrigin(0.5);
        
        this.networkManager.onConnectionChange((connected)=>{
            Logger.log('Network connected:', connected);
            if(connected){
                this.myPlayerId = this.networkManager.getPlayerId();
                connectingText.setText('Connected! Waiting for game state...');
            }
        });
        
        this.networkManager.onGameStateUpdate((state)=>{
            Logger.log('Game state received, hiding connecting text');
            connectingText.setVisible(false);
            this.updateGameState(state);
        });
        
        this.networkManager.onGameEnd((data)=>{ 
            this.handleGameEnd(data); 
        });
    }

    setupLocal(){
        Logger.log('Setting up local 2-player game');
        
        // Create Player 1 (Red) - Left side
        const player1Data = {
            id: 'player1', 
            x: 300, 
            y: 200, // Start higher so they fall to ground
            width: 40, 
            height: 60, 
            color: '#FF0000', 
            facingRight: true,
            health: 0, 
            lives: 3, 
            isAttacking: false,
            isGrounded: false,
            velocityX: 0,
            velocityY: 0,
            jumpPower: -500, // Negative for upward movement
            moveSpeed: 200,
            canJump: true
        };
        
        // Create Player 2 (Blue) - Right side  
        const player2Data = {
            id: 'player2', 
            x: 500, 
            y: 200, // Start higher so they fall to ground
            width: 40, 
            height: 60, 
            color: '#0000FF', 
            facingRight: false,
            health: 0, 
            lives: 3, 
            isAttacking: false,
            isGrounded: false,
            velocityX: 0,
            velocityY: 0,
            jumpPower: -500, // Negative for upward movement
            moveSpeed: 200,
            canJump: true
        };
        
        this.myPlayerId = 'player1'; // Set player 1 as "You" for UI
        this.createPlayer('player1', player1Data);
        this.createPlayer('player2', player2Data);
        
        // Store player data for local updates
        this.localPlayers = {
            player1: player1Data,
            player2: player2Data
        };
        
        // Physics constants
        this.gravity = 1200; // Gravity strength
        this.friction = 0.8; // Ground friction
        this.airResistance = 0.98; // Air resistance
        
        // Player 1 controls: WASD/Arrow keys + Z for attack
        this.player1Keys = {
            left: [
                this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
                this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT)
            ],
            right: [
                this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
                this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT)
            ],
            up: [
                this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
                this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP)
            ],
            jump: [
                this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
                this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W)
            ],
            attack: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z)
        };
        
        // Player 2 controls: IJKL + O for attack
        this.player2Keys = {
            left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J),
            right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L),
            up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.I),
            jump: [
                this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K),
                this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.I)
            ],
            attack: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.O)
        };
        
        // Set up attack key events
        this.player1Keys.attack.on('down', () => {
            Logger.log('Player 1 attack key pressed');
            this.handlePlayerAttack('player1');
        });
        
        this.player2Keys.attack.on('down', () => {
            Logger.log('Player 2 attack key pressed');
            this.handlePlayerAttack('player2');
        });
        
        // Set up jump key events for Player 1 (Spacebar + W)
        this.player1Keys.jump.forEach(key => {
            key.on('down', () => {
                this.handlePlayerJump('player1');
            });
        });
        
        // Set up jump key events for Player 2 (K + I)
        this.player2Keys.jump.forEach(key => {
            key.on('down', () => {
                this.handlePlayerJump('player2');
            });
        });
        
        Logger.log('Local 2-player setup complete with physics');
    }
    
    handlePlayerAttack(playerId) {
        const playerData = this.localPlayers[playerId];
        if (!playerData) return;
        
        playerData.isAttacking = true;
        this.updatePlayer(playerId, playerData);
        
        setTimeout(() => {
            playerData.isAttacking = false;
            this.updatePlayer(playerId, playerData);
        }, 300);
    }
    
    handlePlayerJump(playerId) {
        const playerData = this.localPlayers[playerId];
        if (!playerData) return;
        
        // Only jump if grounded and can jump
        if (playerData.isGrounded && playerData.canJump) {
            playerData.velocityY = playerData.jumpPower;
            playerData.isGrounded = false;
            playerData.canJump = false;
            Logger.log(`Player ${playerId} jumped with velocity`, playerData.velocityY);
        }
    }
    
    // Check collision between player and platform
    checkPlatformCollision(player, platform) {
        const playerLeft = player.x - player.width / 2;
        const playerRight = player.x + player.width / 2;
        const playerTop = player.y - player.height / 2;
        const playerBottom = player.y + player.height / 2;
        
        const platformLeft = platform.x - platform.width / 2;
        const platformRight = platform.x + platform.width / 2;
        const platformTop = platform.y - platform.height / 2;
        const platformBottom = platform.y + platform.height / 2;
        
        // Check if player is overlapping with platform
        if (playerRight > platformLeft && 
            playerLeft < platformRight && 
            playerBottom > platformTop && 
            playerTop < platformBottom) {
            
            // Check if player is falling down onto platform
            if (player.velocityY > 0 && playerTop < platformTop) {
                return {
                    type: 'ground',
                    y: platformTop - player.height / 2
                };
            }
        }
        
        return null;
    }
    
    // Apply physics to a player
    applyPhysics(playerId, deltaTime) {
        const player = this.localPlayers[playerId];
        if (!player) return;
        
        // Apply gravity
        if (!player.isGrounded) {
            player.velocityY += this.gravity * deltaTime;
        }
        
        // Apply air resistance
        if (!player.isGrounded) {
            player.velocityX *= this.airResistance;
        } else {
            player.velocityX *= this.friction;
        }
        
        // Update position based on velocity
        player.x += player.velocityX * deltaTime;
        player.y += player.velocityY * deltaTime;
        
        // Check platform collisions
        let onGround = false;
        
        for (const platform of this.platforms) {
            const collision = this.checkPlatformCollision(player, platform);
            if (collision && collision.type === 'ground') {
                player.y = collision.y;
                player.velocityY = 0;
                player.isGrounded = true;
                player.canJump = true;
                onGround = true;
                break;
            }
        }
        
        // If not on any platform, player is in air
        if (!onGround) {
            player.isGrounded = false;
        }
        
        // Keep players within stage bounds
        if (player.x < player.width / 2) {
            player.x = player.width / 2;
            player.velocityX = 0;
        }
        if (player.x > 800 - player.width / 2) {
            player.x = 800 - player.width / 2;
            player.velocityX = 0;
        }
        
        // Respawn if player falls off stage
        if (player.y > 650) {
            Logger.log(`Player ${playerId} fell off stage, respawning`);
            this.respawnPlayer(playerId);
        }
    }
    
    // Respawn player
    respawnPlayer(playerId) {
        const player = this.localPlayers[playerId];
        if (!player) return;
        
        player.lives--;
        player.health = 0;
        player.x = playerId === 'player1' ? 300 : 500;
        player.y = 200;
        player.velocityX = 0;
        player.velocityY = 0;
        player.isGrounded = false;
        player.canJump = true;
        
        Logger.log(`Player ${playerId} respawned. Lives remaining: ${player.lives}`);
        
        if (player.lives <= 0) {
            Logger.log(`Player ${playerId} eliminated!`);
            // Could add game over logic here
        }
    }
    
    isKeyDown(keyArray) {
        if (Array.isArray(keyArray)) {
            return keyArray.some(key => key.isDown);
        }
        return keyArray.isDown;
    }

    createStage() {
        Logger.log('Creating stage');
        
        // Main ground platform
        const ground = this.add.rectangle(400, 450, 600, 50, 0x228B22);
        ground.setStrokeStyle(2, 0x006400);
        
        // Left platform
        const leftPlatform = this.add.rectangle(200, 350, 120, 20, 0x8B4513);
        leftPlatform.setStrokeStyle(2, 0x654321);
        
        // Right platform
        const rightPlatform = this.add.rectangle(600, 350, 120, 20, 0x8B4513);
        rightPlatform.setStrokeStyle(2, 0x654321);
        
        // Top platform
        const topPlatform = this.add.rectangle(400, 250, 100, 20, 0x8B4513);
        topPlatform.setStrokeStyle(2, 0x654321);
        
        // Store platforms for reference
        this.platforms = [
            { x: 400, y: 425, width: 600, height: 50 }, // ground
            { x: 200, y: 340, width: 120, height: 20 }, // left
            { x: 600, y: 340, width: 120, height: 20 }, // right
            { x: 400, y: 240, width: 100, height: 20 }  // top
        ];
        
        Logger.log('Stage created with', this.platforms.length, 'platforms');
    }

    updateGameState(gameState) {
        Logger.log('Updating game state');
        // Update or create players
        Object.keys(gameState.players).forEach(playerId => {
            const playerData = gameState.players[playerId];
            
            if (!this.players[playerId]) {
                this.createPlayer(playerId, playerData);
            } else {
                this.updatePlayer(playerId, playerData);
            }
        });
        
        // Remove disconnected players
        Object.keys(this.players).forEach(playerId => {
            if (!gameState.players[playerId]) {
                this.removePlayer(playerId);
            }
        });
        
        // Update UI
        this.updateUI();
    }

    createPlayer(playerId, playerData) {
        Logger.log('Creating player', playerId, 'at', playerData.x, playerData.y);
        
        const player = this.add.group();
        
        // Create player body (colored rectangle)
        const body = this.add.rectangle(playerData.x, playerData.y, playerData.width, playerData.height, playerData.color);
        body.setStrokeStyle(2, 0x000000);
        
        // Create player face direction indicator
        const face = this.add.circle(
            playerData.x + (playerData.facingRight ? 10 : -10), 
            playerData.y - 15, 
            5, 
            0xFFFFFF
        );
        
        // Create health display
        const healthText = this.add.text(
            playerData.x, 
            playerData.y - 40, 
            `${playerData.health}%`, 
            { fontSize: '14px', fill: '#fff' }
        );
        healthText.setOrigin(0.5);
        
        // Create lives display
        const livesText = this.add.text(
            playerData.x, 
            playerData.y + 35, 
            `Lives: ${playerData.lives}`, 
            { fontSize: '12px', fill: '#fff' }
        );
        livesText.setOrigin(0.5);
        
        // Add attack indicator
        const attackIndicator = this.add.rectangle(
            playerData.x + (playerData.facingRight ? 50 : -50),
            playerData.y,
            80, 80,
            0xFF0000
        );
        attackIndicator.setAlpha(0);
        attackIndicator.setStrokeStyle(2, 0xFF0000);
        
        player.add(body);
        player.add(face);
        player.add(healthText);
        player.add(livesText);
        player.add(attackIndicator);
        
        // Store references
        this.players[playerId] = {
            group: player,
            body: body,
            face: face,
            healthText: healthText,
            livesText: livesText,
            attackIndicator: attackIndicator,
            data: playerData
        };
        
        Logger.log('Player created successfully');
    }

    updatePlayer(playerId, playerData) {
        const player = this.players[playerId];
        if (!player) return;
        
        // Update position
        player.body.setPosition(playerData.x, playerData.y);
        
        // Update face direction
        player.face.setPosition(
            playerData.x + (playerData.facingRight ? 10 : -10),
            playerData.y - 15
        );
        
        // Update health display
        player.healthText.setPosition(playerData.x, playerData.y - 40);
        player.healthText.setText(`${playerData.health}%`);
        
        // Update lives display
        player.livesText.setPosition(playerData.x, playerData.y + 35);
        player.livesText.setText(`Lives: ${playerData.lives}`);
        
        // Update attack indicator
        player.attackIndicator.setPosition(
            playerData.x + (playerData.facingRight ? 50 : -50),
            playerData.y
        );
        
        // Show attack indicator if attacking
        if (playerData.isAttacking) {
            player.attackIndicator.setAlpha(0.5);
        } else {
            player.attackIndicator.setAlpha(0);
        }
        
        // Highlight current player
        if (playerId === this.myPlayerId) {
            player.body.setStrokeStyle(3, 0xFFFF00); // Yellow outline for current player
        } else {
            player.body.setStrokeStyle(2, 0x000000);
        }
        
        // Show grounded status with visual cue
        if (playerData.isGrounded) {
            player.body.setStrokeStyle(3, 0x00FF00); // Green outline when grounded
        } else {
            player.body.setStrokeStyle(2, 0xFF0000); // Red outline when in air
        }
        
        // Override for current player highlight
        if (playerId === this.myPlayerId) {
            player.body.setStrokeStyle(3, 0xFFFF00); // Yellow outline for current player
        }
        
        // Update stored data
        player.data = playerData;
    }

    removePlayer(playerId) {
        const player = this.players[playerId];
        if (player) {
            player.group.destroy();
            delete this.players[playerId];
        }
    }

    updateUI() {
        const playerList = document.getElementById('playerList');
        if (!playerList) return;
        
        playerList.innerHTML = '';
        
        Object.keys(this.players).forEach(playerId => {
            const playerData = this.players[playerId].data;
            const playerInfo = document.createElement('div');
            playerInfo.className = 'player-info';
            playerInfo.style.borderLeft = `5px solid ${playerData.color}`;
            
            const isCurrentPlayer = playerId === this.myPlayerId;
            const playerName = isCurrentPlayer ? 'You' : `Player ${playerId.substring(0, 4)}`;
            
            playerInfo.innerHTML = `
                <div style="font-size: 14px; margin-bottom: 5px;">${playerName}</div>
                <div class="player-health" style="color: ${this.getHealthColor(playerData.health)}">
                    ${playerData.health}%
                </div>
                <div class="player-lives">Lives: ${playerData.lives}</div>
            `;
            
            playerList.appendChild(playerInfo);
        });
    }

    getHealthColor(health) {
        if (health < 50) return '#00FF00';
        if (health < 100) return '#FFFF00';
        if (health < 150) return '#FF8800';
        return '#FF0000';
    }

    handleGameEnd(data) {
        const status = document.getElementById('status');
        if (!status) return;
        
        status.classList.remove('hidden');
        
        if (data.winner === this.myPlayerId) {
            status.innerHTML = `
                <h2>🎉 Victory! 🎉</h2>
                <p>You are the last player standing!</p>
                <p>Refresh the page to play again.</p>
            `;
        } else if (data.winner) {
            status.innerHTML = `
                <h2>Game Over</h2>
                <p>Player ${data.winner.substring(0, 4)} won!</p>
                <p>Refresh the page to play again.</p>
            `;
        } else {
            status.innerHTML = `
                <h2>Game Over</h2>
                <p>No winner - all players eliminated!</p>
                <p>Refresh the page to play again.</p>
            `;
        }
    }

    update() {
        // Handle local movement in local mode
        if (this.mode === 'local' && this.localPlayers) {
            const player1 = this.localPlayers['player1'];
            const player2 = this.localPlayers['player2'];

            // Calculate delta time in seconds
            const deltaTime = this.game.loop.delta / 1000;

            // Apply physics to players
            this.applyPhysics('player1', deltaTime);
            this.applyPhysics('player2', deltaTime);

            // Handle Player 1 movement (WASD/Arrow keys)
            if (player1) {
                let moved = false;
                
                if (this.isKeyDown(this.player1Keys.left)) {
                    player1.velocityX = -player1.moveSpeed;
                    player1.facingRight = false;
                    moved = true;
                } else if (this.isKeyDown(this.player1Keys.right)) {
                    player1.velocityX = player1.moveSpeed;
                    player1.facingRight = true;
                    moved = true;
                } else if (player1.isGrounded) {
                    // Apply friction when not moving on ground
                    player1.velocityX *= this.friction;
                }
                
                if (moved) {
                    this.updatePlayer('player1', player1);
                }
            }

            // Handle Player 2 movement (IJKL)
            if (player2) {
                let moved = false;
                
                if (this.isKeyDown(this.player2Keys.left)) {
                    player2.velocityX = -player2.moveSpeed;
                    player2.facingRight = false;
                    moved = true;
                } else if (this.isKeyDown(this.player2Keys.right)) {
                    player2.velocityX = player2.moveSpeed;
                    player2.facingRight = true;
                    moved = true;
                } else if (player2.isGrounded) {
                    // Apply friction when not moving on ground
                    player2.velocityX *= this.friction;
                }
                
                if (moved) {
                    this.updatePlayer('player2', player2);
                }
            }

            // Update visual representation of both players
            this.updatePlayer('player1', player1);
            this.updatePlayer('player2', player2);
        }
        
        // Handle continuous input for multiplayer
        if (this.inputManager) {
            this.inputManager.update();
        }
    }
} 