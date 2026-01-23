import * as THREE from 'https://cdn.skypack.dev/three@0.136.0';

/**
 * THE TETHER // FINAL OPTIMIZED ENGINE
 */

let speed = 0.22;
let distance = 0;
let partnerHealth = 100;
let isGameOver = false;
let gameStarted = false;
let time = 0;

const bgMusic = document.getElementById('bg-music');
const startBtn = document.getElementById('init-button');
const touchBtn = document.getElementById('touch-pulse');
const startScreen = document.getElementById('start-screen');
const uiOverlay = document.getElementById('ui-overlay');

// --- INITIALIZATION ---
function startGame() {
    if (gameStarted) return;
    gameStarted = true;
    startScreen.classList.add('hidden');
    uiOverlay.classList.remove('hidden');
    bgMusic.play().catch(() => console.log("Audio needs interaction"));
    bgMusic.volume = 0.6;
    animate();
}

startBtn.addEventListener('click', startGame);

// --- SCENE SETUP ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ 
    canvas: document.querySelector('#game-canvas'), 
    antialias: true,
    alpha: true 
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// --- MORPHING TUNNEL ---
// We use 128 radial segments for high-definition "liquid" edges
const tunnelGeometry = new THREE.CylinderGeometry(5, 5, 100, 128, 32, true);
const tunnels = [];

for (let i = 0; i < 3; i++) {
    const mat = new THREE.MeshPhongMaterial({ 
        color: 0xffffff, 
        wireframe: true, 
        transparent: true,
        opacity: 0.8,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending 
    });
    const t = new THREE.Mesh(tunnelGeometry, mat);
    t.rotation.x = Math.PI / 2;
    t.position.z = -i * 100;
    scene.add(t);
    tunnels.push(t);
}

const light = new THREE.PointLight(0xffffff, 3, 150);
scene.add(light);
scene.add(new THREE.AmbientLight(0x222222));

// --- INPUT LOGIC ---
function triggerPulse(e) {
    if (e) e.preventDefault();
    if (!gameStarted || isGameOver) return;
    
    if (partnerHealth < 100) {
        partnerHealth = Math.min(100, partnerHealth + 15);
        speed *= 0.82; // The "Altruism Penalty"
        
        // Visual feedback
        renderer.setClearColor(0xffffff, 0.1);
        setTimeout(() => renderer.setClearColor(0x000000, 0), 50);
    }
}

window.addEventListener('keydown', (e) => { if (e.code === 'Space') triggerPulse(); });
touchBtn.addEventListener('touchstart', triggerPulse, { passive: false });
touchBtn.addEventListener('mousedown', triggerPulse);

function updateTether() {
    if (isGameOver || !gameStarted) return;

    // Stochastic decay
    partnerHealth -= (Math.random() > 0.95 ? Math.random() * 7 : 0.15);

    if (partnerHealth < 35) {
        document.body.classList.add('danger');
        bgMusic.playbackRate = 0.9;
    } else {
        document.body.classList.remove('danger');
        bgMusic.playbackRate = 1.0;
    }

    // Sync HUD
    document.getElementById('sync-level').style.width = `${Math.max(0, partnerHealth)}%`;
    document.getElementById('sync-percent').innerText = Math.floor(Math.max(0, partnerHealth));
    document.getElementById('distance').innerText = Math.floor(distance);
    document.getElementById('speed').innerText = (speed * 100).toFixed(0);

    if (partnerHealth <= 0) {
        isGameOver = true;
        bgMusic.pause();
        document.getElementById('death-screen').classList.remove('hidden');
    }
}

// --- ANIMATION LOOP ---
function animate() {
    if (isGameOver || !gameStarted) return;
    requestAnimationFrame(animate);

    time += 0.015; 

    // COLOR LOGIC
    const mainHue = (time * 0.1) % 1; 
    const cssColor = `hsl(${mainHue * 360}, 100%, 60%)`;
    document.documentElement.style.setProperty('--current-hue', cssColor);

    tunnels.forEach((t, index) => {
        t.position.z += speed;
        
        // LIQUID MORPHING MATH
        // Uses time-based sin/cos to make the tunnel "wobble" organically
        const wave = 1 + (Math.sin(time + index) * 0.3) + (Math.cos(time * 0.7) * 0.1);
        t.scale.set(wave, wave, 1);
        t.rotation.z += (index % 2 === 0 ? 0.002 : -0.002);

        // Multi-Tone Color
        const sectionHue = (mainHue + (index * 0.05)) % 1;
        t.material.color.setHSL(sectionHue, 0.9, 0.6);

        if (t.position.z > 50) t.position.z = -250;
    });

    // Environment Lighting
    light.color.setHSL((mainHue + 0.5) % 1, 1, 0.5);
    const bgColor = new THREE.Color().setHSL(mainHue, 0.5, 0.02);
    scene.background = bgColor;
    scene.fog = new THREE.FogExp2(bgColor, 0.08);

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
