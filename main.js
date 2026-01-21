import * as THREE from 'https://cdn.skypack.dev/three@0.136.0';

// --- CONFIGURATION ---
let speed = 0.2;
let distance = 0;
let partnerHealth = 100;
let isGameOver = false;
let gameStarted = false;
let time = 0; // The master clock for morphing

// Audio & UI Elements
const bgMusic = document.getElementById('bg-music');
const startBtn = document.getElementById('init-button');
const startScreen = document.getElementById('start-screen');
const uiOverlay = document.getElementById('ui-overlay');

// --- INITIALIZATION ---
startBtn.addEventListener('click', () => {
    gameStarted = true;
    startScreen.classList.add('hidden');
    uiOverlay.classList.remove('hidden');
    bgMusic.play();
    bgMusic.volume = 0.6;
    animate();
});

// --- THREE.JS SCENE SETUP ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#game-canvas'), antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

// Initial fog (will be updated dynamically)
scene.fog = new THREE.FogExp2(0x000000, 0.1);

// --- WORLD: THE MORPHING TUNNEL ---
// We use more segments (64) to make the morphing look smoother
const tunnelGeometry = new THREE.CylinderGeometry(5, 5, 100, 64, 20, true);
const tunnelMaterial = new THREE.MeshPhongMaterial({ 
    color: 0xffffff, 
    wireframe: true, 
    side: THREE.BackSide,
    transparent: true,
    opacity: 0.8
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

// --- THE TETHER ENGINE ---
function updateTether() {
    if (isGameOver || !gameStarted) return;

    const decay = Math.random() > 0.95 ? Math.random() * 6 : 0.15;
    partnerHealth -= decay;

    if (partnerHealth < 30) {
        bgMusic.playbackRate = 0.92; // Audio "warps" when in danger
    } else {
        bgMusic.playbackRate = 1.0;
    }

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
            speed *= 0.85; 
        }
    }
});

function endGame() {
    isGameOver = true;
    bgMusic.pause();
    document.getElementById('death-screen').classList.remove('hidden');
}

// --- ANIMATION LOOP (The Morphing Core) ---
function animate() {
    if (isGameOver || !gameStarted) return;
    requestAnimationFrame(animate);

    time += 0.01; // Increase time for the color/shape cycle

    // Dynamic Color Cycle
    const mainHue = (time * 0.1) % 1; // Cycles through 0.0 to 1.0
    const secondaryHue = (mainHue + 0.5) % 1; // Opposite color on the wheel

    tunnels.forEach((t, index) => {
        t.position.z += speed;
        
        // Morphing: Update Scale based on Sine Wave
        const scaleVal = 1 + Math.sin(time + index) * 0.3;
        t.scale.set(scaleVal, scaleVal, 1);
        
        // Rotation: Slowly twist the tunnel for a "kaleidoscope" feel
        t.rotation.z += 0.002;

        // Color Morph: Update the tunnel material hue
        t.material.color.setHSL(mainHue, 0.8, 0.5);

        if (t.position.z > 50) t.position.z = -250;
    });

    // Update Lighting and Fog to match the color cycle
    light.color.setHSL(secondaryHue, 1, 0.5);
    const sceneColor = new THREE.Color().setHSL(mainHue, 0.4, 0.05);
    scene.background = sceneColor;
    scene.fog.color = sceneColor;

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
