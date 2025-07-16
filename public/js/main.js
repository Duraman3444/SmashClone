// main.js - Entry point
// Initialize Phaser game with MenuScene first

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: [MenuScene, CharacterSelectScene, RoomLobbyScene, BattleRoomScene, GameScene],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    }
};

window.addEventListener('DOMContentLoaded', () => {
    Logger.log('DOM loaded, creating Phaser Game');
    window.gameInstance = new Phaser.Game(config);
});

// Toggle debug log visibility with the H key
window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'h') {
        const dbg = document.getElementById('debugLog');
        if (dbg) dbg.classList.toggle('hidden');
    }
}); 