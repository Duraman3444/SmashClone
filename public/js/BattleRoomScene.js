class BattleRoomScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BattleRoomScene' });
    }

    init(data) {
        this.roomId = data.roomId || 'default';
        this.roomName = data.roomName || 'Battle Room';
        this.networkManager = new NetworkManager();
        this.players = new Map();
        this.myPlayerId = null;
        this.myCharacterSelection = null;
        this.refreshInterval = null;
        this.allPlayersReady = false;
        
        // Character types available for selection
        this.characterTypes = [
            {
                id: 'red-fighter',
                name: 'Meow Knight',
                color: '#FF0000',
                moveSpeed: 200,
                jumpPower: -500,
                description: 'Skilled swordsman'
            },
            {
                id: 'finn-human',
                name: 'Finn the Human',
                color: '#00AAFF',
                moveSpeed: 220,
                jumpPower: -480,
                description: 'Hero with magical swords'
            },
            {
                id: 'blue-witch',
                name: 'Blue Witch',
                color: '#6600CC',
                moveSpeed: 180,
                jumpPower: -520,
                description: 'Magical spellcaster'
            },
            {
                id: 'archer',
                name: 'Archer',
                color: '#008800',
                moveSpeed: 190,
                jumpPower: -450,
                description: 'Ranged bow fighter'
            },
            {
                id: 'stickman',
                name: 'Stickman',
                color: '#FFD700',
                moveSpeed: 240,
                jumpPower: -430,
                description: 'Lightning-fast puncher'
            },
            {
                id: 'pixel-bot',
                name: 'Pixel Bot',
                color: '#FF00FF',
                moveSpeed: 200,
                jumpPower: -460,
                description: 'AI-powered fighter'
            },
            {
                id: 'green-tank',
                name: 'Green Tank',
                color: '#00FF00',
                moveSpeed: 150,
                jumpPower: -400,
                description: 'Slow but strong'
            }
        ];
        
        this.currentSelection = 0;
        this.isReady = false;
    }

    create() {
        Logger.log('BattleRoomScene created for room:', this.roomId);
        
        // Hide status div
        const statusDiv = document.getElementById('status');
        if (statusDiv) statusDiv.classList.add('hidden');
        
        const { width, height } = this.scale;
        
        // Background
        this.cameras.main.setBackgroundColor('#16213e');
        
        // Title
        this.add.text(width/2, 40, `Battle Room: ${this.roomName}`, {
            fontSize: '28px',
            color: '#fff',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5);
        
        // Room ID
        this.add.text(width/2, 70, `Room ID: ${this.roomId}`, {
            fontSize: '14px',
            color: '#aaa',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5);
        
        // Create player slots
        this.createPlayerSlots();
        
        // Create character selection area
        this.createCharacterSelection();
        
        // Create ready/start controls
        this.createReadyControls();
        
        // Create back button
        this.createBackButton();
        
        // Connect to server
        this.connectToServer();
        
        // Setup controls
        this.setupControls();
    }
    
    createPlayerSlots() {
        const { width, height } = this.scale;
        
        // Player slots container
        this.playerSlotsContainer = this.add.container(0, 0);
        
        // Player slots (up to 4 players)
        this.playerSlots = [];
        for (let i = 0; i < 4; i++) {
            const slotX = 100 + (i * 150);
            const slotY = 140;
            
            // Player slot background
            const slotBg = this.add.rectangle(slotX, slotY, 120, 160, 0x333333);
            slotBg.setStrokeStyle(2, 0x555555);
            
            // Player ID text
            const playerIdText = this.add.text(slotX, slotY - 70, 'Empty', {
                fontSize: '12px',
                color: '#666',
                fontFamily: 'Arial, sans-serif'
            }).setOrigin(0.5);
            
            // Character preview
            const characterPreview = this.add.rectangle(slotX, slotY - 20, 80, 80, 0x666666);
            characterPreview.setStrokeStyle(2, 0x888888);
            
            // Character name
            const characterName = this.add.text(slotX, slotY + 40, 'No Character', {
                fontSize: '10px',
                color: '#888',
                fontFamily: 'Arial, sans-serif'
            }).setOrigin(0.5);
            
            // Ready indicator
            const readyIndicator = this.add.text(slotX, slotY + 60, '', {
                fontSize: '12px',
                color: '#4CAF50',
                fontFamily: 'Arial, sans-serif'
            }).setOrigin(0.5);
            
            this.playerSlots.push({
                background: slotBg,
                playerIdText: playerIdText,
                characterPreview: characterPreview,
                characterName: characterName,
                readyIndicator: readyIndicator,
                playerId: null,
                character: null,
                ready: false
            });
            
            this.playerSlotsContainer.add([slotBg, playerIdText, characterPreview, characterName, readyIndicator]);
        }
        
        // Add player slots title
        this.add.text(width/2, 100, 'Connected Players', {
            fontSize: '18px',
            color: '#fff',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5);
    }
    
    createCharacterSelection() {
        const { width, height } = this.scale;
        
        // Character selection title
        this.add.text(width/2, 240, 'Select Your Character', {
            fontSize: '20px',
            color: '#fff',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5);
        
        // Character selection container
        this.characterSelectionContainer = this.add.container(0, 0);
        
        // Character displays
        this.characterDisplays = [];
        const startX = 80;
        const spacing = 90;
        
        for (let i = 0; i < this.characterTypes.length; i++) {
            const character = this.characterTypes[i];
            const x = startX + (i * spacing);
            const y = 320;
            
            // Character background
            const charBg = this.add.rectangle(x, y, 70, 90, 0x444444);
            charBg.setStrokeStyle(2, 0x666666);
            
            // Character preview (colored rectangle for now)
            const charPreview = this.add.rectangle(x, y - 10, 50, 50, character.color);
            charPreview.setStrokeStyle(2, 0x000000);
            
            // Character name
            const charName = this.add.text(x, y + 30, character.name, {
                fontSize: '10px',
                color: '#fff',
                fontFamily: 'Arial, sans-serif'
            }).setOrigin(0.5);
            
            // Selection indicator
            const selectionIndicator = this.add.rectangle(x, y, 70, 90, 0x000000);
            selectionIndicator.setStrokeStyle(3, 0x00FF00);
            selectionIndicator.setAlpha(0);
            
            this.characterDisplays.push({
                background: charBg,
                preview: charPreview,
                name: charName,
                indicator: selectionIndicator,
                character: character
            });
            
            this.characterSelectionContainer.add([charBg, charPreview, charName, selectionIndicator]);
        }
        
        // Selection controls hint
        this.add.text(width/2, 400, 'Use A/D to select character, E to confirm', {
            fontSize: '14px',
            color: '#aaa',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5);
        
        // Update initial selection
        this.updateCharacterSelection();
    }
    
    createReadyControls() {
        const { width, height } = this.scale;
        
        // Ready button
        this.readyButton = this.add.text(width/2 - 100, height - 80, 'Ready', {
            fontSize: '18px',
            backgroundColor: '#4CAF50',
            padding: { x: 20, y: 10 },
            color: '#fff',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        this.readyButton.on('pointerdown', () => {
            this.toggleReady();
        });
        
        // Start button (only visible when all players ready)
        this.startButton = this.add.text(width/2 + 100, height - 80, 'Start Battle', {
            fontSize: '18px',
            backgroundColor: '#FF9800',
            padding: { x: 20, y: 10 },
            color: '#fff',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setVisible(false);
        
        this.startButton.on('pointerdown', () => {
            this.startBattle();
        });
        
        // Status text
        this.statusText = this.add.text(width/2, height - 40, 'Select character and press Ready', {
            fontSize: '14px',
            color: '#aaa',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5);
    }
    
    createBackButton() {
        const { width, height } = this.scale;
        
        this.backButton = this.add.text(50, height - 50, '← Back to Lobby', {
            fontSize: '16px',
            backgroundColor: '#666',
            padding: { x: 10, y: 5 },
            color: '#fff',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        this.backButton.on('pointerdown', () => {
            this.leaveBattleRoom();
        });
    }
    
    setupControls() {
        // Character selection controls
        this.leftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.rightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.selectKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
        this.readyKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        
        this.leftKey.on('down', () => this.moveSelection(-1));
        this.rightKey.on('down', () => this.moveSelection(1));
        this.selectKey.on('down', () => this.selectCharacter());
        this.readyKey.on('down', () => this.toggleReady());
    }
    
    moveSelection(direction) {
        this.currentSelection = Phaser.Math.Clamp(
            this.currentSelection + direction, 
            0, 
            this.characterTypes.length - 1
        );
        this.updateCharacterSelection();
    }
    
    selectCharacter() {
        const selectedCharacter = this.characterTypes[this.currentSelection];
        this.myCharacterSelection = selectedCharacter;
        
        // Send character selection to server
        this.networkManager.sendCharacterSelection(selectedCharacter);
        
        Logger.log('Selected character:', selectedCharacter.name);
        this.updateReadyButton();
    }
    
    updateCharacterSelection() {
        // Update visual selection indicator
        this.characterDisplays.forEach((display, index) => {
            if (index === this.currentSelection) {
                display.indicator.setAlpha(1);
            } else {
                display.indicator.setAlpha(0);
            }
        });
    }
    
    toggleReady() {
        if (!this.myCharacterSelection) {
            this.showMessage('Please select a character first!');
            return;
        }
        
        this.isReady = !this.isReady;
        this.networkManager.sendReadyStatus(this.isReady);
        this.updateReadyButton();
    }
    
    updateReadyButton() {
        if (this.isReady) {
            this.readyButton.setText('Not Ready');
            this.readyButton.setStyle({ backgroundColor: '#f44336' });
        } else {
            this.readyButton.setText('Ready');
            this.readyButton.setStyle({ backgroundColor: '#4CAF50' });
        }
    }
    
    connectToServer() {
        const serverUrl = window.location.origin;
        this.networkManager.connect(serverUrl);
        
        this.networkManager.onConnectionChange((connected) => {
            if (connected) {
                this.myPlayerId = this.networkManager.getPlayerId();
                Logger.log('Connected to battle room server, my ID:', this.myPlayerId);
                this.networkManager.joinBattleRoom(this.roomId);
            } else {
                this.showMessage('Connection lost!');
            }
        });
        
        this.networkManager.onBattleRoomUpdate((data) => {
            this.updateBattleRoom(data);
        });
        
        this.networkManager.onBattleStart((data) => {
            this.startGameWithPlayers(data);
        });
    }
    
    updateBattleRoom(data) {
        Logger.log('Battle room update:', data);
        
        // Update player slots
        this.playerSlots.forEach((slot, index) => {
            if (index < data.players.length) {
                const player = data.players[index];
                slot.playerId = player.id;
                slot.character = player.character;
                slot.ready = player.ready;
                
                // Update UI
                slot.playerIdText.setText(player.id === this.myPlayerId ? 'You' : player.id.substr(0, 8));
                slot.playerIdText.setColor(player.id === this.myPlayerId ? '#00FF00' : '#fff');
                
                if (player.character) {
                    slot.characterPreview.setFillStyle(player.character.color);
                    slot.characterName.setText(player.character.name);
                } else {
                    slot.characterPreview.setFillStyle(0x666666);
                    slot.characterName.setText('Selecting...');
                }
                
                slot.readyIndicator.setText(player.ready ? 'READY' : 'NOT READY');
                slot.readyIndicator.setColor(player.ready ? '#4CAF50' : '#f44336');
                
                // Highlight own slot
                if (player.id === this.myPlayerId) {
                    slot.background.setStrokeStyle(3, 0x00FF00);
                } else {
                    slot.background.setStrokeStyle(2, 0x555555);
                }
            } else {
                // Empty slot
                slot.playerId = null;
                slot.character = null;
                slot.ready = false;
                slot.playerIdText.setText('Empty');
                slot.playerIdText.setColor('#666');
                slot.characterPreview.setFillStyle(0x666666);
                slot.characterName.setText('Waiting...');
                slot.readyIndicator.setText('');
                slot.background.setStrokeStyle(2, 0x555555);
            }
        });
        
        // Check if all players are ready
        this.allPlayersReady = data.players.length >= 2 && data.players.every(p => p.ready && p.character);
        
        if (this.allPlayersReady) {
            this.startButton.setVisible(true);
            this.statusText.setText('All players ready! Click Start Battle');
        } else {
            this.startButton.setVisible(false);
            this.statusText.setText(`${data.players.filter(p => p.ready).length}/${data.players.length} players ready`);
        }
    }
    
    startBattle() {
        if (this.allPlayersReady) {
            this.networkManager.startBattle();
        }
    }
    
    startGameWithPlayers(data) {
        Logger.log('Starting battle with players:', data.players);
        
        // Create character mapping for game scene
        const selectedCharacters = {};
        data.players.forEach((player, index) => {
            selectedCharacters[`player${index + 1}`] = player.character;
        });
        
        this.cleanup();
        this.scene.start('GameScene', {
            mode: 'multiplayer',
            selectedCharacters: selectedCharacters,
            roomId: this.roomId,
            playerId: this.myPlayerId
        });
    }
    
    leaveBattleRoom() {
        this.cleanup();
        this.scene.start('RoomLobbyScene');
    }
    
    showMessage(message) {
        const { width, height } = this.scale;
        
        if (this.messageText) {
            this.messageText.destroy();
        }
        
        this.messageText = this.add.text(width/2, height/2, message, {
            fontSize: '18px',
            color: '#f44336',
            backgroundColor: '#333',
            padding: { x: 20, y: 10 },
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5);
        
        // Remove message after 3 seconds
        this.time.delayedCall(3000, () => {
            if (this.messageText) {
                this.messageText.destroy();
                this.messageText = null;
            }
        });
    }
    
    cleanup() {
        if (this.refreshInterval) {
            this.refreshInterval.destroy();
        }
        
        if (this.networkManager) {
            this.networkManager.leaveBattleRoom();
            this.networkManager.disconnect();
        }
    }
    
    destroy() {
        this.cleanup();
        super.destroy();
    }
} 