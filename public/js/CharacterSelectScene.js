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
        
        // Load Finn sprite sheet for preview
        this.load.spritesheet('finn-preview', 'assets/characters/Finn the Human/FinnSprite.png', {
            frameWidth: 32,
            frameHeight: 32  // Estimated frame size for Finn
        });
        
        // Load Blue_witch sprite sheet for preview
        this.load.spritesheet('blue-witch-preview', 'assets/characters/Blue_witch/B_witch_idle.png', {
            frameWidth: 32,
            frameHeight: 32  // Estimated frame size for Blue_witch
        });
        
        // Load Archer sprite sheet for preview  
        this.load.spritesheet('archer-preview', 'assets/characters/Archer/Idle and running.png', {
            frameWidth: 64,
            frameHeight: 64  // Updated frame size for Archer
        });
        
        // Load Stickman sprite sheet for preview
        this.load.spritesheet('stickman-preview', 'assets/characters/StickmanPack/Idle/Thin.png', {
            frameWidth: 32,
            frameHeight: 32  // Estimated frame size for Stickman
        });
    }

    create() {
        Logger.log('CharacterSelectScene created');
        
        // Hide status div
        const statusDiv = document.getElementById('status');
        if (statusDiv) statusDiv.classList.add('hidden');
        
        const { width, height } = this.scale;
        
        // Define 6 character types  
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
                id: 'finn-human',
                name: 'Finn the Human',
                color: '#00AAFF',
                moveSpeed: 220,
                jumpPower: -480,
                description: 'Hero with magical swords',
                hasSprite: true
            },
            {
                id: 'blue-witch',
                name: 'Blue Witch',
                color: '#6600CC',
                moveSpeed: 180,
                jumpPower: -520,
                description: 'Magical spellcaster',
                hasSprite: true
            },
            {
                id: 'archer',
                name: 'Archer',
                color: '#008800',
                moveSpeed: 190,
                jumpPower: -450,
                description: 'Ranged bow fighter',
                hasSprite: true
            },
            {
                id: 'stickman',
                name: 'Stickman',
                color: '#FFD700',
                moveSpeed: 240,
                jumpPower: -430,
                description: 'Lightning-fast puncher',
                hasSprite: true
            },
            {
                id: 'green-tank',
                name: 'Green Tank',
                color: '#00FF00',
                moveSpeed: 150,
                jumpPower: -400,
                description: 'Slow but strong',
                hasSprite: false
            }
        ];
        
        // Selected characters
        this.selectedCharacters = {
            player1: null,
            player2: null
        };
        
        // Current selections
        this.currentSelection = {
            player1: 0,
            player2: 0
        };
        
        // Create UI elements
        this.createTitle();
        this.createCharacterDisplay();
        this.createInstructions();
        this.createPlayerLabels();
        this.createStartButton();
        
        // Set up input handling
        this.setupInputHandling();
        
        // Update initial display
        this.updateCharacterHighlight();
        this.updatePlayerInfo();
        
        // Save mode for later use
        this.mode = this.registry.get('mode') || 'local';
        Logger.log('Character select mode:', this.mode);
    }
    
    createTitle() {
        const { width, height } = this.scale;
        this.add.text(width/2, height * 0.1, 'Choose Your Fighter', {
            fontSize: '32px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
    }
    
    createCharacterDisplay() {
        const { width, height } = this.scale;
        
        // Character display area - updated for 6 characters
        this.characterDisplays = [];
        const startX = width * 0.08; // Start even further left to accommodate 6 characters
        const spacing = width * 0.14; // Reduce spacing to fit 6 characters
        
        for (let i = 0; i < 6; i++) { // Updated to 6 characters
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
            } else if (character.hasSprite && character.id === 'finn-human') {
                preview = this.add.sprite(x, y, 'finn-preview', 0); // Use frame 0 only
                preview.setScale(2); // Scale up for better visibility
                preview.setTint(0xAADDFF); // Light blue tint to match character color
                
                // Add border rectangle behind the sprite
                border = this.add.rectangle(x, y, 60, 80, 0x000000);
                border.setStrokeStyle(2, 0x000000);
                border.setAlpha(0); // Make fill transparent, only show border
                border.setDepth(preview.depth - 1); // Put border behind sprite
            } else if (character.hasSprite && character.id === 'blue-witch') {
                preview = this.add.sprite(x, y, 'blue-witch-preview', 0); // Use frame 0 only
                preview.setScale(2.5); // Scale up for better visibility
                preview.setTint(0xCCAAFF); // Light purple tint to match character color
                
                // Add border rectangle behind the sprite
                border = this.add.rectangle(x, y, 60, 80, 0x000000);
                border.setStrokeStyle(2, 0x000000);
                border.setAlpha(0); // Make fill transparent, only show border
                border.setDepth(preview.depth - 1); // Put border behind sprite
            } else if (character.hasSprite && character.id === 'archer') {
                preview = this.add.sprite(x, y, 'archer-preview', 0); // Use frame 0 only
                preview.setScale(1.5); // Reduced scale to match game scaling
                preview.setTint(0xAAFFAA); // Light green tint to match character color
                
                // Add border rectangle behind the sprite
                border = this.add.rectangle(x, y, 60, 80, 0x000000);
                border.setStrokeStyle(2, 0x000000);
                border.setAlpha(0); // Make fill transparent, only show border
                border.setDepth(preview.depth - 1); // Put border behind sprite
            } else if (character.hasSprite && character.id === 'stickman') {
                preview = this.add.sprite(x, y, 'stickman-preview', 0); // Use frame 0 only
                preview.setScale(3); // Scale up for better visibility
                preview.setTint(0xFFFFAA); // Light yellow tint to match character color
                
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
    
    createInstructions() {
        const { width, height } = this.scale;
        
        // Instructions
        this.add.text(width/2, height * 0.85, 'Player 1: A/D to move, E to select | Player 2: J/L to move, O to select', {
            fontSize: '16px',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
    }

    createPlayerLabels() {
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
        
        // Create hover indicators
        this.createHoverIndicators();
    }

    createStartButton() {
        const { width, height } = this.scale;
        
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

    setupInputHandling() {
        // Initialize current selections
        this.currentSelections = {
            player1: 0,
            player2: 0
        };
        
        // Set up controls
        this.setupControls();
    }

    updateCharacterHighlight() {
        // Update the display initially
        this.updateDisplay();
    }

    updatePlayerInfo() {
        // Update player info display
        this.updateDisplay();
    }

    createHoverIndicators() {
        const { width, height } = this.scale;
        
        // Player 1 hover indicator (left side)
        this.player1HoverIndicator = this.add.text(width * 0.25, height * 0.25, '', {
            fontSize: '20px',
            color: '#FF0000',
            fontStyle: 'bold',
            align: 'center'
        }).setOrigin(0.5);
        
        // Player 1 description
        this.player1HoverDescription = this.add.text(width * 0.25, height * 0.28, '', {
            fontSize: '14px',
            color: '#FFAAAA',
            align: 'center'
        }).setOrigin(0.5);
        
        // Player 1 stats
        this.player1HoverStats = this.add.text(width * 0.25, height * 0.31, '', {
            fontSize: '12px',
            color: '#CCCCCC',
            align: 'center'
        }).setOrigin(0.5);
        
        // Player 2 hover indicator (right side)
        this.player2HoverIndicator = this.add.text(width * 0.75, height * 0.25, '', {
            fontSize: '20px',
            color: '#0000FF',
            fontStyle: 'bold',
            align: 'center'
        }).setOrigin(0.5);
        
        // Player 2 description
        this.player2HoverDescription = this.add.text(width * 0.75, height * 0.28, '', {
            fontSize: '14px',
            color: '#AAAAFF',
            align: 'center'
        }).setOrigin(0.5);
        
        // Player 2 stats
        this.player2HoverStats = this.add.text(width * 0.75, height * 0.31, '', {
            fontSize: '12px',
            color: '#CCCCCC',
            align: 'center'
        }).setOrigin(0.5);
        
        // Add labels above the indicators
        this.add.text(width * 0.25, height * 0.22, 'Player 1 Hovering:', {
            fontSize: '14px',
            color: '#FFFFFF',
            align: 'center'
        }).setOrigin(0.5);
        
        this.add.text(width * 0.75, height * 0.22, 'Player 2 Hovering:', {
            fontSize: '14px',
            color: '#FFFFFF',
            align: 'center'
        }).setOrigin(0.5);
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
        const newIndex = Phaser.Math.Clamp(currentIndex + direction, 0, 5); // Updated to 5 (0-5 for 6 characters)
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
            if (display.character.hasSprite && display.border) {
                // For sprites (both red-fighter and finn-human), update the border rectangle
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
        
        // Update hover indicators
        const player1HoveringCharacter = this.characterTypes[this.currentSelections.player1];
        const player2HoveringCharacter = this.characterTypes[this.currentSelections.player2];
        
        if (this.player1HoverIndicator) {
            this.player1HoverIndicator.setText(player1HoveringCharacter.name);
        }
        
        if (this.player1HoverDescription) {
            this.player1HoverDescription.setText(player1HoveringCharacter.description);
        }
        
        if (this.player1HoverStats) {
            this.player1HoverStats.setText(`Speed: ${player1HoveringCharacter.moveSpeed} | Jump: ${Math.abs(player1HoveringCharacter.jumpPower)}`);
        }
        
        if (this.player2HoverIndicator) {
            this.player2HoverIndicator.setText(player2HoveringCharacter.name);
        }
        
        if (this.player2HoverDescription) {
            this.player2HoverDescription.setText(player2HoveringCharacter.description);
        }
        
        if (this.player2HoverStats) {
            this.player2HoverStats.setText(`Speed: ${player2HoveringCharacter.moveSpeed} | Jump: ${Math.abs(player2HoveringCharacter.jumpPower)}`);
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