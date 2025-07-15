# Super Smash Clone

A multiplayer Super Smash Bros clone built with Phaser 3 and Socket.io. This is a prototype implementation following the game week project requirements.

## 🎮 Game Features

- **Multiplayer**: Up to 4 players can play simultaneously
- **Real-time Combat**: Players can move, jump, and attack in real-time
- **Damage System**: Health percentage increases with damage (like Smash Bros)
- **Knockback Mechanics**: Higher damage = stronger knockback
- **Lives System**: 3 lives per player
- **Respawn System**: Players respawn when knocked off stage
- **Placeholder Characters**: 4 different colored characters (Red, Green, Blue, Yellow)
- **Simple Stage**: Ground platform with multiple smaller platforms

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
   - Open multiple tabs/windows to test multiplayer

### Alternative: Separate Server/Client

If you prefer to run server and client separately:

```bash
# Terminal 1: Start server
npm run server

# Terminal 2: Start client
npm run client
```

## 🎯 How to Play

### Controls
- **Movement**: WASD or Arrow Keys
- **Jump**: Spacebar
- **Attack**: Z key
- **Block**: X key (placeholder for future implementation)

### Objective
- Battle other players on the stage
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
│       ├── GameScene.js   # Main game scene
│       ├── NetworkManager.js  # Socket.io handling
│       └── InputManager.js    # Input management
├── package.json           # Dependencies and scripts
├── PRD.md                # Product Requirements Document
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

### Single Player Testing
1. Open `http://localhost:3000` in your browser
2. You should see your character (colored rectangle) on the stage
3. Test movement with WASD/Arrow keys
4. Test jumping with Spacebar
5. Test attacking with Z key

### Multiplayer Testing
1. Open multiple browser tabs/windows to `http://localhost:3000`
2. Each tab represents a different player
3. Test that all players can see each other
4. Test combat between players
5. Test knockback and elimination mechanics

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

## 🎨 Customization

### Adding New Characters
1. Add new colors to `characterColors` array in `server/game/GameRoom.js`
2. Increase `maxPlayers` if needed
3. Add character-specific logic in game files

### Adding New Stages
1. Modify `createStage()` in `public/js/GameScene.js`
2. Update platform collision in `server/game/GameRoom.js`
3. Add stage selection logic

### Modifying Game Rules
1. Edit combat parameters in `server/game/GameRoom.js`
2. Adjust physics values (gravity, jump strength, etc.)
3. Modify win conditions in `checkGameEnd()`

## 📋 Phase Implementation Status

### ✅ Phase 1: Foundation & Prototype (COMPLETE)
- [x] Basic project structure
- [x] Phaser 3 setup
- [x] Socket.io multiplayer foundation
- [x] Player movement and controls
- [x] Simple stage with platforms
- [x] Basic physics and collision

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