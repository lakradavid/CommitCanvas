# Commit Canvas

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

---

## Examples

### 1. Basic Commit Workflow

The most fundamental Git flow — initialize, add files, and commit.

```bash
git init
touch README.md
git add README.md
git commit -m "Initial commit"
git log
```

**What you'll see:** A single commit node appears on the `main` branch in the graph. The right panel shows `HEAD → main`, staging area is empty, and 1 commit is tracked.

---

### 2. Feature Branch Workflow

Develop a feature in isolation and merge it back.

```bash
git init
touch main.js
git add .
git commit -m "Initial commit"

git checkout -b feature/login
touch login.js
git add .
git commit -m "Add login page"

git checkout main
git merge feature/login
```

**What you'll see:** Two branches appear in the animated graph. After the merge, a merge commit node with two parent edges is drawn — showing exactly how `feature/login` joins `main`.

---

### 3. Rebase for a Clean History

Instead of a merge commit, replay your feature commits on top of main.

```bash
git init
touch app.js
git add .
git commit -m "Initial commit"

git checkout -b feature/navbar
touch navbar.js
git add .
git commit -m "Add navbar"

git checkout main
touch utils.js
git add .
git commit -m "Add utils"

git checkout feature/navbar
git rebase main
```

**What you'll see:** The `feature/navbar` commit is replayed with a new hash directly on top of `main`'s latest commit, producing a perfectly linear graph — no merge diamond.

---

### 4. Undo a Mistake with Reset

Made a bad commit? Roll HEAD back.

```bash
git init
touch file.txt
git add .
git commit -m "Good commit"

touch oops.txt
git add .
git commit -m "Bad commit"

git reset --hard HEAD~1
git log
```

**What you'll see:** The "Bad commit" node disappears from the graph and `main` pointer moves back one step. `--hard` discards all staged changes too — the right panel shows an empty staging area.

---

### 5. Safe Undo with Revert

When the history is shared, revert instead of reset.

```bash
git init
touch app.js
git add .
git commit -m "Add app.js"

touch bug.js
git add .
git commit -m "Introduce bug"

git revert HEAD
git log
```

**What you'll see:** A new `Revert "Introduce bug"` commit appears *after* the bad one — history is preserved, nothing is rewritten. Safe to use on shared branches.

---

### 6. Stash Unfinished Work

Switch context without losing work-in-progress.

```bash
git init
touch app.js
git add .
git commit -m "Initial commit"

touch wip.js
git stash

git stash list
# → stash@{0}: WIP on main

git stash pop
git status
```

**What you'll see:** After `git stash`, the staging area in the right panel clears. After `git stash pop`, `wip.js` is back in the staged files list.

---

### 7. Tag a Release

Mark a commit permanently as a version.

```bash
git init
touch app.js
git add .
git commit -m "v1.0 release"

git tag v1.0
git tag
# → v1.0
```

**What you'll see:** The commit node in the graph gets a `v1.0` tag badge. The state panel also lists active tags.

---

### 8. Detached HEAD Exploration

Inspect any past commit without affecting branches.

```bash
git init
touch a.txt
git add .
git commit -m "Commit A"

touch b.txt
git add .
git commit -m "Commit B"

git log
# copy the hash of Commit A, e.g. a1b2c3d

git checkout a1b2c3d
git status
```

**What you'll see:** The graph shows `HEAD` pointing directly to the old commit node, detached from any branch. The state panel displays `detached HEAD` mode as a warning.

---

### 9. Full Challenge Walkthrough (Challenge 4 — Merge Branches)

This is the exact solution for the built-in "Merge Branches" challenge.

```bash
git init
touch feature.txt
git add .
git commit -m "base commit"

git checkout -b feature
touch feature.txt
git add .
git commit -m "feature"

git checkout main
git merge feature
```

The challenge validator checks for `minBranches: 2` and `minMergeCommits: 1` — both satisfied here. You'll earn **30 points**.

---

### 10. Stash with a Custom Message

```bash
git init
touch task.js
git stash -m "half-done task refactor"

git stash list
# → stash@{0}: half-done task refactor

git stash pop
```

Custom stash messages make it easy to track multiple WIP entries when switching between several tasks.
