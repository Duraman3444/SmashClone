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
        // Add preload method to load Meow Knight sprites
        Logger.log('GameScene preload - Loading Meow Knight sprites');
        
        // Load Meow Knight sprite sheets (vertical sprite sheets)
        // Based on actual dimensions from file analysis
        this.load.spritesheet('meow-knight-idle', 'assets/characters/Meow Knight/Meow-Knight_Idle.png', {
            frameWidth: 16,
            frameHeight: 16  // 16x146 = 9 frames of 16x16
        });
        
        this.load.spritesheet('meow-knight-run', 'assets/characters/Meow Knight/Meow-Knight_Run.png', {
            frameWidth: 16,
            frameHeight: 16  // 16x230 = 14 frames of 16x16
        });
        
        this.load.spritesheet('meow-knight-jump', 'assets/characters/Meow Knight/Meow-Knight_Jump.png', {
            frameWidth: 16,
            frameHeight: 16  // 16x366 = 23 frames of 16x16
        });
        
        // Attack sprite sheets - using actual dimensions
        this.load.spritesheet('meow-knight-attack-1', 'assets/characters/Meow Knight/Meow-Knight_Attack_1.png', {
            frameWidth: 32,
            frameHeight: 32  // 32x314 = ~10 frames of 32x32
        });
        
        this.load.spritesheet('meow-knight-attack-2', 'assets/characters/Meow Knight/Meow-Knight_Attack_2.png', {
            frameWidth: 48,
            frameHeight: 32  // 48x142 = ~4 frames of 48x32
        });
        
        this.load.spritesheet('meow-knight-attack-3', 'assets/characters/Meow Knight/Meow-Knight_Attack_3.png', {
            frameWidth: 32,
            frameHeight: 32  // 32x142 = ~4 frames of 32x32
        });
        
        this.load.spritesheet('meow-knight-attack-4', 'assets/characters/Meow Knight/Meow-Knight_Attack_4.png', {
            frameWidth: 80,
            frameHeight: 32  // 80x326 = ~10 frames of 80x32
        });
        
        this.load.spritesheet('meow-knight-dodge', 'assets/characters/Meow Knight/Meow-Knight_Dodge.png', {
            frameWidth: 32,
            frameHeight: 32  // 32x198 = ~6 frames of 32x32
        });
        
        this.load.spritesheet('meow-knight-damage', 'assets/characters/Meow Knight/Meow-Knight_Take_Damage.png', {
            frameWidth: 16,
            frameHeight: 16  // 16x68 = 4 frames of 16x16
        });
        
        this.load.spritesheet('meow-knight-death', 'assets/characters/Meow Knight/Meow-Knight_Death.png', {
            frameWidth: 32,
            frameHeight: 16  // 32x146 = 9 frames of 32x16
        });
        
        // Load Finn the Human sprite sheet
        Logger.log('GameScene preload - Loading Finn the Human sprites');
        this.load.spritesheet('finn-idle', 'assets/characters/Finn the Human/FinnSprite.png', {
            frameWidth: 32,
            frameHeight: 32  // Estimated frame size, will need adjustment based on actual sprite
        });
        
        // For Finn, we'll use different frames from the same sprite sheet for different attacks
        this.load.spritesheet('finn-attack-white', 'assets/characters/Finn the Human/FinnSprite.png', {
            frameWidth: 32,
            frameHeight: 32  // White sword attack frames
        });
        
        this.load.spritesheet('finn-attack-golden', 'assets/characters/Finn the Human/FinnSprite.png', {
            frameWidth: 32,
            frameHeight: 32  // Golden sword attack frames
        });
        
        // Load Blue_witch sprite sheets
        Logger.log('GameScene preload - Loading Blue_witch sprites');
        this.load.spritesheet('blue-witch-idle', 'assets/characters/Blue_witch/B_witch_idle.png', {
            frameWidth: 32,
            frameHeight: 32  // Estimated frame size for Blue_witch
        });
        
        this.load.spritesheet('blue-witch-run', 'assets/characters/Blue_witch/B_witch_run.png', {
            frameWidth: 32,
            frameHeight: 32  // Blue_witch running frames
        });
        
        this.load.spritesheet('blue-witch-attack', 'assets/characters/Blue_witch/B_witch_attack.png', {
            frameWidth: 32,
            frameHeight: 32  // Blue_witch regular attack frames
        });
        
        this.load.spritesheet('blue-witch-charge', 'assets/characters/Blue_witch/B_witch_charge.png', {
            frameWidth: 32,
            frameHeight: 32  // Blue_witch special attack (charge) frames
        });
        
        this.load.spritesheet('blue-witch-death', 'assets/characters/Blue_witch/B_witch_death.png', {
            frameWidth: 32,
            frameHeight: 32  // Blue_witch death frames
        });
        
        this.load.spritesheet('blue-witch-damage', 'assets/characters/Blue_witch/B_witch_take_damage.png', {
            frameWidth: 32,
            frameHeight: 32  // Blue_witch damage frames
        });
        
        // Load Archer sprite sheets
        Logger.log('GameScene preload - Loading Archer sprites');
        this.load.spritesheet('archer-idle', 'assets/characters/Archer/Idle and running.png', {
            frameWidth: 64,
            frameHeight: 64  // Archer idle and running frames - adjusted size
        });
        
        this.load.spritesheet('archer-run', 'assets/characters/Archer/Idle and running.png', {
            frameWidth: 64,
            frameHeight: 64  // Archer running frames (same file as idle) - adjusted size
        });
        
        this.load.spritesheet('archer-jump', 'assets/characters/Archer/Jumping.png', {
            frameWidth: 64,
            frameHeight: 64  // Archer jumping frames - adjusted size
        });
        
        this.load.spritesheet('archer-attack', 'assets/characters/Archer/Normal Attack.png', {
            frameWidth: 64,
            frameHeight: 64  // Archer regular attack frames - adjusted size
        });
        
        this.load.spritesheet('archer-attack-low', 'assets/characters/Archer/Low attack.png', {
            frameWidth: 64,
            frameHeight: 64  // Archer down special attack frames - adjusted size
        });
        
        this.load.spritesheet('archer-attack-high', 'assets/characters/Archer/High Attack.png', {
            frameWidth: 64,
            frameHeight: 64  // Archer up special attack frames - adjusted size
        });
        
        this.load.spritesheet('archer-dash', 'assets/characters/Archer/Dash.png', {
            frameWidth: 64,
            frameHeight: 64  // Archer dash frames - adjusted size
        });
        
        this.load.spritesheet('archer-death', 'assets/characters/Archer/death.png', {
            frameWidth: 64,
            frameHeight: 64  // Archer death frames - adjusted size
        });
        
        // Load Stickman sprite sheets
        Logger.log('GameScene preload - Loading Stickman sprites');
        this.load.spritesheet('stickman-idle', 'assets/characters/StickmanPack/Idle/Thin.png', {
            frameWidth: 64,
            frameHeight: 64  // Stickman idle frames - 384x64 = 6 frames of 64x64
        });
        
        this.load.spritesheet('stickman-run', 'assets/characters/StickmanPack/Run/Run.png', {
            frameWidth: 64,
            frameHeight: 64  // Stickman run frames - 576x64 = 9 frames of 64x64
        });
        
        this.load.spritesheet('stickman-jump', 'assets/characters/StickmanPack/Jump/Jump.png', {
            frameWidth: 64,
            frameHeight: 64  // Stickman jump frames - 128x128 = 2 frames of 64x64
        });
        
        this.load.spritesheet('stickman-punch', 'assets/characters/StickmanPack/Punch/Punch.png', {
            frameWidth: 64,
            frameHeight: 64  // Stickman punch frames - 256x192 = 4 frames of 64x64
        });
        
        this.load.spritesheet('stickman-death', 'assets/characters/StickmanPack/Death/Death.png', {
            frameWidth: 64,
            frameHeight: 64  // Stickman death frames - 192x192 = 3 frames of 64x64
        });
    }

    create() {
        Logger.log('GameScene create');
        
        // Create sprite animations after loading
        this.createAnimations();
        
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
    
    // Create sprite animations from loaded images
    createAnimations() {
        Logger.log('Creating Meow Knight animations');
        
        // Create animations for different states
        // Note: These are vertical sprite sheets, so we need to calculate frame configurations
        
        // Idle animation (16x146 = 9 frames)
        this.anims.create({
            key: 'meow-knight-idle',
            frames: this.anims.generateFrameNumbers('meow-knight-idle', { 
                start: 0, 
                end: 8
            }),
            frameRate: 8,
            repeat: 0
        });
        
        // Run animation (16x230 = 14 frames)
        this.anims.create({
            key: 'meow-knight-run',
            frames: this.anims.generateFrameNumbers('meow-knight-run', { 
                start: 0, 
                end: 13
            }),
            frameRate: 8, // Reduced from 10 to 8 for more natural movement
            repeat: 0
        });
        
        // Jump animation (16x366 = 22 frames)
        this.anims.create({
            key: 'meow-knight-jump',
            frames: this.anims.generateFrameNumbers('meow-knight-jump', { 
                start: 0, 
                end: 21
            }),
            frameRate: 8,
            repeat: -1  // Loop jump animation continuously
        });
        
        // Attack animations (based on actual sprite sheet dimensions)
        this.anims.create({
            key: 'meow-knight-attack-1',
            frames: this.anims.generateFrameNumbers('meow-knight-attack-1', { 
                start: 0, 
                end: 8
            }),
            frameRate: 10, // Reduced from 15 to 10 for more natural attacks
            repeat: 0
        });
        
        this.anims.create({
            key: 'meow-knight-attack-2',
            frames: this.anims.generateFrameNumbers('meow-knight-attack-2', { 
                start: 0, 
                end: 3
            }),
            frameRate: 8, // Reduced from 12 to 8 for more natural attacks
            repeat: 0
        });
        
        this.anims.create({
            key: 'meow-knight-attack-3',
            frames: this.anims.generateFrameNumbers('meow-knight-attack-3', { 
                start: 0, 
                end: 3
            }),
            frameRate: 8, // Reduced from 12 to 8 for more natural attacks
            repeat: 0
        });
        
        this.anims.create({
            key: 'meow-knight-attack-4',
            frames: this.anims.generateFrameNumbers('meow-knight-attack-4', { 
                start: 0, 
                end: 9
            }),
            frameRate: 10, // Reduced from 15 to 10 for more natural special attacks
            repeat: 0
        });
        
        // Dodge/Block animation (32x198 = 6 frames)
        this.anims.create({
            key: 'meow-knight-dodge',
            frames: this.anims.generateFrameNumbers('meow-knight-dodge', { 
                start: 0, 
                end: 5
            }),
            frameRate: 8,
            repeat: 0
        });
        
        // Damage animation (16x68 = 4 frames)
        this.anims.create({
            key: 'meow-knight-damage',
            frames: this.anims.generateFrameNumbers('meow-knight-damage', { 
                start: 0, 
                end: 3
            }),
            frameRate: 8,
            repeat: 0
        });
        
        // Death animation (32x146 = 9 frames)
        this.anims.create({
            key: 'meow-knight-death',
            frames: this.anims.generateFrameNumbers('meow-knight-death', { 
                start: 0, 
                end: 8
            }),
            frameRate: 6,
            repeat: 0
        });
        
        Logger.log('Meow Knight animations created');
        
        // Create Finn the Human animations
        Logger.log('Creating Finn the Human animations');
        
        // Finn idle animation (assuming frames 0-2 are idle)
        this.anims.create({
            key: 'finn-idle',
            frames: this.anims.generateFrameNumbers('finn-idle', { 
                start: 0, 
                end: 2
            }),
            frameRate: 6,
            repeat: -1
        });
        
        // Finn white sword attack (regular attack) - assuming frames 3-5
        this.anims.create({
            key: 'finn-attack-white',
            frames: this.anims.generateFrameNumbers('finn-attack-white', { 
                start: 3, 
                end: 5
            }),
            frameRate: 10,
            repeat: 0
        });
        
        // Finn golden sword attack (special attack) - assuming frames 6-8
        this.anims.create({
            key: 'finn-attack-golden',
            frames: this.anims.generateFrameNumbers('finn-attack-golden', { 
                start: 6, 
                end: 8
            }),
            frameRate: 10,
            repeat: 0
        });
        
        Logger.log('Finn the Human animations created');
        
        // Create Blue_witch animations
        Logger.log('Creating Blue_witch animations');
        
        // Blue_witch idle animation (assuming 4 frames)
        this.anims.create({
            key: 'blue-witch-idle',
            frames: this.anims.generateFrameNumbers('blue-witch-idle', { 
                start: 0, 
                end: 3
            }),
            frameRate: 6,
            repeat: -1
        });
        
        // Blue_witch run animation (assuming 6 frames)
        this.anims.create({
            key: 'blue-witch-run',
            frames: this.anims.generateFrameNumbers('blue-witch-run', { 
                start: 0, 
                end: 5
            }),
            frameRate: 10,
            repeat: -1
        });
        
        // Blue_witch regular attack animation (assuming 8 frames)
        this.anims.create({
            key: 'blue-witch-attack',
            frames: this.anims.generateFrameNumbers('blue-witch-attack', { 
                start: 0, 
                end: 7
            }),
            frameRate: 12,
            repeat: 0
        });
        
        // Blue_witch special attack (charge) animation (assuming 6 frames)
        this.anims.create({
            key: 'blue-witch-charge',
            frames: this.anims.generateFrameNumbers('blue-witch-charge', { 
                start: 0, 
                end: 5
            }),
            frameRate: 8,
            repeat: 0
        });
        
        // Blue_witch death animation (assuming 8 frames)
        this.anims.create({
            key: 'blue-witch-death',
            frames: this.anims.generateFrameNumbers('blue-witch-death', { 
                start: 0, 
                end: 7
            }),
            frameRate: 6,
            repeat: 0
        });
        
        // Blue_witch damage animation (assuming 4 frames)
        this.anims.create({
            key: 'blue-witch-damage',
            frames: this.anims.generateFrameNumbers('blue-witch-damage', { 
                start: 0, 
                end: 3
            }),
            frameRate: 10,
            repeat: 0
        });
        
        Logger.log('Blue_witch animations created');
        
        // Create Archer animations
        Logger.log('Creating Archer animations');
        
        // Archer idle animation (single frame - no swapping)
        this.anims.create({
            key: 'archer-idle',
            frames: this.anims.generateFrameNumbers('archer-idle', { 
                start: 0, 
                end: 0  // Single frame only
            }),
            frameRate: 1,
            repeat: 0  // No repeat - completely static
        });
        
        // Archer run animation (single frame for stability)
        this.anims.create({
            key: 'archer-run',
            frames: this.anims.generateFrameNumbers('archer-run', { 
                start: 1, 
                end: 1  // Single frame only
            }),
            frameRate: 1,
            repeat: 0  // No repeat - completely static
        });
        
        // Archer jump animation (keep as is - user said jumping is fine)
        this.anims.create({
            key: 'archer-jump',
            frames: this.anims.generateFrameNumbers('archer-jump', { 
                start: 0, 
                end: 2  // Keep jumping animation
            }),
            frameRate: 6,
            repeat: 0
        });
        
        // Archer regular attack animation (single frame)
        this.anims.create({
            key: 'archer-attack',
            frames: this.anims.generateFrameNumbers('archer-attack', { 
                start: 0, 
                end: 0  // Single frame only
            }),
            frameRate: 1,
            repeat: 0
        });
        
        // Archer down special attack (single frame)
        this.anims.create({
            key: 'archer-attack-low',
            frames: this.anims.generateFrameNumbers('archer-attack-low', { 
                start: 0, 
                end: 0  // Single frame only
            }),
            frameRate: 1,
            repeat: 0
        });
        
        // Archer up special attack (single frame)
        this.anims.create({
            key: 'archer-attack-high',
            frames: this.anims.generateFrameNumbers('archer-attack-high', { 
                start: 0, 
                end: 0  // Single frame only
            }),
            frameRate: 1,
            repeat: 0
        });
        
        // Archer dash animation (single frame)
        this.anims.create({
            key: 'archer-dash',
            frames: this.anims.generateFrameNumbers('archer-dash', { 
                start: 0, 
                end: 0  // Single frame only
            }),
            frameRate: 1,
            repeat: 0
        });
        
        // Archer death animation (single frame)
        this.anims.create({
            key: 'archer-death',
            frames: this.anims.generateFrameNumbers('archer-death', { 
                start: 0, 
                end: 0  // Single frame only
            }),
            frameRate: 1,
            repeat: 0
        });
        
        Logger.log('Archer animations created');
        
        // Create Stickman animations
        Logger.log('Creating Stickman animations');
        
        // Stickman idle animation (6 frames)
        this.anims.create({
            key: 'stickman-idle',
            frames: this.anims.generateFrameNumbers('stickman-idle', { 
                start: 0, 
                end: 5  // 6 frames total
            }),
            frameRate: 6,
            repeat: -1  // Loop continuously
        });
        
        // Stickman run animation (9 frames)
        this.anims.create({
            key: 'stickman-run',
            frames: this.anims.generateFrameNumbers('stickman-run', { 
                start: 0, 
                end: 8  // 9 frames total
            }),
            frameRate: 12,
            repeat: -1  // Loop continuously
        });
        
        // Stickman jump animation (2 frames)
        this.anims.create({
            key: 'stickman-jump',
            frames: this.anims.generateFrameNumbers('stickman-jump', { 
                start: 0, 
                end: 1  // 2 frames total
            }),
            frameRate: 8,
            repeat: -1  // Loop continuously
        });
        
        // Stickman punch animation (4 frames)
        this.anims.create({
            key: 'stickman-punch',
            frames: this.anims.generateFrameNumbers('stickman-punch', { 
                start: 0, 
                end: 3  // 4 frames total
            }),
            frameRate: 10,
            repeat: 0  // Play once for attack
        });
        
        // Stickman death animation (3 frames)
        this.anims.create({
            key: 'stickman-death',
            frames: this.anims.generateFrameNumbers('stickman-death', { 
                start: 0, 
                end: 2  // 3 frames total
            }),
            frameRate: 6,
            repeat: 0  // Play once for death
        });
        
        Logger.log('Stickman animations created');
    }
    
    // Update sprite animations based on character state
    updateSpriteAnimations(player, playerData) {
        const sprite = player.body;
        let targetAnimation = null;
        
        // Different animation logic for different characters
        if (playerData.characterId === 'red-fighter') {
            // Meow Knight animations
            targetAnimation = 'meow-knight-idle';
            
            // Priority order: Death > Attack > Dodge > Block > Jump > Run > Idle
            if (playerData.eliminated) {
                targetAnimation = 'meow-knight-death';
            } else if (playerData.isAttacking) {
                // Choose attack animation based on attack type or direction
                if (playerData.attackType === 'special') {
                    targetAnimation = 'meow-knight-attack-4'; // Use attack-4 for special attacks
                } else {
                    // Map directional attacks to different animations
                    switch (playerData.attackDirection) {
                        case 'up':
                            targetAnimation = 'meow-knight-attack-1';
                            break;
                        case 'down':
                            targetAnimation = 'meow-knight-attack-2';
                            break;
                        case 'left':
                        case 'right':
                            targetAnimation = 'meow-knight-attack-3';
                            break;
                        default: // forward attack
                            targetAnimation = 'meow-knight-attack-1';
                            break;
                    }
                }
            } else if (playerData.isDodging) {
                targetAnimation = 'meow-knight-dodge';
            } else if (playerData.isBlocking) {
                targetAnimation = 'STOP_ANIMATION'; // Stop animation when blocking
            } else if (!playerData.isGrounded) {
                targetAnimation = 'STOP_ANIMATION'; // Stop animation when jumping
            } else if (Math.abs(playerData.velocityX) > 50) {
                // Character is moving fast enough to run
                targetAnimation = 'meow-knight-run';
            } else {
                targetAnimation = 'meow-knight-idle';
            }
        } else if (playerData.characterId === 'finn-human') {
            // Finn the Human animations
            targetAnimation = 'finn-idle';
            
            // Priority order: Death > Attack > Block > Jump > Run > Idle
            if (playerData.eliminated) {
                targetAnimation = 'finn-idle'; // No death animation yet, use idle
            } else if (playerData.isAttacking) {
                if (playerData.attackType === 'special') {
                    targetAnimation = 'finn-attack-golden'; // Golden sword for special attacks
                } else {
                    targetAnimation = 'finn-attack-white'; // White sword for regular attacks
                }
            } else if (playerData.isBlocking) {
                targetAnimation = 'STOP_ANIMATION'; // Stop animation when blocking
            } else if (!playerData.isGrounded) {
                targetAnimation = 'STOP_ANIMATION'; // Stop animation when jumping
            } else if (Math.abs(playerData.velocityX) > 50) {
                targetAnimation = 'finn-idle'; // No run animation yet, use idle
            } else {
                targetAnimation = 'finn-idle';
            }
        } else if (playerData.characterId === 'blue-witch') {
            // Blue_witch animations
            targetAnimation = 'blue-witch-idle';
            
            // Priority order: Death > Attack > Block > Jump > Run > Idle
            if (playerData.eliminated) {
                targetAnimation = 'blue-witch-death';
            } else if (playerData.isAttacking) {
                if (playerData.attackType === 'special') {
                    targetAnimation = 'blue-witch-charge'; // Charge animation for special attacks
                } else {
                    targetAnimation = 'blue-witch-attack'; // Regular attack animation
                }
            } else if (playerData.isBlocking) {
                targetAnimation = 'STOP_ANIMATION'; // Stop animation when blocking
            } else if (!playerData.isGrounded) {
                targetAnimation = 'STOP_ANIMATION'; // Stop animation when jumping
            } else if (Math.abs(playerData.velocityX) > 50) {
                targetAnimation = 'blue-witch-run'; // Use run animation when moving
            } else {
                targetAnimation = 'blue-witch-idle';
            }
        } else if (playerData.characterId === 'archer') {
            // Archer animations
            targetAnimation = 'archer-idle';
            
            // Priority order: Death > Attack > Block > Jump > Run > Idle
            if (playerData.eliminated) {
                targetAnimation = 'archer-death';
            } else if (playerData.isAttacking) {
                if (playerData.attackType === 'special') {
                    // Directional special attacks for archer
                    switch (playerData.attackDirection) {
                        case 'up':
                            targetAnimation = 'archer-attack-high'; // High attack for up special
                            break;
                        case 'down':
                            targetAnimation = 'archer-attack-low'; // Low attack for down special
                            break;
                        default:
                            targetAnimation = 'archer-attack'; // Regular attack animation for forward special
                            break;
                    }
                } else {
                    targetAnimation = 'archer-attack'; // Regular attack animation
                }
            } else if (playerData.isBlocking) {
                targetAnimation = 'STOP_ANIMATION'; // Stop animation when blocking
            } else if (!playerData.isGrounded) {
                targetAnimation = 'archer-jump'; // Use jump animation when in air
            } else if (Math.abs(playerData.velocityX) > 50) {
                targetAnimation = 'archer-run'; // Use run animation when moving
            } else {
                targetAnimation = 'archer-idle';
            }
        } else if (playerData.characterId === 'stickman') {
            // Stickman animations
            targetAnimation = 'stickman-idle';
            
            // Priority order: Death > Attack > Block > Jump > Run > Idle
            if (playerData.eliminated) {
                targetAnimation = 'stickman-death';
            } else if (playerData.isAttacking) {
                targetAnimation = 'stickman-punch'; // Use punch animation for all attacks
            } else if (playerData.isBlocking) {
                targetAnimation = 'stickman-idle'; // Use idle animation when blocking
            } else if (!playerData.isGrounded) {
                targetAnimation = 'stickman-jump'; // Use jump animation when in air
            } else if (Math.abs(playerData.velocityX) > 50) {
                targetAnimation = 'stickman-run'; // Use run animation when moving
            } else {
                targetAnimation = 'stickman-idle';
            }
        } else {
            // Default fallback
            return;
        }
        
        // Handle animation playing logic
        // For attack animations: play once and don't restart until different animation
        // For jump animations: loop smoothly
        // For other animations: play once and stick to final frame
        
        const currentAnimKey = sprite.anims.currentAnim?.key;
        const isCurrentlyPlaying = sprite.anims.isPlaying;
        
        if (targetAnimation === 'STOP_ANIMATION') {
            // Stop all animations and hold on frame 0 of idle
            sprite.anims.stop();
            sprite.setFrame(0); // Set to first frame of idle animation
        } else if (currentAnimKey !== targetAnimation) {
            // Different animation requested, play it
            sprite.play(targetAnimation);
        } else if (targetAnimation.includes('attack') && isCurrentlyPlaying) {
            // Attack animation is already playing, don't restart it
            // Let it finish and stick to final frame
        } else if (targetAnimation === 'meow-knight-jump' && !isCurrentlyPlaying) {
            // Jump animation should loop, restart if not playing
            sprite.play(targetAnimation);
        } else if (!isCurrentlyPlaying && !targetAnimation.includes('attack')) {
            // Non-attack animation completed, restart it
            sprite.play(targetAnimation);
        }
        
        // Handle damage flash effect
        if (playerData.health > (playerData.previousHealth || 0)) {
            // Player took damage, flash red briefly
            sprite.setTint(0xFF0000);
            this.time.delayedCall(200, () => {
                if (playerData.characterId === 'red-fighter') {
                    sprite.setTint(0xFFAAAA); // Return to normal red tint
                } else if (playerData.characterId === 'finn-human') {
                    sprite.setTint(0xAADDFF); // Return to normal blue tint
                } else if (playerData.characterId === 'blue-witch') {
                    sprite.setTint(0xCCAAFF); // Return to normal purple tint
                } else if (playerData.characterId === 'archer') {
                    sprite.setTint(0xAAFFAA); // Return to normal green tint
                } else if (playerData.characterId === 'stickman') {
                    sprite.setTint(0xFFFFAA); // Return to normal yellow tint
                }
            });
        }
        
        // Store previous health for damage detection
        playerData.previousHealth = playerData.health;
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
            isDodging: false,
            dodgeStartTime: 0,
            dodgeEndTime: 0,
            dodgeCooldown: 0,
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
            isDodging: false,
            dodgeStartTime: 0,
            dodgeEndTime: 0,
            dodgeCooldown: 0,
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
        
        // Player 1 controls: WASD/Arrow keys + E/R for attacks + T for block + Q for dodge
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
            down: [
                this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
                this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN)
            ],
            jump: [
                this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
                this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
                this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP)
            ],
            attack: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
            specialAttack: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R),
            block: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.T),
            dodge: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q)
        };
        
        // Player 2 controls: IJKL + O/P for attacks + [ for block + U for dodge
        this.player2Keys = {
            left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J),
            right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L),
            up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.I),
            down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K),
            jump: [
                this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.I)
            ],
            attack: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.O),
            specialAttack: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P),
            block: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.OPEN_BRACKET),
            dodge: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.U)
        };
        
        // Set up attack key events
        // Regular attacks - can be spammed (no key event, handled in update loop)
        // Special attacks - single key press with cooldown
        this.player1Keys.specialAttack.on('down', () => {
            // Determine attack direction based on held movement keys
            let direction = 'forward';
            if (this.isKeyDown(this.player1Keys.up)) {
                direction = 'up';
            } else if (this.isKeyDown(this.player1Keys.down)) {
                direction = 'down';
            } else if (this.isKeyDown(this.player1Keys.left)) {
                direction = 'left';
            } else if (this.isKeyDown(this.player1Keys.right)) {
                direction = 'right';
            }
            
            Logger.log(`Player 1 special attack ${direction}`);
            this.handlePlayerAttack('player1', 'special', direction);
        });
        
        this.player2Keys.specialAttack.on('down', () => {
            // Determine attack direction based on held movement keys
            let direction = 'forward';
            if (this.isKeyDown(this.player2Keys.up)) {
                direction = 'up';
            } else if (this.isKeyDown(this.player2Keys.down)) {
                direction = 'down';
            } else if (this.isKeyDown(this.player2Keys.left)) {
                direction = 'left';
            } else if (this.isKeyDown(this.player2Keys.right)) {
                direction = 'right';
            }
            
            Logger.log(`Player 2 special attack ${direction}`);
            this.handlePlayerAttack('player2', 'special', direction);
        });
        
        // Set up dodge key events
        this.player1Keys.dodge.on('down', () => {
            Logger.log('Player 1 dodge attempt');
            this.handlePlayerDodge('player1');
        });
        
        this.player2Keys.dodge.on('down', () => {
            Logger.log('Player 2 dodge attempt');
            this.handlePlayerDodge('player2');
        });
        
        // Prevent default browser behavior for game keys
        this.input.keyboard.on('keydown', (event) => {
            const gameCodes = [
                'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
                'KeyW', 'KeyA', 'KeyS', 'KeyD',
                'Space', 'KeyE', 'KeyR', 'KeyT', 'KeyQ',
                'KeyI', 'KeyJ', 'KeyK', 'KeyL', 'KeyO', 'KeyP', 'BracketLeft', 'KeyU'
            ];
            
            if (gameCodes.includes(event.code)) {
                event.preventDefault();
            }
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
        
        // Create character status UI at bottom of screen
        this.createCharacterStatusUI();
        
        Logger.log('Local 2-player setup complete with physics');
    }
    
    // Update character status indicators
    updateCharacterStatusUI() {
        if (!this.characterStatusDisplays || !this.localPlayers) return;
        
        Object.keys(this.characterStatusDisplays).forEach(playerId => {
            const playerData = this.localPlayers[playerId];
            const statusDisplay = this.characterStatusDisplays[playerId];
            
            if (!playerData || !statusDisplay) return;
            
            // Update damage percentage (round to remove decimal points)
            statusDisplay.damageText.setText(`${Math.round(playerData.health)}%`);
            
            // Color code damage based on percentage
            let damageColor = '#FFFFFF';
            if (playerData.health >= 100) {
                damageColor = '#FF0000'; // Red for high damage
            } else if (playerData.health >= 50) {
                damageColor = '#FFFF00'; // Yellow for medium damage
            }
            statusDisplay.damageText.setStyle({ fill: damageColor });
            
            // Update shield bar
            const shieldPercentage = Math.max(0, playerData.shieldHealth) / 100;
            const shieldBarWidth = 100;
            const currentShieldWidth = shieldBarWidth * shieldPercentage;
            
            statusDisplay.shieldFill.setSize(currentShieldWidth, 8);
            
            // Change shield color based on health
            let shieldColor = 0x00FFFF; // Cyan for healthy shield
            if (playerData.shieldHealth <= 0) {
                shieldColor = 0xFF0000; // Red for broken shield
            } else if (playerData.shieldHealth <= 30) {
                shieldColor = 0xFFFF00; // Yellow for low shield
            }
            statusDisplay.shieldFill.setFillStyle(shieldColor);
            
            // Update lives
            statusDisplay.livesText.setText(`Lives: ${playerData.lives}`);
            
            // Color code lives
            let livesColor = '#00FF00'; // Green for healthy
            if (playerData.lives <= 1) {
                livesColor = '#FF0000'; // Red for critical
            } else if (playerData.lives <= 2) {
                livesColor = '#FFFF00'; // Yellow for warning
            }
            statusDisplay.livesText.setStyle({ fill: livesColor });
            
            // Update portrait opacity for eliminated players
            if (playerData.eliminated) {
                statusDisplay.portrait.setAlpha(0.3);
                statusDisplay.nameText.setAlpha(0.3);
                statusDisplay.damageText.setText('OUT');
                statusDisplay.damageText.setStyle({ fill: '#FF0000' });
            } else {
                statusDisplay.portrait.setAlpha(1);
                statusDisplay.nameText.setAlpha(1);
            }
            
            // Show blocking indicator on portrait
            if (playerData.isBlocking) {
                statusDisplay.portrait.setStrokeStyle(3, 0x00FFFF);
            } else {
                statusDisplay.portrait.setStrokeStyle(3, 0xFFFFFF);
            }
        });
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
    
    handlePlayerAttack(playerId, attackType, direction = 'forward') {
        const playerData = this.localPlayers[playerId];
        if (!playerData || playerData.eliminated) return;
        
        const currentTime = Date.now();
        const playerCooldown = this.attackCooldowns[playerId];
        
        // Check if any attack is already in progress
        if (playerCooldown.isInAttack) {
            Logger.log(`${playerId} attack blocked - already attacking`);
            return;
        }
        
        // Check if attack animation is currently playing (for sprite characters)
        const player = this.players[playerId];
        if (player && player.isSprite && player.body.anims.currentAnim?.key.includes('attack') && player.body.anims.isPlaying) {
            Logger.log(`${playerId} attack blocked - attack animation still playing`);
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
        playerData.attackDirection = direction;
        playerCooldown.isInAttack = true;
        
        // Update facing direction based on attack direction to make animations look natural
        if (direction === 'left') {
            playerData.facingRight = false;
        } else if (direction === 'right') {
            playerData.facingRight = true;
        } else if (direction === 'forward') {
            // For forward attacks, find the nearest opponent and face them
            const opponents = Object.keys(this.localPlayers).filter(id => id !== playerId);
            if (opponents.length > 0) {
                const opponent = this.localPlayers[opponents[0]];
                if (opponent) {
                    playerData.facingRight = opponent.x > playerData.x;
                }
            }
        }
        // Up and down attacks don't change facing direction
        
        // Attack properties based on type
        let knockback, range, duration;
        if (attackType === 'special') {
            knockback = 400;       // Stronger knockback
            range = 100;           // Longer range
            duration = 500;        // Longer duration
        } else {
            knockback = 200;       // Regular knockback
            range = 80;            // Regular range
            duration = 300;        // Regular duration
        }
        
        Logger.log(`${playerId} ${attackType} attack ${direction}`);
        
        // Check for hits on other players (damage calculated per target)
        this.checkPlayerHits(playerId, attackType, knockback, range, direction);
        
        // Update visual
        this.updatePlayer(playerId, playerData);
        
        // Reset attack state after duration
        setTimeout(() => {
            if (playerData && !playerData.eliminated) {
                playerData.isAttacking = false;
                playerData.attackType = null;
                playerData.attackDirection = null;
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
        const deltaTime = this.game.loop.delta;
        
        // Check if shield is regenerating from being broken
        if (playerData.shieldRegenTime > 0) {
            if (currentTime >= playerData.shieldRegenTime) {
                playerData.shieldHealth = 100;
                playerData.shieldRegenTime = 0;
                Logger.log(`${playerId} shield regenerated after break`);
            } else {
                // Cannot block while regenerating from break
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
                playerData.shieldHealth -= shieldDrainRate * deltaTime;
                
                if (playerData.shieldHealth <= 0) {
                    this.breakShield(playerId);
                }
            }
        } else {
            // Stop blocking
            if (playerData.isBlocking) {
                playerData.isBlocking = false;
                Logger.log(`${playerId} stopped blocking`);
            }
            
            // Passive shield regeneration at 10% per second when not blocking
            if (playerData.shieldHealth < 100 && playerData.shieldRegenTime === 0) {
                const regenRate = 10 / 1000; // 10% per second = 0.01 per millisecond
                playerData.shieldHealth += regenRate * deltaTime;
                
                // Cap at 100%
                if (playerData.shieldHealth > 100) {
                    playerData.shieldHealth = 100;
                }
            }
        }
        
        // Update visual
        this.updatePlayer(playerId, playerData);
    }
    
    // Handle dodge mechanics
    handlePlayerDodge(playerId) {
        const playerData = this.localPlayers[playerId];
        if (!playerData || playerData.eliminated) return;
        
        const currentTime = Date.now();
        
        // Check if dodge is on cooldown
        if (currentTime < playerData.dodgeCooldown) {
            Logger.log(`${playerId} dodge blocked - cooldown active (${playerData.dodgeCooldown - currentTime}ms remaining)`);
            return;
        }
        
        // Cannot dodge while already dodging
        if (playerData.isDodging) {
            Logger.log(`${playerId} dodge blocked - already dodging`);
            return;
        }
        
        // Cannot dodge while attacking
        if (playerData.isAttacking) {
            Logger.log(`${playerId} dodge blocked - currently attacking`);
            return;
        }
        
        // Start dodge
        playerData.isDodging = true;
        playerData.dodgeStartTime = currentTime;
        playerData.dodgeEndTime = currentTime + 300; // 300ms dodge duration
        playerData.dodgeCooldown = currentTime + 1000; // 1 second cooldown
        
        Logger.log(`${playerId} started dodge`);
        
        // Update visual
        this.updatePlayer(playerId, playerData);
        
        // End dodge after duration
        setTimeout(() => {
            if (playerData && !playerData.eliminated) {
                playerData.isDodging = false;
                Logger.log(`${playerId} dodge ended`);
                this.updatePlayer(playerId, playerData);
            }
        }, 300);
    }
    
    // Show dodge success text
    showDodgeSuccessText(x, y) {
        const dodgeText = this.add.text(x, y - 40, 'DODGE', {
            fontSize: '16px',
            fill: '#00FF00',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // Animate the text
        this.tweens.add({
            targets: dodgeText,
            y: y - 80,
            alpha: 0,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => {
                dodgeText.destroy();
            }
        });
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
    checkPlayerHits(attackerId, attackType, knockback, range, direction) {
        const attacker = this.localPlayers[attackerId];
        if (!attacker) return;
        
        // Calculate attack position based on direction
        let attackX, attackY;
        
        switch (direction) {
            case 'up':
                attackX = attacker.x;
                attackY = attacker.y - range / 2;
                break;
            case 'down':
                attackX = attacker.x;
                attackY = attacker.y + range / 2;
                break;
            case 'left':
                attackX = attacker.x - range / 2;
                attackY = attacker.y;
                break;
            case 'right':
                attackX = attacker.x + range / 2;
                attackY = attacker.y;
                break;
            default: // forward
                const attackDirection = attacker.facingRight ? 1 : -1;
                attackX = attacker.x + (attackDirection * (range / 2));
                attackY = attacker.y;
                break;
        }
        
        // Check all other players
        Object.keys(this.localPlayers).forEach(playerId => {
            if (playerId === attackerId) return; // Skip self
            
            const target = this.localPlayers[playerId];
            if (!target || target.eliminated) return;
            
            // Calculate distance based on attack direction
            let distance, yDistance;
            
            if (direction === 'up' || direction === 'down') {
                // Vertical attacks - check Y distance primarily
                distance = Math.abs(target.y - attackY);
                yDistance = Math.abs(target.x - attackX);
            } else {
                // Horizontal attacks - check X distance primarily
                distance = Math.abs(target.x - attackX);
                yDistance = Math.abs(target.y - attackY);
            }
            
            // Check if hit connects
            if (distance < range && yDistance < 80) {
                // Calculate damage based on attack type and target's health percentage
                let damage;
                if (attackType === 'special') {
                    // Special attacks: 15 base damage + scaling based on target's health percentage
                    const healthScaling = target.health * 0.2; // 20% of target's health as bonus damage
                    damage = 15 + healthScaling;
                } else {
                    // Regular attacks: 5 damage
                    damage = 5;
                }
                
                // Check if target is dodging
                if (target.isDodging) {
                    Logger.log(`${attackerId} ${direction} attack dodged by ${playerId}`);
                    
                    // Show dodge success text
                    this.showDodgeSuccessText(target.x, target.y);
                    
                    // No damage or knockback for successful dodges
                    return;
                }
                
                // Check if target is blocking
                if (target.isBlocking && target.shieldHealth > 0) {
                    // Attack hits shield
                    const shieldDamage = damage * 0.5; // Shields absorb 50% damage
                    target.shieldHealth -= shieldDamage;
                    
                    Logger.log(`${attackerId} ${direction} attack blocked by ${playerId} shield (${shieldDamage} shield damage)`);
                    
                    // Visual feedback for blocked attack
                    this.showBlockEffect(target.x, target.y);
                    
                    // Check if shield breaks
                    if (target.shieldHealth <= 0) {
                        this.breakShield(playerId);
                    }
                    
                    // Slight knockback even when blocked
                    this.applyDirectionalKnockback(target, attacker, knockback * 0.2, direction);
                    
                } else {
                    // Normal hit
                    Logger.log(`${attackerId} hit ${playerId} with ${attackType} ${direction} attack for ${damage} damage`);
                    this.applyHit(target, attacker, damage, knockback, direction);
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
    applyHit(target, attacker, damage, knockback, direction) {
        // Apply damage
        target.health += damage;
        
        // Apply directional knockback
        this.applyDirectionalKnockback(target, attacker, knockback, direction);
        
        // Visual feedback
        this.showHitEffect(target.x, target.y, damage);
        
        // Check for high damage
        if (target.health > 100) {
            Logger.log(`${target.id} has high damage: ${target.health}%`);
        }
        
        // Update UI
        this.updateUI();
    }
    
    // Apply directional knockback to target
    applyDirectionalKnockback(target, attacker, knockback, direction) {
        const knockbackStrength = Math.min(target.health * 2 + knockback, 800);
        
        switch (direction) {
            case 'up':
                target.velocityX = 0;
                target.velocityY = -knockbackStrength;
                break;
            case 'down':
                target.velocityX = 0;
                target.velocityY = knockbackStrength * 0.5; // Reduced downward knockback
                break;
            case 'left':
                target.velocityX = -knockbackStrength;
                target.velocityY = -knockbackStrength * 0.3; // Slight upward knockback
                break;
            case 'right':
                target.velocityX = knockbackStrength;
                target.velocityY = -knockbackStrength * 0.3; // Slight upward knockback
                break;
            default: // forward
                const knockbackDirection = target.x > attacker.x ? 1 : -1;
                target.velocityX = knockbackDirection * knockbackStrength;
                target.velocityY = -knockbackStrength * 0.3; // Slight upward knockback
                break;
        }
        
        target.isGrounded = false;
    }
    
    // Show hit effect
    showHitEffect(x, y, damage) {
        const hitText = this.add.text(x, y - 20, `${Math.round(damage)}%`, {
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
        
        // Check for out-of-bounds and trigger respawn
        // Left wall
        if (player.x < player.width / 2) {
            Logger.log(`Player ${playerId} hit left wall, respawning`);
            this.respawnPlayer(playerId);
            return;
        }
        // Right wall
        if (player.x > 800 - player.width / 2) {
            Logger.log(`Player ${playerId} hit right wall, respawning`);
            this.respawnPlayer(playerId);
            return;
        }
        // Ceiling
        if (player.y < player.height / 2) {
            Logger.log(`Player ${playerId} hit ceiling, respawning`);
            this.respawnPlayer(playerId);
            return;
        }
        
        // Warning when player is near the bottom (about to fall off)
        if (player.y > 550 && player.y < 650) {
            this.showFallWarning(playerId);
        }
        
        // Respawn if player falls off stage (bottom boundary)
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
            this.localPlayers.player1.shieldHealth = 100;
            this.localPlayers.player1.shieldRegenTime = 0;
            this.localPlayers.player1.isBlocking = false;
            this.localPlayers.player1.isDodging = false;
            this.localPlayers.player1.dodgeStartTime = 0;
            this.localPlayers.player1.dodgeEndTime = 0;
            this.localPlayers.player1.dodgeCooldown = 0;
            this.localPlayers.player1.x = 300;
            this.localPlayers.player1.y = 200;
            this.localPlayers.player1.velocityX = 0;
            this.localPlayers.player1.velocityY = 0;
            this.localPlayers.player1.isGrounded = false;
            this.localPlayers.player1.eliminated = false;
            this.localPlayers.player1.canJump = true;
            
            this.localPlayers.player2.lives = 3;
            this.localPlayers.player2.health = 0;
            this.localPlayers.player2.shieldHealth = 100;
            this.localPlayers.player2.shieldRegenTime = 0;
            this.localPlayers.player2.isBlocking = false;
            this.localPlayers.player2.isDodging = false;
            this.localPlayers.player2.dodgeStartTime = 0;
            this.localPlayers.player2.dodgeEndTime = 0;
            this.localPlayers.player2.dodgeCooldown = 0;
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
                    
                    // Only set fill style on rectangles, not sprites
                    if (!player.isSprite) {
                        player.body.setFillStyle(player.originalColor);
                    } else {
                        // For sprites, reset tint
                        player.body.setTint(0xFFAAAA);
                    }
                    
                    player.blockIndicator.setAlpha(0);
                    player.dodgeIndicator.setAlpha(0);
                    
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
        
        // Clean up character status UI
        if (this.statusUI) {
            this.statusUI.destroy();
            this.statusUI = null;
        }
        this.characterStatusDisplays = {};
        
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
        
        // Clean up character status UI
        if (this.statusUI) {
            this.statusUI.destroy();
            this.statusUI = null;
        }
        this.characterStatusDisplays = {};
        
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
    
    // Create character status indicators at bottom of screen
    createCharacterStatusUI() {
        Logger.log('Creating character status UI');
        
        // Create UI container
        this.statusUI = this.add.group();
        
        // Create background bar for status indicators
        const statusBarHeight = 80;
        const statusBar = this.add.rectangle(400, 600 - statusBarHeight/2, 800, statusBarHeight, 0x000000);
        statusBar.setAlpha(0.7);
        statusBar.setStrokeStyle(2, 0x444444);
        statusBar.setDepth(1000); // Set high depth to appear above other elements
        this.statusUI.add(statusBar);
        
        // Initialize character status displays
        this.characterStatusDisplays = {};
        
        // Get active players
        const activePlayers = Object.keys(this.localPlayers || {});
        
        activePlayers.forEach((playerId, index) => {
            const playerData = this.localPlayers[playerId];
            if (!playerData) return;
            
            // Calculate position for each character status
            const baseX = 200 + (index * 400); // Space them out across the screen
            const baseY = 600 - statusBarHeight/2;
            
            // Create character portrait/icon
            const portrait = this.add.rectangle(baseX - 120, baseY, 60, 60, playerData.color);
            portrait.setStrokeStyle(3, 0xFFFFFF);
            
            // Add character name
            const nameText = this.add.text(baseX - 120, baseY - 35, playerData.characterName || `Player ${index + 1}`, {
                fontSize: '12px',
                fill: '#FFFFFF',
                fontStyle: 'bold'
            }).setOrigin(0.5);
            
            // Add damage percentage (round to remove decimal points)
            const damageText = this.add.text(baseX - 40, baseY - 15, `${Math.round(playerData.health)}%`, {
                fontSize: '24px',
                fill: '#FFFFFF',
                fontStyle: 'bold'
            }).setOrigin(0.5);
            
            // Add shield status bar
            const shieldBarWidth = 100;
            const shieldBarHeight = 8;
            
            // Shield background
            const shieldBg = this.add.rectangle(baseX + 40, baseY - 5, shieldBarWidth, shieldBarHeight, 0x333333);
            shieldBg.setStrokeStyle(1, 0x666666);
            
            // Shield fill
            const shieldFill = this.add.rectangle(baseX + 40, baseY - 5, shieldBarWidth, shieldBarHeight, 0x00FFFF);
            shieldFill.setOrigin(0.5);
            
            // Shield text
            const shieldText = this.add.text(baseX + 40, baseY + 10, 'Shield', {
                fontSize: '10px',
                fill: '#CCCCCC'
            }).setOrigin(0.5);
            
            // Add lives indicator
            const livesText = this.add.text(baseX + 40, baseY + 25, `Lives: ${playerData.lives}`, {
                fontSize: '12px',
                fill: '#FFFFFF'
            }).setOrigin(0.5);
            
            // Store all UI elements for this player
            this.characterStatusDisplays[playerId] = {
                portrait: portrait,
                nameText: nameText,
                damageText: damageText,
                shieldBg: shieldBg,
                shieldFill: shieldFill,
                shieldText: shieldText,
                livesText: livesText
            };
            
            // Add to UI group
            this.statusUI.add(portrait);
            this.statusUI.add(nameText);
            this.statusUI.add(damageText);
            this.statusUI.add(shieldBg);
            this.statusUI.add(shieldFill);
            this.statusUI.add(shieldText);
            this.statusUI.add(livesText);
            
            // Set depth for all elements to appear above game elements
            portrait.setDepth(1001);
            nameText.setDepth(1001);
            damageText.setDepth(1001);
            shieldBg.setDepth(1001);
            shieldFill.setDepth(1001);
            shieldText.setDepth(1001);
            livesText.setDepth(1001);
        });
        
        Logger.log('Character status UI created for', activePlayers.length, 'players');
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
        let body;
        
        // Check if this is the red-fighter character (should use Meow Knight sprites)
        if (playerData.characterId === 'red-fighter') {
            // Create player body using Meow Knight sprite
            body = this.add.sprite(playerData.x, playerData.y, 'meow-knight-idle');
            body.setScale(4); // Scale up the 16x16 sprite to be more visible
            body.play('meow-knight-idle'); // Start with idle animation
            
            // Set tint to maintain color identification (subtle red tint)
            body.setTint(0xFFAAAA); // Light red tint
            
            // Add event listener for when attack animations complete
            body.on('animationcomplete', (animation, frame) => {
                if (animation.key.includes('attack')) {
                    // Attack animation completed, clear the attack state
                    const playerCooldown = this.attackCooldowns[playerId];
                    const playerData = this.localPlayers[playerId];
                    
                    if (playerCooldown) {
                        playerCooldown.isInAttack = false;
                    }
                    
                    if (playerData && !playerData.eliminated) {
                        playerData.isAttacking = false;
                        playerData.attackType = null;
                        playerData.attackDirection = null;
                        this.updatePlayer(playerId, playerData);
                    }
                    
                    Logger.log(`${playerId} attack animation completed - can attack again`);
                }
            });
            
            Logger.log('Created Meow Knight sprite for red-fighter');
        } else if (playerData.characterId === 'finn-human') {
            // Create player body using Finn sprite
            body = this.add.sprite(playerData.x, playerData.y, 'finn-idle');
            body.setScale(3); // Scale up the 32x32 sprite to be more visible
            body.play('finn-idle'); // Start with idle animation
            
            // Set tint to maintain color identification (subtle blue tint)
            body.setTint(0xAADDFF); // Light blue tint
            
            // Add event listener for when attack animations complete
            body.on('animationcomplete', (animation, frame) => {
                if (animation.key.includes('attack')) {
                    // Attack animation completed, clear the attack state
                    const playerCooldown = this.attackCooldowns[playerId];
                    const playerData = this.localPlayers[playerId];
                    
                    if (playerCooldown) {
                        playerCooldown.isInAttack = false;
                    }
                    
                    if (playerData && !playerData.eliminated) {
                        playerData.isAttacking = false;
                        playerData.attackType = null;
                        playerData.attackDirection = null;
                        this.updatePlayer(playerId, playerData);
                    }
                    
                    Logger.log(`${playerId} attack animation completed - can attack again`);
                }
            });
            
            Logger.log('Created Finn the Human sprite for finn-human');
        } else if (playerData.characterId === 'blue-witch') {
            // Create player body using Blue_witch sprite
            body = this.add.sprite(playerData.x, playerData.y, 'blue-witch-idle');
            body.setScale(2.5); // Scale up the 32x32 sprite to be more visible
            body.play('blue-witch-idle'); // Start with idle animation
            
            // Set tint to maintain color identification (subtle purple tint)
            body.setTint(0xCCAAFF); // Light purple tint
            
            // Add event listener for when attack animations complete
            body.on('animationcomplete', (animation, frame) => {
                if (animation.key.includes('attack') || animation.key.includes('charge')) {
                    // Attack animation completed, clear the attack state
                    const playerCooldown = this.attackCooldowns[playerId];
                    const playerData = this.localPlayers[playerId];
                    
                    if (playerCooldown) {
                        playerCooldown.isInAttack = false;
                    }
                    
                    if (playerData && !playerData.eliminated) {
                        playerData.isAttacking = false;
                        playerData.attackType = null;
                        playerData.attackDirection = null;
                        this.updatePlayer(playerId, playerData);
                    }
                    
                    Logger.log(`${playerId} attack animation completed - can attack again`);
                }
            });
            
            Logger.log('Created Blue_witch sprite for blue-witch');
        } else if (playerData.characterId === 'archer') {
            // Create player body using Archer sprite
            body = this.add.sprite(playerData.x, playerData.y, 'archer-idle');
            body.setScale(1.5); // Reduced scale to fix sprite display issues
            body.play('archer-idle'); // Start with idle animation
            
            // Set tint to maintain color identification (subtle green tint)
            body.setTint(0xAAFFAA); // Light green tint
            
            // Add event listener for when attack animations complete
            body.on('animationcomplete', (animation, frame) => {
                if (animation.key.includes('attack')) {
                    // Attack animation completed, clear the attack state
                    const playerCooldown = this.attackCooldowns[playerId];
                    const playerData = this.localPlayers[playerId];
                    
                    if (playerCooldown) {
                        playerCooldown.isInAttack = false;
                    }
                    
                    if (playerData && !playerData.eliminated) {
                        playerData.isAttacking = false;
                        playerData.attackType = null;
                        playerData.attackDirection = null;
                        this.updatePlayer(playerId, playerData);
                    }
                    
                    Logger.log(`${playerId} attack animation completed - can attack again`);
                }
            });
            
            Logger.log('Created Archer sprite for archer');
        } else if (playerData.characterId === 'stickman') {
            // Create player body using Stickman sprite
            body = this.add.sprite(playerData.x, playerData.y, 'stickman-idle');
            body.setScale(1.5); // Scale up the 64x64 sprite to be appropriate size
            body.play('stickman-idle'); // Start with idle animation
            
            // Set tint to maintain color identification (subtle yellow tint)
            body.setTint(0xFFFFAA); // Light yellow tint
            
            // Add event listener for when attack animations complete
            body.on('animationcomplete', (animation, frame) => {
                if (animation.key.includes('punch')) {
                    // Attack animation completed, clear the attack state
                    const playerCooldown = this.attackCooldowns[playerId];
                    const playerData = this.localPlayers[playerId];
                    
                    if (playerCooldown) {
                        playerCooldown.isInAttack = false;
                    }
                    
                    if (playerData && !playerData.eliminated) {
                        playerData.isAttacking = false;
                        playerData.attackType = null;
                        playerData.attackDirection = null;
                        this.updatePlayer(playerId, playerData);
                    }
                    
                    Logger.log(`${playerId} punch animation completed - can attack again`);
                }
            });
            
            Logger.log('Created Stickman sprite for stickman');
        } else {
            // Create player body (colored rectangle) for other characters
            body = this.add.rectangle(playerData.x, playerData.y, playerData.width, playerData.height, playerData.color);
            body.setStrokeStyle(2, 0x000000);
        }
        
        // Create eyes for placeholder characters (but not sprites)
        let leftEye = null;
        let rightEye = null;
        if (playerData.characterId !== 'red-fighter' && playerData.characterId !== 'finn-human' && playerData.characterId !== 'blue-witch' && playerData.characterId !== 'archer' && playerData.characterId !== 'stickman') {
            leftEye = this.add.circle(
                playerData.x - 8,
                playerData.y - 10,
                3,
                0xFFFFFF
            );
            rightEye = this.add.circle(
                playerData.x + 8,
                playerData.y - 10,
                3,
                0xFFFFFF
            );
        }
        
        // Create blocking indicator
        const blockIndicator = this.add.rectangle(
            playerData.x,
            playerData.y,
            50, 90,
            0x00FFFF
        );
        blockIndicator.setAlpha(0);
        blockIndicator.setStrokeStyle(2, 0x00FFFF);
        
        // Create dodge indicator
        const dodgeIndicator = this.add.rectangle(
            playerData.x,
            playerData.y,
            50, 90,
            0xFF0000
        );
        dodgeIndicator.setAlpha(0);
        dodgeIndicator.setStrokeStyle(2, 0xFF0000);
        
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
        if (leftEye) player.add(leftEye);
        if (rightEye) player.add(rightEye);
        player.add(blockIndicator);
        player.add(dodgeIndicator);
        player.add(attackIndicator);
        
        // Store references and original color
        this.players[playerId] = {
            group: player,
            body: body,
            leftEye: leftEye,
            rightEye: rightEye,
            blockIndicator: blockIndicator,
            dodgeIndicator: dodgeIndicator,
            attackIndicator: attackIndicator,
            originalColor: playerData.color, // Store original color
            data: playerData,
            isSprite: playerData.characterId === 'red-fighter' || playerData.characterId === 'finn-human' || playerData.characterId === 'blue-witch' || playerData.characterId === 'archer' || playerData.characterId === 'stickman' // Flag to track if this is a sprite
        };
        
        Logger.log('Player created successfully');
    }

    updatePlayer(playerId, playerData) {
        const player = this.players[playerId];
        if (!player) return;
        
        // Handle eliminated players
        if (playerData.eliminated) {
            player.body.setAlpha(0.3); // Make eliminated player semi-transparent
            
            if (player.isSprite) {
                // For sprites, play death animation
                if (playerData.characterId === 'red-fighter' && player.body.anims.currentAnim?.key !== 'meow-knight-death') {
                    player.body.play('meow-knight-death');
                } else if (playerData.characterId === 'blue-witch' && player.body.anims.currentAnim?.key !== 'blue-witch-death') {
                    player.body.play('blue-witch-death');
                } else if (playerData.characterId === 'archer' && player.body.anims.currentAnim?.key !== 'archer-death') {
                    player.body.play('archer-death');
                } else if (playerData.characterId === 'stickman' && player.body.anims.currentAnim?.key !== 'stickman-death') {
                    player.body.play('stickman-death');
                } else if (playerData.characterId === 'finn-human') {
                    // Finn doesn't have death animation yet, use idle
                    player.body.play('finn-idle');
                }
            } else {
                // For rectangles, gray out
                player.body.setFillStyle(0x888888);
            }
            return; // Don't update position/other properties for eliminated players
        }
        
        // Reset appearance for active players
        player.body.setAlpha(1);
        
        // Handle sprite vs rectangle differently
        if (player.isSprite) {
            // Update sprite animations based on state
            this.updateSpriteAnimations(player, playerData);
            
            // Update sprite flip direction
            if (playerData.facingRight) {
                player.body.setFlipX(false);
            } else {
                player.body.setFlipX(true);
            }
        } else {
            // Use stored original color for rectangles
            player.body.setFillStyle(player.originalColor);
        }
        
        // Update position
        // Handle sprite positioning adjustments for different animation frame sizes
        if (player.isSprite && playerData.isAttacking && playerData.attackType === 'special') {
            // Special attack animation - move the character 3 paces in the attack direction
            const scaleMultiplier = playerData.characterId === 'red-fighter' ? 4 : 
                                   playerData.characterId === 'finn-human' ? 3 : 
                                   playerData.characterId === 'blue-witch' ? 2.5 : 
                                   playerData.characterId === 'archer' ? 1.5 : 3; // Updated scale for archer
            const pacesOffset = 3 * 16; // 3 paces, each pace is 16 pixels
            
            let offsetX = 0;
            let offsetY = 0;
            
            // Move character in the direction of the attack
            switch (playerData.attackDirection) {
                case 'up':
                    offsetY = -pacesOffset;
                    break;
                case 'down':
                    offsetY = pacesOffset;
                    break;
                case 'left':
                    offsetX = -pacesOffset;
                    break;
                case 'right':
                    offsetX = pacesOffset;
                    break;
                default: // forward
                    offsetX = playerData.facingRight ? pacesOffset : -pacesOffset;
                    break;
            }
            
            player.body.setPosition(
                playerData.x + (offsetX * scaleMultiplier), 
                playerData.y + (offsetY * scaleMultiplier)
            );
        } else {
            // For all other cases (sprites with other animations and rectangles), use normal position
            player.body.setPosition(playerData.x, playerData.y);
        }
        
        // Update eye positions for placeholder characters
        if (player.leftEye && player.rightEye) {
            player.leftEye.setPosition(playerData.x - 8, playerData.y - 10);
            player.rightEye.setPosition(playerData.x + 8, playerData.y - 10);
        }
        
        // Update blocking indicator
        player.blockIndicator.setPosition(playerData.x, playerData.y);
        
        // Show blocking indicator if blocking
        if (playerData.isBlocking) {
            player.blockIndicator.setAlpha(0.5);
        } else {
            player.blockIndicator.setAlpha(0);
        }
        
        // Update dodge indicator
        player.dodgeIndicator.setPosition(playerData.x, playerData.y);
        
        // Show dodge indicator if dodging
        if (playerData.isDodging) {
            player.dodgeIndicator.setAlpha(0.5);
        } else {
            player.dodgeIndicator.setAlpha(0);
        }
        
        // Update attack indicator
        if (playerData.isAttacking && playerData.attackDirection) {
            const direction = playerData.attackDirection;
            let indicatorX = playerData.x;
            let indicatorY = playerData.y;
            
            // Account for sprite position offset during special attacks
            if (player.isSprite && playerData.attackType === 'special') {
                const scaleMultiplier = playerData.characterId === 'red-fighter' ? 4 : 
                                       playerData.characterId === 'finn-human' ? 3 : 
                                       playerData.characterId === 'blue-witch' ? 2.5 : 
                                       playerData.characterId === 'archer' ? 1.5 : 3; // Updated scale for archer
                const pacesOffset = 3 * 16; // 3 paces, each pace is 16 pixels
                
                // Calculate the same position where the sprite is actually displayed
                let spriteX = playerData.x;
                let spriteY = playerData.y;
                
                switch (direction) {
                    case 'up':
                        spriteY = playerData.y - (pacesOffset * scaleMultiplier);
                        break;
                    case 'down':
                        spriteY = playerData.y + (pacesOffset * scaleMultiplier);
                        break;
                    case 'left':
                        spriteX = playerData.x - (pacesOffset * scaleMultiplier);
                        break;
                    case 'right':
                        spriteX = playerData.x + (pacesOffset * scaleMultiplier);
                        break;
                    default: // forward
                        spriteX = playerData.x + (playerData.facingRight ? (pacesOffset * scaleMultiplier) : -(pacesOffset * scaleMultiplier));
                        break;
                }
                
                // Place indicator exactly at the sprite's visual position
                player.attackIndicator.setPosition(spriteX, spriteY);
            } else {
                // For regular attacks, add the directional offset
                switch (direction) {
                    case 'up':
                        indicatorY = indicatorY - 50;
                        break;
                    case 'down':
                        indicatorY = indicatorY + 50;
                        break;
                    case 'left':
                        indicatorX = indicatorX - 50;
                        break;
                    case 'right':
                        indicatorX = indicatorX + 50;
                        break;
                    default: // forward
                        indicatorX = indicatorX + (playerData.facingRight ? 50 : -50);
                        break;
                }
                
                player.attackIndicator.setPosition(indicatorX, indicatorY);
            }
        } else {
            // Default position for non-attacking state
            let defaultX = playerData.x;
            let defaultY = playerData.y;
            
            player.attackIndicator.setPosition(
                defaultX + (playerData.facingRight ? 50 : -50),
                defaultY
            );
        }
        
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
        
        // Show grounded status with visual cue (only for rectangles, not sprites)
        if (!player.isSprite) {
            if (playerData.isGrounded) {
                player.body.setStrokeStyle(3, 0x00FF00); // Green outline when grounded
            } else {
                player.body.setStrokeStyle(2, 0xFF0000); // Red outline when in air
            }
            
            // Override for current player highlight
            if (playerId === this.myPlayerId) {
                player.body.setStrokeStyle(3, 0xFFFF00); // Yellow outline for current player
            }
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
                    ${Math.round(playerData.health)}%
                </div>
                <div class="player-lives">Lives: ${playerData.lives}</div>
            `;
            
            playerList.appendChild(playerInfo);
        });
        
        // Update character status indicators
        this.updateCharacterStatusUI();
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
                    // Determine attack direction based on held movement keys
                    let direction = 'forward';
                    if (this.isKeyDown(this.player1Keys.up)) {
                        direction = 'up';
                    } else if (this.isKeyDown(this.player1Keys.down)) {
                        direction = 'down';
                    } else if (this.isKeyDown(this.player1Keys.left)) {
                        direction = 'left';
                    } else if (this.isKeyDown(this.player1Keys.right)) {
                        direction = 'right';
                    }
                    
                    this.handlePlayerAttack('player1', 'regular', direction);
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
                    // Determine attack direction based on held movement keys
                    let direction = 'forward';
                    if (this.isKeyDown(this.player2Keys.up)) {
                        direction = 'up';
                    } else if (this.isKeyDown(this.player2Keys.down)) {
                        direction = 'down';
                    } else if (this.isKeyDown(this.player2Keys.left)) {
                        direction = 'left';
                    } else if (this.isKeyDown(this.player2Keys.right)) {
                        direction = 'right';
                    }
                    
                    this.handlePlayerAttack('player2', 'regular', direction);
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

        // Update character status indicators
        this.updateCharacterStatusUI();
    }
} 