# Git Workflow for Super Smash Clone

## Branch Structure

- **main**: Active development branch - commits/pushes happen regularly
- **demo**: Stable demo branch - only updated when user requests

## Workflow Rules

### Main Branch
- ✅ Regular commits and pushes for all development work
- ✅ Continuous integration of new features
- ✅ Bug fixes and improvements
- ✅ Documentation updates

### Demo Branch
- ⚠️ **ONLY** updated when user explicitly requests
- 🎯 Contains stable, tested versions for demonstration
- 🔒 Protected from automatic updates

## Current Status

### Branch Setup Complete ✅
- [x] Git repository initialized
- [x] Initial commit with complete 2-player local game
- [x] Main branch created with full codebase
- [x] Demo branch created (identical to main initially)

### Commit History
- **a8fa6a9** (2024-12-XX): feat: Add up arrow key as additional jump control for Player 1
- **eaabe6a** (2024-12-XX): feat: Add W and I keys as additional jump controls
- **0ccd34f** (2024-12-XX): feat: Add gravity and proper jumping mechanics
- **bb6a87d** (2024-12-XX): docs: Update README with 2-player controls and Git workflow
- **d3b84d8** (2024-12-XX): docs: Add Git workflow documentation
- **abf821a** (2024-12-XX): Initial commit - Super Smash Clone with 2-player local mode

### Latest Demo Branch Update
- **Date**: 2024-12-XX
- **Action**: Merged all changes from main to demo branch
- **Result**: Both branches now synchronized at commit c949673
- **Features**: Complete 2-player game with physics, gravity, multiple jump controls, enhanced life system, fixed setTint errors, and game over screen with rematch/main menu options

## Usage Commands

### Regular Development (Main)
```bash
# Switch to main (if not already there)
git checkout main

# Add and commit changes
git add .
git commit -m "Description of changes"

# Push to main (when remote is set up)
git push origin main
```

### Demo Updates (Only when requested)
```bash
# Switch to demo
git checkout demo

# Merge from main
git merge main

# Push to demo (when remote is set up)
git push origin demo
```

## Remote Repository Setup (Next Steps)

When ready to push to a remote repository:

1. Create repository on GitHub/GitLab
2. Add remote origin:
   ```bash
   git remote add origin <repository-url>
   ```
3. Push both branches:
   ```bash
   git push -u origin main
   git push -u origin demo
   ```

## Notes

- Both branches currently contain identical code
- All future development will happen on **main**
- Demo branch will only be updated when user requests it
- This ensures demo always contains stable, tested versions