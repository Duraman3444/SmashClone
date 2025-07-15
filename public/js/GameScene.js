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
        Logger.log('GameScene initialized with data:', data);
        this.mode = data.mode || 'local';
        this.selectedCharacters = data.selectedCharacters || {
            player1: {
                id: 'red-fighter',
                name: 'Red Fighter',
                color: '#FF0000',
                moveSpeed: 200,
                jumpPower: -500,
                description: 'Balanced fighter'
            },
            player2: {
                id: 'blue-speedster',
                name: 'Blue Speedster',
                color: '#0000FF',
                moveSpeed: 250,
                jumpPower: -450,
                description: 'Fast movement'
            }
        };
        
        Logger.log('Selected characters:', this.selectedCharacters);
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
        
        // Get selected characters
        const char1 = this.selectedCharacters.player1;
        const char2 = this.selectedCharacters.player2;
        
        // Create Player 1 (using selected character) - Left side
        const player1Data = {
            id: 'player1', 
            x: 300, 
            y: 200, // Start higher so they fall to ground
            width: 40, 
            height: 60, 
            color: char1.color, 
            originalColor: char1.color,
            facingRight: true,
            health: 0, 
            lives: 3, 
            isAttacking: false,
            isBlocking: false,
            shieldHealth: 100,
            shieldRegenTime: 0,
            isGrounded: false,
            velocityX: 0,
            velocityY: 0,
            jumpPower: char1.jumpPower,
            moveSpeed: char1.moveSpeed,
            canJump: true,
            characterName: char1.name,
            characterId: char1.id
        };
        
        // Create Player 2 (using selected character) - Right side  
        const player2Data = {
            id: 'player2', 
            x: 500, 
            y: 200, // Start higher so they fall to ground
            width: 40, 
            height: 60, 
            color: char2.color, 
            originalColor: char2.color,
            facingRight: false,
            health: 0, 
            lives: 3, 
            isAttacking: false,
            isBlocking: false,
            shieldHealth: 100,
            shieldRegenTime: 0,
            isGrounded: false,
            velocityX: 0,
            velocityY: 0,
            jumpPower: char2.jumpPower,
            moveSpeed: char2.moveSpeed,
            canJump: true,
            characterName: char2.name,
            characterId: char2.id
        };
        
        this.myPlayerId = 'player1'; // Set player 1 as "You" for UI
        this.createPlayer('player1', player1Data);
        this.createPlayer('player2', player2Data);
        
        // Store player data for local updates
        this.localPlayers = {
            player1: player1Data,
            player2: player2Data
        };
        
        // Attack cooldown tracking
        this.attackCooldowns = {
            player1: {
                lastSpecialAttackTime: 0,
                isInAttack: false // Track if any attack is in progress
            },
            player2: {
                lastSpecialAttackTime: 0,
                isInAttack: false // Track if any attack is in progress
            }
        };
        
        // Physics constants
        this.gravity = 1200; // Gravity strength
        this.friction = 0.8; // Ground friction
        this.airResistance = 0.98; // Air resistance
        
        // Player 1 controls: WASD/Arrow keys + E/R for attacks + T for block
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
                this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
                this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP)
            ],
            attack: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
            specialAttack: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R),
            block: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.T)
        };
        
        // Player 2 controls: IJKL + O/P for attacks + [ for block
        this.player2Keys = {
            left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J),
            right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L),
            up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.I),
            jump: [
                this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.I)
            ],
            attack: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.O),
            specialAttack: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P),
            block: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.OPEN_BRACKET)
        };
        
        // Set up attack key events
        // Regular attacks - can be spammed (no key event, handled in update loop)
        // Special attacks - single key press with cooldown
        this.player1Keys.specialAttack.on('down', () => {
            Logger.log('Player 1 special attack');
            this.handlePlayerAttack('player1', 'special');
        });
        
        this.player2Keys.specialAttack.on('down', () => {
            Logger.log('Player 2 special attack');
            this.handlePlayerAttack('player2', 'special');
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
    
    handlePlayerJump(playerId) {
        const playerData = this.localPlayers[playerId];
        if (!playerData || playerData.eliminated) return;
        
        // Only jump if grounded and can jump
        if (playerData.isGrounded && playerData.canJump) {
            playerData.velocityY = playerData.jumpPower;
            playerData.isGrounded = false;
            playerData.canJump = false;
            Logger.log(`Player ${playerId} jumped with velocity`, playerData.velocityY);
        }
    }
    
    handlePlayerAttack(playerId, attackType) {
        const playerData = this.localPlayers[playerId];
        if (!playerData || playerData.eliminated) return;
        
        const currentTime = Date.now();
        const playerCooldown = this.attackCooldowns[playerId];
        
        // Check if any attack is already in progress
        if (playerCooldown.isInAttack) {
            Logger.log(`${playerId} attack blocked - already attacking`);
            return;
        }
        
        // Cannot attack while blocking
        if (playerData.isBlocking) {
            Logger.log(`${playerId} attack blocked - currently blocking`);
            return;
        }
        
        // Check special attack cooldown (0.5 second = 500ms)
        if (attackType === 'special') {
            const timeSinceLastSpecial = currentTime - playerCooldown.lastSpecialAttackTime;
            if (timeSinceLastSpecial < 500) {
                Logger.log(`${playerId} special attack blocked - cooldown active (${500 - timeSinceLastSpecial}ms remaining)`);
                return;
            }
            // Update last special attack time
            playerCooldown.lastSpecialAttackTime = currentTime;
        }
        
        // Set attack state
        playerData.isAttacking = true;
        playerData.attackType = attackType;
        playerCooldown.isInAttack = true;
        
        // Attack properties based on type
        let damage, knockback, range, duration;
        if (attackType === 'special') {
            damage = 25;           // Special attacks do more damage
            knockback = 400;       // Stronger knockback
            range = 100;           // Longer range
            duration = 500;        // Longer duration
        } else {
            damage = 15;           // Regular attack damage
            knockback = 200;       // Regular knockback
            range = 80;            // Regular range
            duration = 300;        // Regular duration
        }
        
        // Check for hits on other players
        this.checkPlayerHits(playerId, damage, knockback, range);
        
        // Update visual
        this.updatePlayer(playerId, playerData);
        
        // Reset attack state after duration
        setTimeout(() => {
            if (playerData && !playerData.eliminated) {
                playerData.isAttacking = false;
                playerData.attackType = null;
                playerCooldown.isInAttack = false;
                this.updatePlayer(playerId, playerData);
            }
        }, duration);
    }
    
    // Handle blocking mechanics
    handleBlocking(playerId, isBlockKeyDown) {
        const playerData = this.localPlayers[playerId];
        if (!playerData || playerData.eliminated) return;
        
        const currentTime = Date.now();
        
        // Check if shield is regenerating
        if (playerData.shieldRegenTime > 0) {
            if (currentTime >= playerData.shieldRegenTime) {
                playerData.shieldHealth = 100;
                playerData.shieldRegenTime = 0;
                Logger.log(`${playerId} shield regenerated`);
            } else {
                // Cannot block while regenerating
                playerData.isBlocking = false;
                return;
            }
        }
        
        if (isBlockKeyDown && playerData.shieldHealth > 0) {
            // Start blocking or continue blocking
            if (!playerData.isBlocking) {
                playerData.isBlocking = true;
                playerData.blockStartTime = currentTime;
                Logger.log(`${playerId} started blocking`);
            } else {
                // Check if max block time reached (5 seconds)
                const blockDuration = currentTime - playerData.blockStartTime;
                if (blockDuration >= 5000) {
                    // Force break shield
                    this.breakShield(playerId);
                    return;
                }
                
                // Reduce shield health over time (100 health over 5 seconds = 20 per second)
                const shieldDrainRate = 20 / 1000; // per millisecond
                const deltaTime = this.game.loop.delta;
                playerData.shieldHealth -= shieldDrainRate * deltaTime;
                
                if (playerData.shieldHealth <= 0) {
                    this.breakShield(playerId);
                }
            }
        } else {
            // Stop blocking
            if (playerData.isBlocking) {
                playerData.isBlocking = false;
                // Reset shield health to full if not broken
                if (playerData.shieldHealth > 0) {
                    playerData.shieldHealth = 100;
                }
                Logger.log(`${playerId} stopped blocking`);
            }
        }
        
        // Update visual
        this.updatePlayer(playerId, playerData);
    }
    
    // Break shield and start regeneration
    breakShield(playerId) {
        const playerData = this.localPlayers[playerId];
        if (!playerData) return;
        
        playerData.isBlocking = false;
        playerData.shieldHealth = 0;
        playerData.shieldRegenTime = Date.now() + 10000; // 10 seconds
        
        Logger.log(`${playerId} shield broken! Regenerating in 10 seconds`);
        
        // Visual feedback
        this.showShieldBreakEffect(playerData.x, playerData.y);
        
        // Update visual
        this.updatePlayer(playerId, playerData);
    }
    
    // Check for hits between players
    checkPlayerHits(attackerId, damage, knockback, range) {
        const attacker = this.localPlayers[attackerId];
        if (!attacker) return;
        
        // Get attack position
        const attackDirection = attacker.facingRight ? 1 : -1;
        const attackX = attacker.x + (attackDirection * (range / 2));
        const attackY = attacker.y;
        
        // Check all other players
        Object.keys(this.localPlayers).forEach(playerId => {
            if (playerId === attackerId) return; // Skip self
            
            const target = this.localPlayers[playerId];
            if (!target || target.eliminated) return;
            
            // Calculate distance
            const distance = Math.abs(target.x - attackX);
            const yDistance = Math.abs(target.y - attackY);
            
            // Check if hit connects
            if (distance < range && yDistance < 80) {
                // Check if target is blocking
                if (target.isBlocking && target.shieldHealth > 0) {
                    // Attack hits shield
                    const shieldDamage = damage * 0.5; // Shields absorb 50% damage
                    target.shieldHealth -= shieldDamage;
                    
                    Logger.log(`${attackerId} attack blocked by ${playerId} shield (${shieldDamage} shield damage)`);
                    
                    // Visual feedback for blocked attack
                    this.showBlockEffect(target.x, target.y);
                    
                    // Check if shield breaks
                    if (target.shieldHealth <= 0) {
                        this.breakShield(playerId);
                    }
                    
                    // Slight knockback even when blocked
                    const knockbackDirection = target.x > attacker.x ? 1 : -1;
                    target.velocityX = knockbackDirection * (knockback * 0.2);
                    
                } else {
                    // Normal hit
                    Logger.log(`${attackerId} hit ${playerId} with ${attacker.attackType} attack for ${damage} damage`);
                    this.applyHit(target, attacker, damage, knockback);
                }
            }
        });
    }
    
    // Show shield break visual effect
    showShieldBreakEffect(x, y) {
        // Create shield break particles
        const shieldBreakText = this.add.text(x, y - 20, 'SHIELD BREAK!', {
            fontSize: '16px',
            fill: '#FF0000',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // Animate the text
        this.tweens.add({
            targets: shieldBreakText,
            y: y - 60,
            alpha: 0,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => {
                shieldBreakText.destroy();
            }
        });
    }
    
    // Show block visual effect
    showBlockEffect(x, y) {
        // Create block effect
        const blockText = this.add.text(x, y - 10, 'BLOCKED', {
            fontSize: '12px',
            fill: '#00FFFF',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // Animate the text
        this.tweens.add({
            targets: blockText,
            y: y - 40,
            alpha: 0,
            duration: 800,
            ease: 'Power2',
            onComplete: () => {
                blockText.destroy();
            }
        });
    }
    
    // Apply hit effects to target
    applyHit(target, attacker, damage, knockback) {
        // Apply damage
        target.health += damage;
        
        // Apply knockback
        const knockbackDirection = target.x > attacker.x ? 1 : -1;
        const knockbackStrength = Math.min(target.health * 2 + knockback, 800);
        
        target.velocityX = knockbackDirection * knockbackStrength;
        target.velocityY = -knockbackStrength * 0.3; // Slight upward knockback
        target.isGrounded = false;
        
        // Visual feedback
        this.showHitEffect(target.x, target.y, damage);
        
        // Check for high damage
        if (target.health > 100) {
            Logger.log(`${target.id} has high damage: ${target.health}%`);
        }
        
        // Update UI
        this.updateUI();
    }
    
    // Show hit effect
    showHitEffect(x, y, damage) {
        const hitText = this.add.text(x, y - 20, `${damage}%`, {
            fontSize: '16px',
            fill: '#FF0000',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // Animate hit text
        this.tweens.add({
            targets: hitText,
            y: y - 50,
            alpha: 0,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => {
                hitText.destroy();
            }
        });
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
        
        // Skip physics for eliminated players
        if (player.eliminated) return;
        
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
        
        // Warning when player is near the bottom (about to fall off)
        if (player.y > 550 && player.y < 650) {
            this.showFallWarning(playerId);
        }
        
        // Respawn if player falls off stage
        if (player.y > 650) {
            Logger.log(`Player ${playerId} fell off stage, respawning`);
            this.respawnPlayer(playerId);
        }
    }
    
    // Show fall warning
    showFallWarning(playerId) {
        const player = this.players[playerId];
        if (!player || !player.fallWarning) {
            // Create warning indicator if it doesn't exist
            if (player && !player.fallWarning) {
                player.fallWarning = this.add.text(
                    this.localPlayers[playerId].x, 
                    this.localPlayers[playerId].y - 60, 
                    '⚠️ DANGER!', 
                    {
                        fontSize: '16px',
                        fill: '#FF0000',
                        fontStyle: 'bold'
                    }
                ).setOrigin(0.5);
            }
        }
        
        // Update warning position
        if (player && player.fallWarning) {
            player.fallWarning.setPosition(
                this.localPlayers[playerId].x, 
                this.localPlayers[playerId].y - 60
            );
            player.fallWarning.setVisible(true);
        }
    }
    
    // Hide fall warning
    hideFallWarning(playerId) {
        const player = this.players[playerId];
        if (player && player.fallWarning) {
            player.fallWarning.setVisible(false);
        }
    }
    
    // Respawn player
    respawnPlayer(playerId) {
        const player = this.localPlayers[playerId];
        if (!player) return;
        
        // Decrement lives
        player.lives--;
        player.health = 0;
        
        // Reset position and physics
        player.x = playerId === 'player1' ? 300 : 500;
        player.y = 200;
        player.velocityX = 0;
        player.velocityY = 0;
        player.isGrounded = false;
        player.canJump = true;
        
        Logger.log(`Player ${playerId} fell off stage! Lives remaining: ${player.lives}`);
        
        // Show respawn message
        this.showRespawnMessage(playerId, player.lives);
        
        // Check for elimination
        if (player.lives <= 0) {
            Logger.log(`Player ${playerId} eliminated! Game Over!`);
            this.handlePlayerElimination(playerId);
        }
        
        // Update UI immediately
        this.updateUI();
    }
    
    // Show respawn message
    showRespawnMessage(playerId, livesRemaining) {
        const playerName = playerId === 'player1' ? 'Player 1' : 'Player 2';
        const message = livesRemaining > 0 ? 
            `${playerName} fell off! ${livesRemaining} lives remaining` : 
            `${playerName} eliminated!`;
        
        const messageText = this.add.text(400, 150, message, {
            fontSize: '24px',
            fill: '#FFFFFF',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5);
        
        // Flash the message
        this.tweens.add({
            targets: messageText,
            alpha: 0,
            duration: 2000,
            ease: 'Power2',
            onComplete: () => {
                messageText.destroy();
            }
        });
    }
    
    // Handle player elimination
    handlePlayerElimination(playerId) {
        const player = this.localPlayers[playerId];
        if (!player) return;
        
        // Mark player as eliminated
        player.eliminated = true;
        
        // Check if only one player remains
        const alivePlayers = Object.values(this.localPlayers).filter(p => !p.eliminated);
        
        if (alivePlayers.length <= 1) {
            // Game over
            const winner = alivePlayers[0];
            const winnerName = winner ? (winner.id === 'player1' ? 'Player 1' : 'Player 2') : 'No one';
            
            Logger.log(`Game Over! Winner: ${winnerName}`);
            this.showGameOverMessage(winnerName, winner);
        }
    }
    
    // Show game over message
    showGameOverMessage(winnerName, winner) {
        // Create game over overlay
        const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.7);
        
        // Winner message
        const winnerMessage = this.add.text(400, 200, `🎉 ${winnerName} Wins! 🎉`, {
            fontSize: '48px',
            fill: winner ? winner.color : '#FFFFFF',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // Button style
        const buttonStyle = {
            fontSize: '20px',
            backgroundColor: '#333333',
            color: '#FFFFFF',
            padding: { x: 15, y: 8 }
        };
        
        // Select Character button
        const selectCharacterButton = this.add.text(200, 350, 'Select Character', buttonStyle)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                Logger.log('Select Character selected');
                this.goToCharacterSelect();
            })
            .on('pointerover', () => {
                selectCharacterButton.setStyle({ backgroundColor: '#555555' });
            })
            .on('pointerout', () => {
                selectCharacterButton.setStyle({ backgroundColor: '#333333' });
            });
        
        // Rematch button
        const rematchButton = this.add.text(400, 350, 'Rematch', buttonStyle)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                Logger.log('Rematch selected');
                this.restartGame();
            })
            .on('pointerover', () => {
                rematchButton.setStyle({ backgroundColor: '#555555' });
            })
            .on('pointerout', () => {
                rematchButton.setStyle({ backgroundColor: '#333333' });
            });
        
        // Main menu button
        const mainMenuButton = this.add.text(600, 350, 'Main Menu', buttonStyle)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                Logger.log('Going to main menu');
                this.goToMainMenu();
            })
            .on('pointerover', () => {
                mainMenuButton.setStyle({ backgroundColor: '#555555' });
            })
            .on('pointerout', () => {
                mainMenuButton.setStyle({ backgroundColor: '#333333' });
            });
        
        // Controls instruction
        const controlsText = this.add.text(400, 420, 'Click to select an option', {
            fontSize: '16px',
            fill: '#CCCCCC'
        }).setOrigin(0.5);
        
        // Animate the winner message
        this.tweens.add({
            targets: winnerMessage,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 500,
            yoyo: true,
            repeat: -1,
            ease: 'Power2'
        });
        
        // Store overlay elements for cleanup
        this.gameOverElements = {
            overlay: overlay,
            winnerMessage: winnerMessage,
            selectCharacterButton: selectCharacterButton,
            rematchButton: rematchButton,
            mainMenuButton: mainMenuButton,
            controlsText: controlsText
        };
    }
    
    // Restart the current game
    restartGame() {
        Logger.log('Restarting game');
        
        // Clean up game over elements
        if (this.gameOverElements) {
            Object.values(this.gameOverElements).forEach(element => {
                if (element && element.destroy) {
                    element.destroy();
                }
            });
            this.gameOverElements = null;
        }
        
        // Reset local players
        if (this.localPlayers) {
            this.localPlayers.player1.lives = 3;
            this.localPlayers.player1.health = 0;
            this.localPlayers.player1.x = 300;
            this.localPlayers.player1.y = 200;
            this.localPlayers.player1.velocityX = 0;
            this.localPlayers.player1.velocityY = 0;
            this.localPlayers.player1.isGrounded = false;
            this.localPlayers.player1.eliminated = false;
            this.localPlayers.player1.canJump = true;
            
            this.localPlayers.player2.lives = 3;
            this.localPlayers.player2.health = 0;
            this.localPlayers.player2.x = 500;
            this.localPlayers.player2.y = 200;
            this.localPlayers.player2.velocityX = 0;
            this.localPlayers.player2.velocityY = 0;
            this.localPlayers.player2.isGrounded = false;
            this.localPlayers.player2.eliminated = false;
            this.localPlayers.player2.canJump = true;
        }
        
        // Reset visual players
        if (this.players) {
            Object.keys(this.players).forEach(playerId => {
                const player = this.players[playerId];
                if (player) {
                    player.body.setAlpha(1);
                    player.body.setFillStyle(player.originalColor);
                    player.healthText.setText('0%');
                    player.healthText.setStyle({ fill: '#fff' });
                    player.livesText.setText('Lives: 3');
                    player.livesText.setStyle({ fill: '#00FF00' });
                    
                    // Hide fall warnings
                    if (player.fallWarning) {
                        player.fallWarning.setVisible(false);
                    }
                }
            });
        }
        
        // Update UI
        this.updateUI();
        
        Logger.log('Game restarted successfully');
    }
    
    // Go back to main menu
    goToMainMenu() {
        Logger.log('Going to main menu');
        
        // Clean up game over elements
        if (this.gameOverElements) {
            Object.values(this.gameOverElements).forEach(element => {
                if (element && element.destroy) {
                    element.destroy();
                }
            });
            this.gameOverElements = null;
        }
        
        // Stop the game scene and go to menu
        this.scene.start('MenuScene');
    }
    
    // Go to character select screen
    goToCharacterSelect() {
        Logger.log('Going to Character Select Scene');
        
        // Clean up game over elements
        if (this.gameOverElements) {
            Object.values(this.gameOverElements).forEach(element => {
                if (element && element.destroy) {
                    element.destroy();
                }
            });
            this.gameOverElements = null;
        }
        
        // Go to character select with same game mode
        this.scene.start('CharacterSelectScene', { mode: this.mode });
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
        
        // Create shield health display
        const shieldText = this.add.text(
            playerData.x, 
            playerData.y + 50, 
            `Shield: ${Math.ceil(playerData.shieldHealth)}%`, 
            { fontSize: '10px', fill: '#00FFFF' }
        );
        shieldText.setOrigin(0.5);
        
        // Create blocking indicator
        const blockIndicator = this.add.rectangle(
            playerData.x,
            playerData.y,
            50, 90,
            0x00FFFF
        );
        blockIndicator.setAlpha(0);
        blockIndicator.setStrokeStyle(2, 0x00FFFF);
        
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
        player.add(shieldText);
        player.add(blockIndicator);
        player.add(attackIndicator);
        
        // Store references and original color
        this.players[playerId] = {
            group: player,
            body: body,
            face: face,
            healthText: healthText,
            livesText: livesText,
            shieldText: shieldText,
            blockIndicator: blockIndicator,
            attackIndicator: attackIndicator,
            originalColor: playerData.color, // Store original color
            data: playerData
        };
        
        Logger.log('Player created successfully');
    }

    updatePlayer(playerId, playerData) {
        const player = this.players[playerId];
        if (!player) return;
        
        // Handle eliminated players
        if (playerData.eliminated) {
            player.body.setAlpha(0.3); // Make eliminated player semi-transparent
            player.body.setFillStyle(0x888888); // Gray out eliminated player
            player.healthText.setText('ELIMINATED');
            player.healthText.setStyle({ fill: '#FF0000' });
            player.livesText.setText('Lives: 0');
            player.livesText.setStyle({ fill: '#FF0000' });
            return; // Don't update position/other properties for eliminated players
        }
        
        // Reset appearance for active players
        player.body.setAlpha(1);
        // Use stored original color
        player.body.setFillStyle(player.originalColor);
        
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
        player.healthText.setStyle({ fill: '#fff' }); // Reset color
        
        // Update lives display with emphasis
        player.livesText.setPosition(playerData.x, playerData.y + 35);
        player.livesText.setText(`Lives: ${playerData.lives}`);
        
        // Color code lives based on remaining count
        if (playerData.lives <= 1) {
            player.livesText.setStyle({ fill: '#FF0000' }); // Red for critical
        } else if (playerData.lives <= 2) {
            player.livesText.setStyle({ fill: '#FFFF00' }); // Yellow for warning
        } else {
            player.livesText.setStyle({ fill: '#00FF00' }); // Green for safe
        }
        
        // Update shield health display
        player.shieldText.setPosition(playerData.x, playerData.y + 50);
        player.shieldText.setText(`Shield: ${Math.ceil(playerData.shieldHealth)}%`);
        
        // Update blocking indicator
        player.blockIndicator.setPosition(playerData.x, playerData.y);
        
        // Show blocking indicator if blocking
        if (playerData.isBlocking) {
            player.blockIndicator.setAlpha(0.5);
        } else {
            player.blockIndicator.setAlpha(0);
        }
        
        // Update attack indicator
        player.attackIndicator.setPosition(
            playerData.x + (playerData.facingRight ? 50 : -50),
            playerData.y
        );
        
        // Show attack indicator if attacking
        if (playerData.isAttacking) {
            player.attackIndicator.setAlpha(0.5);
            
            // Different colors and sizes for different attack types
            if (playerData.attackType === 'special') {
                player.attackIndicator.setFillStyle(0x9900FF); // Purple for special attacks
                player.attackIndicator.setSize(100, 100); // Larger for special attacks
                player.attackIndicator.setStrokeStyle(3, 0x9900FF);
            } else {
                player.attackIndicator.setFillStyle(0xFF0000); // Red for regular attacks
                player.attackIndicator.setSize(80, 80); // Regular size
                player.attackIndicator.setStrokeStyle(2, 0xFF0000);
            }
        } else {
            player.attackIndicator.setAlpha(0);
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

            // Handle Player 1 movement (only if not eliminated)
            if (player1 && !player1.eliminated) {
                let moved = false;
                
                // Handle blocking
                this.handleBlocking('player1', this.player1Keys.block.isDown);
                
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
                
                // Handle regular attack spam
                if (this.player1Keys.attack.isDown) {
                    this.handlePlayerAttack('player1', 'regular');
                }
                
                if (moved) {
                    this.updatePlayer('player1', player1);
                }
                
                // Hide fall warning if player is safe
                if (player1.y <= 550) {
                    this.hideFallWarning('player1');
                }
            }

            // Handle Player 2 movement (only if not eliminated)
            if (player2 && !player2.eliminated) {
                let moved = false;
                
                // Handle blocking
                this.handleBlocking('player2', this.player2Keys.block.isDown);
                
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
                
                // Handle regular attack spam
                if (this.player2Keys.attack.isDown) {
                    this.handlePlayerAttack('player2', 'regular');
                }
                
                if (moved) {
                    this.updatePlayer('player2', player2);
                }
                
                // Hide fall warning if player is safe
                if (player2.y <= 550) {
                    this.hideFallWarning('player2');
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