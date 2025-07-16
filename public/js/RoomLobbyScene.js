class RoomLobbyScene extends Phaser.Scene {
    constructor() {
        super({ key: 'RoomLobbyScene' });
    }

    init(data) {
        this.selectedCharacter = data.selectedCharacter || {
            id: 'red-fighter',
            name: 'Red Fighter',
            color: '#FF0000'
        };
        this.networkManager = new NetworkManager();
        this.rooms = [];
        this.refreshInterval = null;
    }

    create() {
        Logger.log('RoomLobbyScene created');
        
        // Hide status div
        const statusDiv = document.getElementById('status');
        if (statusDiv) statusDiv.classList.add('hidden');
        
        const { width, height } = this.scale;
        
        // Background
        this.cameras.main.setBackgroundColor('#1a1a2e');
        
        // Title
        this.add.text(width/2, 50, 'Server Room Lobby', {
            fontSize: '32px',
            color: '#eee',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5);
        
        // Selected character display
        this.add.text(width/2, 90, `Playing as: ${this.selectedCharacter.name}`, {
            fontSize: '16px',
            color: '#aaa',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5);
        
        // Create room section
        this.createRoomSection();
        
        // Room list section
        this.createRoomListSection();
        
        // Connect to server
        this.connectToServer();
        
        // Setup refresh
        this.setupRefresh();
        
        // Back button
        this.createBackButton();
    }
    
    createRoomSection() {
        const { width, height } = this.scale;
        
        // Create Room Header
        this.add.text(100, 140, 'Create New Room', {
            fontSize: '20px',
            color: '#fff',
            fontFamily: 'Arial, sans-serif'
        });
        
        // Room name input (simulated)
        this.roomNameInput = this.add.rectangle(300, 180, 200, 40, 0x333333);
        this.roomNameInput.setStrokeStyle(2, 0x555555);
        this.roomNameInput.setInteractive({ useHandCursor: true });
        
        this.roomNameText = this.add.text(300, 180, 'Room Name', {
            fontSize: '16px',
            color: '#999',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5);
        
        this.currentRoomName = '';
        
        // Room name input handling
        this.roomNameInput.on('pointerdown', () => {
            this.openRoomNameInput();
        });
        
        // Create room button
        this.createRoomButton = this.add.text(520, 180, 'Create Room', {
            fontSize: '16px',
            backgroundColor: '#4CAF50',
            padding: { x: 15, y: 8 },
            color: '#fff',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        this.createRoomButton.on('pointerdown', () => {
            this.createRoom();
        });
    }
    
    createRoomListSection() {
        const { width, height } = this.scale;
        
        // Room List Header
        this.add.text(100, 240, 'Available Rooms', {
            fontSize: '20px',
            color: '#fff',
            fontFamily: 'Arial, sans-serif'
        });
        
        // Refresh button
        this.refreshButton = this.add.text(width - 100, 240, 'Refresh', {
            fontSize: '16px',
            backgroundColor: '#2196F3',
            padding: { x: 10, y: 5 },
            color: '#fff',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        this.refreshButton.on('pointerdown', () => {
            this.refreshRooms();
        });
        
        // Room list container
        this.roomListContainer = this.add.container(0, 0);
        
        // No rooms message
        this.noRoomsText = this.add.text(width/2, 350, 'No rooms available. Create one!', {
            fontSize: '16px',
            color: '#666',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5);
    }
    
    createBackButton() {
        const { width, height } = this.scale;
        
        this.backButton = this.add.text(100, height - 50, '← Back to Character Select', {
            fontSize: '16px',
            backgroundColor: '#666',
            padding: { x: 10, y: 5 },
            color: '#fff',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        this.backButton.on('pointerdown', () => {
            this.cleanup();
            this.scene.start('CharacterSelectScene');
        });
    }
    
    openRoomNameInput() {
        // Simple prompt for room name
        const roomName = prompt('Enter room name:', this.currentRoomName || '');
        if (roomName && roomName.trim()) {
            this.currentRoomName = roomName.trim();
            this.roomNameText.setText(this.currentRoomName);
            this.roomNameText.setColor('#fff');
        }
    }
    
    createRoom() {
        if (!this.currentRoomName || this.currentRoomName.trim() === '') {
            alert('Please enter a room name');
            return;
        }
        
        if (!this.networkManager.isConnected()) {
            alert('Not connected to server');
            return;
        }
        
        const roomId = 'room_' + Date.now();
        this.networkManager.createRoom(roomId, this.currentRoomName, this.selectedCharacter);
        
        // Join the created room
        this.joinRoom(roomId);
    }
    
    joinRoom(roomId) {
        Logger.log('Joining battle room:', roomId);
        
        // Show connecting message
        this.showConnectingMessage('Joining battle room...');
        
        // Start battle room scene
        this.time.delayedCall(1000, () => {
            this.cleanup();
            this.scene.start('BattleRoomScene', {
                roomId: roomId,
                roomName: this.getRoomName(roomId)
            });
        });
    }

    getRoomName(roomId) {
        // Find room name from the rooms list
        for (const room of this.rooms) {
            if (room.id === roomId) {
                return room.name;
            }
        }
        return 'Battle Room';
    }
    
    connectToServer() {
        const serverUrl = window.location.origin;
        this.networkManager.connect(serverUrl);
        
        this.networkManager.onConnectionChange((connected) => {
            if (connected) {
                Logger.log('Connected to server');
                this.refreshRooms();
            } else {
                Logger.log('Disconnected from server');
                this.showError('Connection lost');
            }
        });
        
        this.networkManager.onRoomListUpdate((rooms) => {
            this.updateRoomList(rooms);
        });
    }
    
    setupRefresh() {
        // Auto-refresh every 3 seconds
        this.refreshInterval = this.time.addEvent({
            delay: 3000,
            callback: () => {
                if (this.networkManager.isConnected()) {
                    this.refreshRooms();
                }
            },
            loop: true
        });
    }
    
    refreshRooms() {
        if (this.networkManager.isConnected()) {
            this.networkManager.requestRoomList();
        }
    }
    
    updateRoomList(rooms) {
        // Store rooms for later lookup
        this.rooms = rooms;
        
        // Clear existing room list
        this.roomListContainer.removeAll(true);
        
        if (rooms.length === 0) {
            this.noRoomsText.setVisible(true);
            return;
        }
        
        this.noRoomsText.setVisible(false);
        
        // Display rooms
        rooms.forEach((room, index) => {
            const y = 280 + (index * 60);
            this.createRoomListItem(room, y);
        });
    }
    
    createRoomListItem(room, y) {
        const { width } = this.scale;
        
        // Room background
        const roomBg = this.add.rectangle(width/2, y, width - 40, 50, 0x333333);
        roomBg.setStrokeStyle(1, 0x555555);
        
        // Room name
        const roomName = this.add.text(120, y, room.name, {
            fontSize: '18px',
            color: '#fff',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0, 0.5);
        
        // Player count
        const playerCount = this.add.text(width - 200, y, `${room.playerCount}/${room.maxPlayers}`, {
            fontSize: '16px',
            color: '#aaa',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0, 0.5);
        
        // Status
        const statusColor = room.gameStarted ? '#FF9800' : '#4CAF50';
        const statusText = room.gameStarted ? 'In Game' : 'Waiting';
        const status = this.add.text(width - 130, y, statusText, {
            fontSize: '14px',
            color: statusColor,
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0, 0.5);
        
        // Join button
        const canJoin = !room.gameStarted && room.playerCount < room.maxPlayers;
        const joinButton = this.add.text(width - 80, y, 'Join', {
            fontSize: '14px',
            backgroundColor: canJoin ? '#2196F3' : '#666',
            padding: { x: 8, y: 4 },
            color: '#fff',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5).setInteractive({ useHandCursor: canJoin });
        
        if (canJoin) {
            joinButton.on('pointerdown', () => {
                this.joinRoom(room.id);
            });
        }
        
        // Add to container
        this.roomListContainer.add([roomBg, roomName, playerCount, status, joinButton]);
    }
    
    showConnectingMessage(message) {
        const { width, height } = this.scale;
        
        if (this.connectingMessage) {
            this.connectingMessage.destroy();
        }
        
        this.connectingMessage = this.add.text(width/2, height/2, message, {
            fontSize: '20px',
            color: '#fff',
            backgroundColor: '#333',
            padding: { x: 20, y: 10 },
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5);
    }
    
    showError(message) {
        const { width, height } = this.scale;
        
        const errorText = this.add.text(width/2, height - 100, message, {
            fontSize: '16px',
            color: '#f44336',
            fontFamily: 'Arial, sans-serif'
        }).setOrigin(0.5);
        
        // Remove after 3 seconds
        this.time.delayedCall(3000, () => {
            errorText.destroy();
        });
    }
    
    cleanup() {
        if (this.refreshInterval) {
            this.refreshInterval.destroy();
        }
        
        if (this.networkManager) {
            this.networkManager.disconnect();
        }
    }
    
    destroy() {
        this.cleanup();
        super.destroy();
    }
} 