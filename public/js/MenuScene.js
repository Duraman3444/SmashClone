class MenuScene extends Phaser.Scene {
    constructor(){
        super({key:'MenuScene'});
    }
    preload(){}
    create(){
        Logger.log('MenuScene created');
        const statusDiv=document.getElementById('status');
        if(statusDiv) statusDiv.classList.add('hidden');
        const { width, height } = this.scale;
        
        this.add.text(width/2, height/4, 'Super Smash Clone', {fontSize:'32px',color:'#ffffff'}).setOrigin(0.5);
        this.add.text(width/2, height/3, '2-Player Local Game', {fontSize:'18px',color:'#cccccc'}).setOrigin(0.5);
        
        const btnStyle = {fontSize:'24px', backgroundColor:'#333', padding:{x:20,y:10}, color:'#fff'};
        
        const startBtn = this.add.text(width/2, height/2, 'Start Game', btnStyle).setOrigin(0.5).setInteractive({useHandCursor:true});
        const multiBtn = this.add.text(width/2, height/2+60, 'Online Multiplayer', btnStyle).setOrigin(0.5).setInteractive({useHandCursor:true});
        
        startBtn.on('pointerdown', ()=>{
            Logger.log('2-Player local game selected');
            this.scene.start('CharacterSelectScene', { mode:'local' });
        });
        
        multiBtn.on('pointerdown', ()=>{
            Logger.log('Online multiplayer selected');
            this.scene.start('CharacterSelectScene', { mode:'multiplayer', showRoomLobby: true });
        });
        
        // Add instruction text
        this.add.text(width/2, height*0.75, 'Player 1: WASD + W/Up Arrow/Spacebar to jump + E + direction to attack + R + direction for special + T to block\nPlayer 2: IJKL + I to jump + O + direction to attack + P + direction for special + [ to block\nDirectional Attacks: Hold movement key + attack key for Up/Down/Left/Right attacks', {
            fontSize:'14px', 
            color:'#888888', 
            align:'center'
        }).setOrigin(0.5);
    }
} 