import * as THREE from 'https://cdn.skypack.dev/three@0.136.0';

// --- CONFIGURATION ---
const COLORS = { cyan: 0x00f2ff, red: 0xff003c, bg: 0x050505 };
let speed = 0.2;
let distance = 0;
let partnerHealth = 100;
let isGameOver = false;
let gameStarted = false;

// Audio Elements
const bgMusic = document.getElementById('bg-music');
const startBtn = document.getElementById('init-button');
const startScreen = document.getElementById('start-screen');
const uiOverlay = document.getElementById('ui-overlay');

// --- INITIALIZATION ---
startBtn.addEventListener('click', () => {
    gameStarted = true;
    startScreen.classList.add('hidden');
    uiOverlay.classList.remove('hidden');
    
    // Start Game.mp3
    bgMusic.play();
    bgMusic.volume = 0.6;
    
    animate();
});

// --- THREE.JS SCENE SETUP ---
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(COLORS.bg, 0.15);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#game-canvas'), antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

// --- WORLD: THE OBLIVION TUNNEL ---
const tunnelGeometry = new THREE.CylinderGeometry(5, 5, 100, 32, 1, true);
const tunnelMaterial = new THREE.MeshPhongMaterial({ color: 0x222222, wireframe: true, side: THREE.BackSide });
const tunnels = [];
for (let i = 0; i < 3; i++) {
    const t = new THREE.Mesh(tunnelGeometry, tunnelMaterial);
    t.rotation.x = Math.PI / 2;
    t.position.z = -i * 100;
    scene.add(t);
    tunnels.push(t);
}
const light = new THREE.PointLight(COLORS.cyan, 2, 50);
scene.add(light);
scene.add(new THREE.AmbientLight(0x404040));

// --- TETHER ENGINE ---
function updateTether() {
    if (isGameOver || !gameStarted) return;

    // Simulate Partner Health Decay
    const decay = Math.random() > 0.95 ? Math.random() * 6 : 0.15;
    partnerHealth -= decay;

    // Audio Reactive Logic: Music gets "unstable" as sync drops
    if (partnerHealth < 30) {
        bgMusic.playbackRate = 0.95; // Slight slow down for tension
        document.body.classList.add('danger');
        light.color.setHex(COLORS.red);
    } else {
        bgMusic.playbackRate = 1.0;
        document.body.classList.remove('danger');
        light.color.setHex(COLORS.cyan);
    }

    // Update HUD
    document.getElementById('sync-level').style.width = `${partnerHealth}%`;
    document.getElementById('sync-percent').innerText = `${Math.floor(partnerHealth)}%`;
    document.getElementById('distance').innerText = Math.floor(distance);
    document.getElementById('speed').innerText = (speed * 100).toFixed(1);

    if (partnerHealth <= 0) endGame();
}

// --- COOPERATION MECHANIC ---
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && gameStarted && !isGameOver) {
        if (partnerHealth < 100) {
            partnerHealth = Math.min(100, partnerHealth + 12);
            speed *= 0.85; // Altruism Penalty
            
            // Visual Flash
            renderer.setClearColor(0x333333);
            setTimeout(() => renderer.setClearColor(COLORS.bg), 50);
        }
    }
});

function endGame() {
    isGameOver = true;
    bgMusic.pause();
    document.getElementById('death-screen').classList.remove('hidden');
}

function animate() {
    if (isGameOver || !gameStarted) return;
    requestAnimationFrame(animate);

    tunnels.forEach(t => {
        t.position.z += speed;
        if (t.position.z > 50) t.position.z = -250;
    });

    speed += 0.00015; 
    distance += speed;
    updateTether();
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
