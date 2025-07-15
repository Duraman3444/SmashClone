class InputManager {
    constructor(networkManager) {
        this.networkManager = networkManager;
        this.keys = {};
        this.scene = null;
        this.lastInputState = {
            left: false,
            right: false,
            jump: false,
            attack: false,
            block: false
        };
        this.inputBuffer = [];
        this.inputDelay = 16; // ~60 FPS
        this.lastInputTime = 0;
    }

    setupInputs(scene) {
        this.scene = scene;
        
        // Create key objects for both WASD and arrow keys
        this.keys = {
            // Movement keys
            left: [
                scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
                scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT)
            ],
            right: [
                scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
                scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT)
            ],
            up: [
                scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
                scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP)
            ],
            down: [
                scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
                scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN)
            ],
            
            // Action keys
            jump: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
            attack: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z),
            block: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X),
            special: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C)
        };

        // Set up key down events for immediate response
        this.keys.attack.on('down', () => {
            this.sendInputImmediate({
                type: 'attack',
                attack: true
            });
        });

        this.keys.jump.on('down', () => {
            this.sendInputImmediate({
                type: 'jump',
                jump: true
            });
        });

        // Prevent default browser behavior for game keys
        scene.input.keyboard.on('keydown', (event) => {
            const gameCodes = [
                'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
                'KeyW', 'KeyA', 'KeyS', 'KeyD',
                'Space', 'KeyZ', 'KeyX', 'KeyC', 'KeyQ', 'KeyU'
            ];
            
            if (gameCodes.includes(event.code)) {
                event.preventDefault();
            }
        });
    }

    isKeyDown(keyArray) {
        return keyArray.some(key => key.isDown);
    }

    update() {
        if (!this.scene || !this.networkManager.isConnected()) return;

        const currentTime = Date.now();
        
        // Throttle input to prevent spam
        if (currentTime - this.lastInputTime < this.inputDelay) {
            return;
        }

        // Check current input state
        const currentInputState = {
            left: this.isKeyDown(this.keys.left),
            right: this.isKeyDown(this.keys.right),
            jump: false, // Jump is handled by key down event
            attack: false, // Attack is handled by key down event
            block: this.keys.block.isDown
        };

        // Check if movement state has changed
        const movementChanged = (
            currentInputState.left !== this.lastInputState.left ||
            currentInputState.right !== this.lastInputState.right ||
            currentInputState.block !== this.lastInputState.block
        );

        // Send movement input if changed or if we're moving
        if (movementChanged || currentInputState.left || currentInputState.right) {
            this.sendInputImmediate({
                type: 'move',
                left: currentInputState.left,
                right: currentInputState.right,
                block: currentInputState.block
            });
        }

        // Update last input state
        this.lastInputState = { ...currentInputState };
        this.lastInputTime = currentTime;
    }

    sendInputImmediate(inputData) {
        if (!this.networkManager.isConnected()) return;

        // Add timestamp for lag compensation
        inputData.timestamp = Date.now();
        
        // Send to server
        this.networkManager.sendPlayerInput(inputData);
    }

    // Helper methods for checking specific keys
    isLeftPressed() {
        return this.isKeyDown(this.keys.left);
    }

    isRightPressed() {
        return this.isKeyDown(this.keys.right);
    }

    isUpPressed() {
        return this.isKeyDown(this.keys.up);
    }

    isDownPressed() {
        return this.isKeyDown(this.keys.down);
    }

    isJumpPressed() {
        return this.keys.jump.isDown;
    }

    isAttackPressed() {
        return this.keys.attack.isDown;
    }

    isBlockPressed() {
        return this.keys.block.isDown;
    }

    isSpecialPressed() {
        return this.keys.special.isDown;
    }

    // Check if jump was just pressed (for single jumps)
    isJumpJustPressed() {
        return Phaser.Input.Keyboard.JustDown(this.keys.jump);
    }

    // Check if attack was just pressed (for single attacks)
    isAttackJustPressed() {
        return Phaser.Input.Keyboard.JustDown(this.keys.attack);
    }

    // Get current input state for debugging
    getInputState() {
        return {
            left: this.isLeftPressed(),
            right: this.isRightPressed(),
            up: this.isUpPressed(),
            down: this.isDownPressed(),
            jump: this.isJumpPressed(),
            attack: this.isAttackPressed(),
            block: this.isBlockPressed(),
            special: this.isSpecialPressed()
        };
    }

    // Clean up
    destroy() {
        if (this.scene && this.scene.input) {
            this.scene.input.keyboard.removeAllKeys();
        }
    }
} 