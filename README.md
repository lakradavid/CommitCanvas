# Commit Canvas 🎨

> Learn Git visually through interactive animated commit graphs.

## Stack

| Layer      | Tech                                      |
|------------|-------------------------------------------|
| Frontend   | React 18, Vite, Tailwind CSS, React Flow, Framer Motion |
| Backend    | Node.js, Express.js (ESM)                 |
| Database   | MongoDB + Mongoose                        |
| Auth       | JWT + bcrypt                              |
| Deploy     | Docker + Docker Compose                   |

## Features

- **Interactive Git Graph** — animated commit graph powered by React Flow
- **11 Git Commands** — init, add, commit, branch, checkout, merge, rebase, reset, revert, stash, tag
- **Step-by-step explanations** — every command explains what happened and why
- **Practice Challenges** — 6 progressive challenges (beginner → advanced)
- **Undo / Redo** — experiment freely, reverse any command
- **Export PNG** — save your commit graph as an image
- **Command History** — searchable, paginated history across all repos
- **Dark / Light mode** — GitHub-inspired theme
- **Responsive UI** — works on desktop and mobile

## Quick Start

### With Docker (recommended)

```bash
docker-compose up --build
```

- Frontend: http://localhost:5173  
- Backend API: http://localhost:5000/api  
- MongoDB: localhost:27017

### Local Development

**Backend**
```bash
cd backend
cp .env.example .env   # configure MONGO_URI, JWT_SECRET
npm install
npm run dev
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

## Project Structure

```
CommitCanvas/
├── backend/
│   ├── src/
│   │   ├── config/         # MongoDB connection
│   │   ├── controllers/    # auth, repo, history, challenge
│   │   ├── middleware/     # JWT auth, error handler
│   │   ├── models/         # User, Repository, Challenge, SimulationHistory
│   │   ├── routes/         # REST API routes
│   │   ├── utils/          # gitSimulator.js (core engine), jwt helpers
│   │   └── server.js
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/     # GitGraph, Terminal, StatePanel, Layout
│   │   ├── lib/            # axios instance
│   │   ├── pages/          # Landing, Login, Register, Dashboard, Simulator, Challenges, History
│   │   └── store/          # Zustand: auth, repo, theme
│   └── Dockerfile
└── docker-compose.yml
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Sign in |
| GET | /api/auth/me | Get current user |
| GET | /api/repos | List repositories |
| POST | /api/repos | Create repository |
| POST | /api/repos/:id/command | Execute Git command |
| POST | /api/repos/:id/undo | Undo last command |
| POST | /api/repos/:id/redo | Redo command |
| GET | /api/challenges | List challenges |
| GET | /api/history | Simulation history (paginated + searchable) |

## Supported Commands

```bash
git init          # Initialize repository
touch <file>      # Create virtual file
git add .         # Stage all files
git add <file>    # Stage specific file
git commit -m ""  # Commit staged changes
git branch        # List / create / delete branches
git checkout      # Switch branches or commits
git merge         # Merge branch
git rebase        # Rebase onto branch
git reset         # Reset HEAD (--soft/--mixed/--hard)
git revert        # Create revert commit
git stash         # Stash changes (push/pop/list/drop)
git tag           # List or create tags
git status        # Working tree status
git log           # Commit history
```
