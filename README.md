# THE TETHER // Project Oblivion

> **"Your survival is no longer yours to decide."**

THE TETHER is a high-speed, 3D social experiment built with Three.js and Node.js. It explores the **Iterated Prisoner's Dilemma** by tethering your progress to a stochastic partner system. 

## 🧪 The Experiment
You are moving through an infinite digital void. Your "Sync Stability" is tied to a remote partner. 
- If their health hits 0%, your connection is severed.
- You can save them by pressing `[SPACE]` to send a **Pulse**.
- Sending a Pulse costs you **15% of your current velocity**.

**The Goal:** Achieve the maximum distance without severing the link.

## 🕹️ Controls
- **MOUSE/TOUCH:** Viewport Interaction
- **SPACEBAR:** Send Pulse (Transfer health to partner)
- **ENTER:** Re-tether (After connection loss)

## 🛠️ Technical Implementation
- **Visuals:** Three.js Custom Cylinder Geometry with Wireframe Mesh.
- **Audio:** ReMi-generated "Cyber-Soul" soundtrack (`Game.mp3`) with dynamic playback rate adjustments based on game state.
- **Logic:** Procedural tunnel generation and stochastic decay algorithms.

## 🚀 Deployment Guide (GitHub Pages)

To share this game with the world via GitHub Pages:

1. **Upload Files:** Ensure `index.html`, `style.css`, `main.js`, and `Game.mp3` are in your root folder.
2. **Push to GitHub:** Create a new repository and push your code.
3. **Settings:** Go to `Settings` > `Pages`.
4. **Build and Deployment:** Under "Branch," select `main` and `/ (root)`, then click **Save**.
5. **Live:** Your game will be live at `https://<your-username>.github.io/<repo-name>/` in about 60 seconds.

---
*Created as a study in Game Theory and Human Cooperation.*
