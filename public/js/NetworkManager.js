class NetworkManager {
    constructor() {
        this.socket = null;
        this.connected = false;
        this.playerId = null;
        this.gameStateCallbacks = [];
        this.gameEndCallbacks = [];
        this.connectionCallbacks = [];
        this.roomListCallbacks = [];
        this.battleRoomCallbacks = [];
        this.battleStartCallbacks = [];
        this.roomId = 'default';
    }

    connect(serverUrl = 'http://localhost:3000') {
        Logger.log('NetworkManager connecting to', serverUrl);
        this.socket = io(serverUrl);
        
        this.socket.on('connect', () => {
            console.log('Connected to server');
            this.connected = true;
            this.playerId = this.socket.id;
            
            // Join default room
            this.joinRoom(this.roomId);
            
            // Notify connection callbacks
            this.connectionCallbacks.forEach(callback => callback(true));
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from server');
            this.connected = false;
            this.connectionCallbacks.forEach(callback => callback(false));
        });

        this.socket.on('gameState', (gameState) => {
            Logger.log('Received gameState', gameState);
            this.gameStateCallbacks.forEach(callback => callback(gameState));
        });

        this.socket.on('gameEnd', (data) => {
            this.gameEndCallbacks.forEach(callback => callback(data));
        });

        this.socket.on('roomFull', () => {
            this.showStatus('Room is full!', 'Please try again later.');
        });

        this.socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
            this.showStatus('Connection Error', 'Failed to connect to server. Please refresh and try again.');
        });

        this.socket.on('reconnect', () => {
            console.log('Reconnected to server');
            this.joinRoom(this.roomId);
        });

        this.socket.on('roomList', (rooms) => {
            this.roomListCallbacks.forEach(callback => callback(rooms));
        });

        this.socket.on('roomCreated', (roomData) => {
            Logger.log('Room created:', roomData);
        });

        this.socket.on('roomJoined', (roomData) => {
            Logger.log('Joined room:', roomData);
        });

        this.socket.on('battleRoomUpdate', (data) => {
            this.battleRoomCallbacks.forEach(callback => callback(data));
        });

        this.socket.on('battleStart', (data) => {
            this.battleStartCallbacks.forEach(callback => callback(data));
        });
    }

    joinRoom(roomId, selectedCharacter = null) {
        if (this.socket && this.connected) {
            this.roomId = roomId;
            const joinData = selectedCharacter ? 
                { roomId, character: selectedCharacter } : 
                roomId;
            this.socket.emit('joinRoom', joinData);
        }
    }

    sendPlayerInput(inputData) {
        if (this.socket && this.connected) {
            this.socket.emit('playerInput', inputData);
        }
    }

    onGameStateUpdate(callback) {
        this.gameStateCallbacks.push(callback);
    }

    onGameEnd(callback) {
        this.gameEndCallbacks.push(callback);
    }

    onConnectionChange(callback) {
        this.connectionCallbacks.push(callback);
    }

    showStatus(title, message) {
        const status = document.getElementById('status');
        status.innerHTML = `
            <h2>${title}</h2>
            <p>${message}</p>
        `;
        status.classList.remove('hidden');
    }

    hideStatus() {
        const status = document.getElementById('status');
        status.classList.add('hidden');
    }

    isConnected() {
        return this.connected;
    }

    getPlayerId() {
        return this.playerId;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
        }
    }

    // Room management methods
    createRoom(roomId, roomName, selectedCharacter) {
        if (this.socket && this.connected) {
            this.socket.emit('createRoom', { 
                roomId, 
                roomName, 
                character: selectedCharacter 
            });
        }
    }

    requestRoomList() {
        if (this.socket && this.connected) {
            this.socket.emit('requestRoomList');
        }
    }

    onRoomListUpdate(callback) {
        this.roomListCallbacks.push(callback);
    }

    // Battle room methods
    joinBattleRoom(roomId) {
        if (this.socket && this.connected) {
            this.roomId = roomId;
            this.socket.emit('joinBattleRoom', roomId);
        }
    }

    leaveBattleRoom() {
        if (this.socket && this.connected) {
            this.socket.emit('leaveBattleRoom');
        }
    }

    sendCharacterSelection(character) {
        if (this.socket && this.connected) {
            this.socket.emit('selectCharacter', character);
        }
    }

    sendReadyStatus(ready) {
        if (this.socket && this.connected) {
            this.socket.emit('setReady', ready);
        }
    }

    startBattle() {
        if (this.socket && this.connected) {
            this.socket.emit('startBattle');
        }
    }

    onBattleRoomUpdate(callback) {
        this.battleRoomCallbacks.push(callback);
    }

    onBattleStart(callback) {
        this.battleStartCallbacks.push(callback);
    }

} 