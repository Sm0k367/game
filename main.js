import * as THREE from 'https://cdn.skypack.dev/three@0.136.0';

/**
 * THE TETHER // NEON OBLIVION ENGINE
 * Features: Multi-Neon Morphing, Mobile Touch, and Kinetic Physics
 */

let speed = 0.22;
let distance = 0;
let partnerHealth = 100;
let isGameOver = false;
let gameStarted = false;
let time = 0;

// UI & Audio References
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
    bgMusic.play();
    bgMusic.volume = 0.6;
    animate();
}

startBtn.addEventListener('click', startGame);

// --- SCENE SETUP ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#game-canvas'), antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// --- THE MULTI-NEON TUNNEL ---
// We use massive segment counts for "Mind-Blowing" smooth morphing
const tunnelGeometry = new THREE.CylinderGeometry(5, 5, 100, 128, 32, true);
const tunnels = [];

for (let i = 0; i < 3; i++) {
    const material = new THREE.MeshPhongMaterial({ 
        color: 0xffffff, 
        wireframe: true, 
        transparent: true,
        opacity: 0.7,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending // Makes the colors glow/stack
    });
    const t = new THREE.Mesh(tunnelGeometry, material);
    t.rotation.x = Math.PI / 2;
    t.position.z = -i * 100;
    scene.add(t);
    tunnels.push(t);
}

const light = new THREE.PointLight(0xffffff, 3, 150);
scene.add(light);
scene.add(new THREE.AmbientLight(0x111111));

// --- GAME LOGIC ---
function triggerPulse() {
    if (!gameStarted || isGameOver) return;
    if (partnerHealth < 100) {
        partnerHealth = Math.min(100, partnerHealth + 14);
        speed *= 0.8; // Kinetic penalty
        
        // Flash Effect
        renderer.setClearColor(0xffffff, 0.2);
        setTimeout(() => renderer.setClearColor(0x000000, 1), 40);
    }
}

// Controls: Keyboard + Touch
window.addEventListener('keydown', (e) => { if (e.code === 'Space') triggerPulse(); });
touchBtn.addEventListener('touchstart', (e) => { e.preventDefault(); triggerPulse(); });
touchBtn.addEventListener('mousedown', triggerPulse);

function updateTether() {
    if (isGameOver || !gameStarted) return;

    partnerHealth -= (Math.random() > 0.97 ? Math.random() * 8 : 0.18);

    if (partnerHealth < 35) {
        document.body.classList.add('danger');
        bgMusic.playbackRate = 0.88; 
    } else {
        document.body.classList.remove('danger');
        bgMusic.playbackRate = 1.05; // Slightly faster music as you go
    }

    document.getElementById('sync-level').style.width = `${Math.max(0, partnerHealth)}%`;
    document.getElementById('sync-percent').innerText = Math.floor(partnerHealth);
    document.getElementById('distance').innerText = Math.floor(distance);
    document.getElementById('speed').innerText = (speed * 120).toFixed(0);

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

    // MIND-BLOWING COLOR MATH
    const mainHue = (time * 0.15) % 1; 
    const secondaryHue = (mainHue + 0.33) % 1; // Triadic color scheme
    const tertiaryHue = (mainHue + 0.66) % 1;

    // Bridge to CSS
    document.documentElement.style.setProperty('--current-hue', `hsl(${mainHue * 360}, 100%, 60%)`);

    tunnels.forEach((t, index) => {
        t.position.z += speed;
        
        // COMPLEX MORPHING
        // Combines two sine waves for unpredictable "liquid" movement
        const morph = 1 + (Math.sin(time + index) * 0.3) + (Math.cos(time * 0.5) * 0.1);
        t.scale.set(morph, morph, 1);
        
        // Counter-rotation for kaleidoscope effect
        t.rotation.z += (index % 2 === 0 ? 0.003 : -0.003);

        // Multi-Color Morphing: Each tunnel section has a slightly shifted hue
        const sectionHue = (mainHue + (index * 0.1)) % 1;
        t.material.color.setHSL(sectionHue, 0.9, 0.6);

        if (t.position.z > 50) t.position.z = -250;
    });

    // Dynamic Lighting
    light.color.setHSL(secondaryHue, 1, 0.5);
    light.position.set(Math.sin(time) * 5, Math.cos(time) * 5, -20);

    const sceneColor = new THREE.Color().setHSL(mainHue, 0.6, 0.02);
    scene.background = sceneColor;
    scene.fog = new THREE.FogExp2(sceneColor, 0.07);

    speed += 0.0002; 
    distance += speed;
    updateTether();
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
