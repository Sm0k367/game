# THE TETHER // Project Oblivion

**"Your survival is no longer yours to decide."**

## 👁️ The Concept
THE TETHER is a minimalist, multiplayer survival experiment based on **Non-Zero-Sum Game Theory**. You are paired with a total stranger. You share a life bar. You share a fate.

## 🕹️ The Mechanics
- **The Link:** You are tethered to a random player. If their health hits 0%, your connection is severed and you lose all progress.
- **The Pulse:** Pressing `[SPACE]` sends 15% health to your partner. 
- **The Cost:** Every Pulse you send slows your velocity by 20%. To save them, you must sacrifice your position on the leaderboard.
- **The Acceleration:** The game naturally speeds up over time. The faster you go, the harder it is to react, and the faster your partner's health decays.

## 🧠 Game Theory Analysis
This game explores the **Iterated Prisoner's Dilemma**. 
- Do you cooperate to ensure mutual survival? 
- Or do you hoard your speed to stay at the top of the leaderboard, hoping your partner is "strong enough" to survive without your help?

## 🚀 Quick Start
1. **Clone the repo:** `git clone https://github.com/your-username/the-tether.git`
2. **Install:** `npm install`
3. **Launch:** `npm start`
4. **Access:** Open `localhost:3000` in two different tabs to simulate two players.

## 🛠️ Tech Stack
- **Frontend:** Three.js (3D Engine), CSS3 (Neon-Brutalist UI)
- **Backend:** Node.js, Socket.io (Real-time P2P simulation)
- **Aesthetic:** Cyber-grid, 122 BPM pulse synchronization
