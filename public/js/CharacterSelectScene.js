class CharacterSelectScene extends Phaser.Scene {
    constructor() {
        super({ key: 'CharacterSelectScene' });
    }

    init(data) {
        this.gameMode = data.mode || 'local';
        this.fromGameOver = data.fromGameOver || false;
    }

    // Add preload method to load character preview images
    preload() {
        Logger.log('CharacterSelectScene preload - Loading character preview images');
        
        // Load Meow Knight idle sprite sheet to get first frame only
        this.load.spritesheet('meow-knight-preview', 'assets/characters/Meow Knight/Meow-Knight_Idle.png', {
            frameWidth: 16,
            frameHeight: 16  // 16x146 = 9 frames of 16x16
        });
    }

    create() {
        Logger.log('CharacterSelectScene created');
        
        // Hide status div
        const statusDiv = document.getElementById('status');
        if (statusDiv) statusDiv.classList.add('hidden');
        
        const { width, height } = this.scale;
        
        // Define 4 character types
        this.characterTypes = [
            {
                id: 'red-fighter',
                name: 'Meow Knight',
                color: '#FF0000',
                moveSpeed: 200,
                jumpPower: -500,
                description: 'Skilled swordsman',
                hasSprite: true // Flag to indicate this character has a sprite
            },
            {
                id: 'blue-speedster',
                name: 'Blue Speedster',
                color: '#0000FF',
                moveSpeed: 250,
                jumpPower: -450,
                description: 'Fast movement',
                hasSprite: false
            },
            {
                id: 'green-tank',
                name: 'Green Tank',
                color: '#00FF00',
                moveSpeed: 150,
                jumpPower: -400,
                description: 'Slow but strong',
                hasSprite: false
            },
            {
                id: 'yellow-jumper',
                name: 'Yellow Jumper',
                color: '#FFFF00',
                moveSpeed: 180,
                jumpPower: -600,
                description: 'High jumper',
                hasSprite: false
            }
        ];
        
        // Selected characters
        this.selectedCharacters = {
            player1: null,
            player2: null
        };
        
        // Title
        this.add.text(width/2, height*0.15, 'Character Selection', {
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        // Create character display
        this.createCharacterDisplay();
        
        // Create selection UI
        this.createSelectionUI();
        
        // Instructions
        this.add.text(width/2, height*0.85, 'Player 1: A/D to navigate, E to select | Player 2: J/L to navigate, O to select', {
            fontSize: '16px',
            color: '#888888',
            align: 'center'
        }).setOrigin(0.5);
        
        // Current selections
        this.currentSelections = {
            player1: 0,
            player2: 1
        };
        
        // Setup controls
        this.setupControls();
        
        // Update display
        this.updateDisplay();
    }
    
    createCharacterDisplay() {
        const { width, height } = this.scale;
        
        // Character display area
        this.characterDisplays = [];
        const startX = width * 0.2;
        const spacing = width * 0.15;
        
        for (let i = 0; i < 4; i++) {
            const character = this.characterTypes[i];
            const x = startX + (i * spacing);
            const y = height * 0.4;
            
            let preview;
            
            // Create character preview (static image for red-fighter only, rectangle for others)
            let border = null;
            if (character.hasSprite && character.id === 'red-fighter') {
                preview = this.add.sprite(x, y, 'meow-knight-preview', 0); // Use frame 0 only
                preview.setScale(4); // Scale up for better visibility
                preview.setTint(0xFFAAAA); // Light red tint to match character color
                
                // Add border rectangle behind the sprite
                border = this.add.rectangle(x, y, 60, 80, 0x000000);
                border.setStrokeStyle(2, 0x000000);
                border.setAlpha(0); // Make fill transparent, only show border
                border.setDepth(preview.depth - 1); // Put border behind sprite
            } else {
                preview = this.add.rectangle(x, y, 60, 80, character.color);
                preview.setStrokeStyle(2, 0x000000);
            }
            
            // Character name
            const nameText = this.add.text(x, y + 60, character.name, {
                fontSize: '14px',
                color: '#ffffff',
                align: 'center'
            }).setOrigin(0.5);
            
            // Character description
            const descText = this.add.text(x, y + 80, character.description, {
                fontSize: '12px',
                color: '#cccccc',
                align: 'center'
            }).setOrigin(0.5);
            
            // Stats display
            const statsText = this.add.text(x, y + 100, 
                `Speed: ${character.moveSpeed}\nJump: ${Math.abs(character.jumpPower)}`, {
                fontSize: '10px',
                color: '#aaaaaa',
                align: 'center'
            }).setOrigin(0.5);
            
            this.characterDisplays.push({
                preview,
                border,
                nameText,
                descText,
                statsText,
                character
            });
        }
    }
    
    createSelectionUI() {
        const { width, height } = this.scale;
        
        // Player selection indicators
        this.player1Indicator = this.add.text(width * 0.3, height * 0.6, 'Player 1', {
            fontSize: '18px',
            color: '#FF0000'
        }).setOrigin(0.5);
        
        this.player2Indicator = this.add.text(width * 0.7, height * 0.6, 'Player 2', {
            fontSize: '18px',
            color: '#0000FF'
        }).setOrigin(0.5);
        
        // Selection status
        this.player1Status = this.add.text(width * 0.3, height * 0.65, 'Press E to select', {
            fontSize: '14px',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        this.player2Status = this.add.text(width * 0.7, height * 0.65, 'Press O to select', {
            fontSize: '14px',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        // Start button (appears when both players selected)
        this.startButton = this.add.text(width/2, height * 0.75, 'Start Game', {
            fontSize: '24px',
            backgroundColor: '#333',
            padding: { x: 20, y: 10 },
            color: '#fff'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setVisible(false);
        
        this.startButton.on('pointerdown', () => {
            this.startGame();
        });
    }
    
    setupControls() {
        // Player 1 controls
        this.player1Keys = {
            left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
            select: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E)
        };
        
        // Player 2 controls
        this.player2Keys = {
            left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J),
            right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L),
            select: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.O)
        };
        
        // Key down events
        this.player1Keys.left.on('down', () => this.moveSelection('player1', -1));
        this.player1Keys.right.on('down', () => this.moveSelection('player1', 1));
        this.player1Keys.select.on('down', () => this.selectCharacter('player1'));
        
        this.player2Keys.left.on('down', () => this.moveSelection('player2', -1));
        this.player2Keys.right.on('down', () => this.moveSelection('player2', 1));
        this.player2Keys.select.on('down', () => this.selectCharacter('player2'));
    }
    
    moveSelection(player, direction) {
        const currentIndex = this.currentSelections[player];
        const newIndex = Phaser.Math.Clamp(currentIndex + direction, 0, 3);
        this.currentSelections[player] = newIndex;
        this.updateDisplay();
    }
    
    selectCharacter(player) {
        const characterIndex = this.currentSelections[player];
        const character = this.characterTypes[characterIndex];
        
        this.selectedCharacters[player] = character;
        Logger.log(`${player} selected ${character.name}`);
        
        this.updateDisplay();
        this.checkReadyToStart();
    }
    
    updateDisplay() {
        // Update selection indicators
        for (let i = 0; i < this.characterDisplays.length; i++) {
            const display = this.characterDisplays[i];
            
            // Handle sprites vs rectangles differently
            if (display.character.hasSprite && display.character.id === 'red-fighter' && display.border) {
                // For sprites, update the border rectangle
                display.border.setStrokeStyle(2, 0x000000);
                
                // Player 1 selection highlight
                if (this.currentSelections.player1 === i) {
                    display.border.setStrokeStyle(4, 0xFF0000);
                }
                
                // Player 2 selection highlight
                if (this.currentSelections.player2 === i) {
                    display.border.setStrokeStyle(4, 0x0000FF);
                }
                
                // Both players selected same character
                if (this.currentSelections.player1 === i && this.currentSelections.player2 === i) {
                    display.border.setStrokeStyle(4, 0xFF00FF);
                }
                
                // Selected character confirmation
                if (this.selectedCharacters.player1 && this.selectedCharacters.player1.id === display.character.id) {
                    display.border.setStrokeStyle(6, 0xFF0000);
                }
                if (this.selectedCharacters.player2 && this.selectedCharacters.player2.id === display.character.id) {
                    display.border.setStrokeStyle(6, 0x0000FF);
                }
            } else {
                // For rectangles, update the preview directly
                display.preview.setStrokeStyle(2, 0x000000);
                
                // Player 1 selection highlight
                if (this.currentSelections.player1 === i) {
                    display.preview.setStrokeStyle(4, 0xFF0000);
                }
                
                // Player 2 selection highlight
                if (this.currentSelections.player2 === i) {
                    display.preview.setStrokeStyle(4, 0x0000FF);
                }
                
                // Both players selected same character
                if (this.currentSelections.player1 === i && this.currentSelections.player2 === i) {
                    display.preview.setStrokeStyle(4, 0xFF00FF);
                }
                
                // Selected character confirmation
                if (this.selectedCharacters.player1 && this.selectedCharacters.player1.id === display.character.id) {
                    display.preview.setStrokeStyle(6, 0xFF0000);
                }
                if (this.selectedCharacters.player2 && this.selectedCharacters.player2.id === display.character.id) {
                    display.preview.setStrokeStyle(6, 0x0000FF);
                }
            }
        }
        
        // Update status text
        if (this.selectedCharacters.player1) {
            this.player1Status.setText(`Selected: ${this.selectedCharacters.player1.name}`);
        } else {
            this.player1Status.setText('Press E to select');
        }
        
        if (this.selectedCharacters.player2) {
            this.player2Status.setText(`Selected: ${this.selectedCharacters.player2.name}`);
        } else {
            this.player2Status.setText('Press O to select');
        }
    }
    
    checkReadyToStart() {
        if (this.selectedCharacters.player1 && this.selectedCharacters.player2) {
            this.startButton.setVisible(true);
        }
    }
    
    startGame() {
        Logger.log('Starting game with selected characters');
        
        // Pass selected characters to GameScene
        this.scene.start('GameScene', {
            mode: this.gameMode,
            selectedCharacters: this.selectedCharacters
        });
    }
} 