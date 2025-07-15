# Super Smash Clone

A multiplayer Super Smash Bros clone built with Phaser 3 and Socket.io. This is a prototype implementation following the game week project requirements.

## 🎮 Game Features

- **2-Player Local Mode**: Two players can play simultaneously on the same device
- **Real-time Combat**: Players can move, jump, and attack in real-time
- **Damage System**: Health percentage increases with damage (like Smash Bros)
- **Knockback Mechanics**: Higher damage = stronger knockback
- **Lives System**: 3 lives per player
- **Respawn System**: Players respawn when knocked off stage
- **Placeholder Characters**: Red and Blue characters with unique controls
- **Simple Stage**: Ground platform with multiple smaller platforms
- **Online Multiplayer**: Support for up to 4 players online (via Socket.io)

## 🕹️ Controls

### Player 1 (Red)
- **Movement**: WASD or Arrow Keys
- **Attack**: Z key

### Player 2 (Blue)  
- **Movement**: IJKL keys
- **Attack**: O key

### Debug
- **H**: Toggle debug log overlay

## 🚀 Quick Start

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn package manager

### Installation

1. **Clone or download this project**
2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev:both
   ```
   This will start both the server and client simultaneously.

4. **Open your browser:**
   - Go to `http://localhost:3000`
   - Click "Start Game" for 2-player local mode
   - Or click "Online Multiplayer" to play with others

### Alternative: Separate Server/Client

If you prefer to run server and client separately:

```bash
# Terminal 1: Start server
npm run server

# Terminal 2: Start client
npm run client
```

## 🔧 Git Workflow

This project uses a dual-branch workflow:

- **main**: Active development branch with regular commits and updates
- **demo**: Stable demo branch, only updated when requested

### Development Process
All regular development happens on the **main** branch. The **demo** branch is only updated when you specifically request it, ensuring it always contains stable, tested versions.

For detailed workflow information, see [GIT_WORKFLOW.md](GIT_WORKFLOW.md).

## 🎯 How to Play

### Objective
- Battle the other player on the stage
- Deal damage to increase their knockback vulnerability
- Knock opponents off the stage to eliminate them
- Last player standing wins!

### Game Mechanics
- **Damage**: Starts at 0%, increases when hit
- **Knockback**: Stronger with higher damage percentage
- **Lives**: Each player has 3 lives
- **Respawn**: Players respawn at center stage when knocked off
- **Elimination**: Players are eliminated when they lose all lives

## 🏗️ Project Structure

```
SuperSmashClone/
├── server/                 # Server-side code
│   ├── index.js           # Main server file
│   └── game/
│       └── GameRoom.js    # Game room management
├── public/                # Client-side code
│   ├── index.html         # Main HTML file
│   └── js/
│       ├── main.js        # Game initialization
│       ├── MenuScene.js   # Menu system
│       ├── GameScene.js   # Main game scene
│       ├── NetworkManager.js  # Socket.io handling
│       ├── InputManager.js    # Input management
│       └── Logger.js      # Debug logging
├── package.json           # Dependencies and scripts
├── PRD.md                # Product Requirements Document
├── GIT_WORKFLOW.md       # Git workflow documentation
└── README.md             # This file
```

## 🛠️ Technical Details

### Server Architecture
- **Node.js** with Express for web serving
- **Socket.io** for real-time multiplayer communication
- **Authoritative server** - all game logic runs on server
- **60 FPS** game loop for smooth gameplay

### Client Architecture
- **Phaser 3** game engine for rendering and input
- **Socket.io** client for server communication
- **Client-side prediction** for responsive movement
- **Real-time synchronization** with server state

### Networking
- **Real-time multiplayer** using WebSockets
- **Room-based** game sessions (up to 4 players)
- **Automatic reconnection** handling
- **Input lag compensation** with timestamped inputs

## 🧪 Testing

### Local 2-Player Testing
1. Open `http://localhost:3000` in your browser
2. Click "Start Game" for 2-player local mode
3. Player 1 uses WASD + Z, Player 2 uses IJKL + O
4. Test movement, attacks, and combat mechanics

### Online Multiplayer Testing
1. Open multiple browser tabs/windows to `http://localhost:3000`
2. Click "Online Multiplayer" in each tab
3. Each tab represents a different player
4. Test that all players can see each other and interact

### Network Testing
1. Test with slow network (Chrome DevTools > Network > Slow 3G)
2. Test disconnection/reconnection
3. Test with multiple devices on same network

## 🐛 Known Issues & Limitations

### Current Limitations
- **Placeholder Graphics**: Simple colored rectangles instead of sprites
- **Basic Stage**: Only one stage with simple platforms
- **No Sound**: Audio not implemented yet
- **Basic Combat**: Only one attack type
- **No Special Moves**: Special attacks not implemented

### Known Issues
- Player positions may jitter slightly due to network synchronization
- Attack hitboxes are basic rectangles
- No collision detection between players (they can overlap)
- Camera is fixed (doesn't follow players)

## 🔧 Development Commands

```bash
# Start both server and client
npm run dev:both

# Start server only
npm run server

# Start client only  
npm run client

# Production start
npm start
```

## 📋 Phase Implementation Status

### ✅ Phase 1: Foundation & Prototype (COMPLETE)
- [x] Basic project structure
- [x] Phaser 3 setup
- [x] Socket.io multiplayer foundation
- [x] Player movement and controls
- [x] Simple stage with platforms
- [x] Basic physics and collision
- [x] 2-player local mode

### 🔄 Phase 2: Core Gameplay (IN PROGRESS)
- [x] 4 player support
- [x] Health/damage system
- [x] Combat mechanics
- [x] Knockback system
- [x] Lives and respawn
- [x] Victory conditions
- [x] Real-time synchronization

### ⏳ Phase 3: Polish & Enhancement (PLANNED)
- [ ] Character sprites and animations
- [ ] Multiple stages
- [ ] Sound effects
- [ ] Special moves
- [ ] Visual effects
- [ ] Improved UI

## 🚀 Deployment

### Local Development
The current setup is perfect for local development and testing.

### Production Deployment
For production deployment, consider:
1. **Heroku**: Easy deployment with `git push`
2. **Railway**: Modern alternative to Heroku
3. **DigitalOcean**: VPS with more control
4. **Netlify** + **Heroku**: Separate client/server deployment

### Environment Variables
Create a `.env` file for production:
```
PORT=3000
NODE_ENV=production
```

## 🤝 Contributing

This is a prototype project for learning purposes. Feel free to:
1. Report bugs by creating detailed issue descriptions
2. Suggest improvements
3. Fork and experiment with new features
4. Share your modifications

## 📝 License

This project is for educational purposes. Feel free to use and modify as needed.

## 🎯 Next Steps

1. **Phase 2 Completion**: Finish multiplayer polish
2. **Phase 3 Implementation**: Add visual polish and effects
3. **Performance Optimization**: Improve network efficiency
4. **Mobile Support**: Add touch controls
5. **More Content**: Additional characters and stages

---

**Happy Gaming!** 🎮 