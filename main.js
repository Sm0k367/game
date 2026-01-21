import * as THREE from 'https://cdn.skypack.dev/three@0.136.0';

/**
 * THE TETHER // FINAL MORPHING ENGINE
 * Integrated: HSL Hue Bridge, Sine Wave Distortion, and Dynamic Audio
 */

// --- CONFIGURATION ---
let speed = 0.2;
let distance = 0;
let partnerHealth = 100;
let isGameOver = false;
let gameStarted = false;
let time = 0; // Master clock for the morphing math

// UI & Audio References
const bgMusic = document.getElementById('bg-music');
const startBtn = document.getElementById('init-button');
const startScreen = document.getElementById('start-screen');
const uiOverlay = document.getElementById('ui-overlay');

// --- INITIALIZATION ---
startBtn.addEventListener('click', () => {
    gameStarted = true;
    startScreen.classList.add('hidden');
    uiOverlay.classList.remove('hidden');
    
    // Unlock and play audio
    bgMusic.play();
    bgMusic.volume = 0.6;
    
    animate();
});

// --- THREE.JS SCENE SETUP ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ 
    canvas: document.querySelector('#game-canvas'), 
    antialias: true 
});
renderer.setSize(window.innerWidth, window.innerHeight);

// Initial Fog (will be updated dynamically by the Hue Bridge)
scene.fog = new THREE.FogExp2(0x000000, 0.1);

// --- WORLD: THE MORPHING TUNNEL ---
// High segment count (64, 20) allows for smoother Sine wave distortion
const tunnelGeometry = new THREE.CylinderGeometry(5, 5, 100, 64, 20, true);
const tunnelMaterial = new THREE.MeshPhongMaterial({ 
    color: 0xffffff, 
    wireframe: true, 
    side: THREE.BackSide,
    transparent: true,
    opacity: 0.9
});

const tunnels = [];
for (let i = 0; i < 3; i++) {
    const t = new THREE.Mesh(tunnelGeometry, tunnelMaterial.clone());
    t.rotation.x = Math.PI / 2;
    t.position.z = -i * 100;
    scene.add(t);
    tunnels.push(t);
}

const light = new THREE.PointLight(0xffffff, 2, 80);
scene.add(light);
scene.add(new THREE.AmbientLight(0x202020));

// --- TETHER ENGINE ---
function updateTether() {
    if (isGameOver || !gameStarted) return;

    // Stochastic partner decay (Game Theory Variable)
    const decay = Math.random() > 0.95 ? Math.random() * 6 : 0.15;
    partnerHealth -= decay;

    // UI Feedback: Anxiety triggers
    if (partnerHealth < 30) {
        document.body.classList.add('danger');
        bgMusic.playbackRate = 0.92; // Audio "warps"
    } else {
        document.body.classList.remove('danger');
        bgMusic.playbackRate = 1.0;
    }

    // Update HUD Values
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
            speed *= 0.85; // Altruism cost (velocity penalty)
            
            // Visual pulse on save
            renderer.setClearColor(0x444444);
            setTimeout(() => renderer.setClearColor(0x000000), 50);
        }
    }
});

function endGame() {
    isGameOver = true;
    bgMusic.pause();
    document.getElementById('death-screen').classList.remove('hidden');
}

// --- ANIMATION LOOP ---
function animate() {
    if (isGameOver || !gameStarted) return;
    requestAnimationFrame(animate);

    time += 0.01; 

    // 1. DYNAMIC COLOR CYCLE (HSL)
    const mainHue = (time * 0.1) % 1; 
    const secondaryHue = (mainHue + 0.5) % 1; 

    // 2. CSS COLOR BRIDGE
    // Converts JS Math into CSS variables for the HUD and Borders
    const cssHue = `hsl(${mainHue * 360}, 100%, 50%)`;
    document.documentElement.style.setProperty('--current-hue', cssHue);

    tunnels.forEach((t, index) => {
        t.position.z += speed;
        
        // 3. GEOMETRIC MORPHING
        // Sine wave makes the tunnel expand/contract organically
        const scaleVal = 1 + Math.sin(time + index) * 0.3;
        t.scale.set(scaleVal, scaleVal, 1);
        
        // Twist rotation for a kaleidoscope effect
        t.rotation.z += 0.002;

        // Apply Hue to Wireframe
        t.material.color.setHSL(mainHue, 0.8, 0.5);

        // Loop the tunnel sections
        if (t.position.z > 50) t.position.z = -250;
    });

    // 4. ENVIRONMENT SYNC
    light.color.setHSL(secondaryHue, 1, 0.5);
    const sceneColor = new THREE.Color().setHSL(mainHue, 0.4, 0.05);
    scene.background = sceneColor;
    scene.fog.color = sceneColor;

    // Movement Physics
    speed += 0.00015; 
    distance += speed;

    updateTether();
    renderer.render(scene, camera);
}

// Resize Handling
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
