import * as THREE from 'https://cdn.skypack.dev/three@0.136.0';

/**
 * THE TETHER // FIX: MORPHING & COLOR BRIDGE
 */

let speed = 0.2;
let distance = 0;
let partnerHealth = 100;
let isGameOver = false;
let gameStarted = false;
let time = 0; 

const bgMusic = document.getElementById('bg-music');
const startBtn = document.getElementById('init-button');
const startScreen = document.getElementById('start-screen');
const uiOverlay = document.getElementById('ui-overlay');

// --- INITIALIZATION ---
startBtn.addEventListener('click', () => {
    gameStarted = true;
    startScreen.classList.add('hidden');
    uiOverlay.classList.remove('hidden');
    bgMusic.play().catch(e => console.log("Audio play blocked", e));
    bgMusic.volume = 0.5;
    animate();
});

// --- SCENE SETUP ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#game-canvas'), antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

// --- MORPHING TUNNEL GEOMETRY ---
// Higher segments (64, 20) allow the mesh to "bend" smoothly
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

const light = new THREE.PointLight(0xffffff, 2, 100);
scene.add(light);
scene.add(new THREE.AmbientLight(0x222222));

// --- TETHER LOGIC ---
function updateTether() {
    if (isGameOver || !gameStarted) return;

    // Decay logic
    const decay = Math.random() > 0.96 ? Math.random() * 5 : 0.12;
    partnerHealth -= decay;

    if (partnerHealth < 30) {
        document.body.classList.add('danger');
        bgMusic.playbackRate = 0.9; 
    } else {
        document.body.classList.remove('danger');
        bgMusic.playbackRate = 1.0;
    }

    // UI Updates
    document.getElementById('sync-level').style.width = `${Math.max(0, partnerHealth)}%`;
    document.getElementById('sync-percent').innerText = `${Math.floor(Math.max(0, partnerHealth))}%`;
    document.getElementById('distance').innerText = Math.floor(distance);
    document.getElementById('speed').innerText = (speed * 100).toFixed(1);

    if (partnerHealth <= 0) {
        isGameOver = true;
        bgMusic.pause();
        document.getElementById('death-screen').classList.remove('hidden');
    }
}

// --- SPACEBAR MECHANIC ---
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && gameStarted && !isGameOver) {
        if (partnerHealth < 100) {
            partnerHealth = Math.min(100, partnerHealth + 15);
            speed *= 0.82; // Penalty
            renderer.setClearColor(0x333333);
            setTimeout(() => renderer.setClearColor(0x000000), 50);
        }
    }
});

// --- ANIMATION LOOP ---
function animate() {
    if (isGameOver || !gameStarted) return;
    requestAnimationFrame(animate);

    time += 0.01; 

    // 1. DYNAMIC COLOR (HSL)
    const hue = (time * 0.1) % 1; 
    const cssHue = `hsl(${hue * 360}, 100%, 50%)`;
    
    // 2. CSS BRIDGE: Injects the color into style.css
    document.documentElement.style.setProperty('--current-hue', cssHue);

    tunnels.forEach((t, index) => {
        t.position.z += speed;
        
        // 3. MORPHING MATH: Sine wave scales the tunnel sections
        const morphScale = 1 + Math.sin(time + (index * 2)) * 0.4;
        t.scale.set(morphScale, morphScale, 1);
        t.rotation.z += 0.002;

        // Apply hue to the tunnel wireframe
        t.material.color.setHSL(hue, 0.8, 0.5);

        if (t.position.z > 50) t.position.z = -250;
    });

    // Sync environment lighting with the color cycle
    light.color.setHSL((hue + 0.5) % 1, 1, 0.5); 
    const bgColor = new THREE.Color().setHSL(hue, 0.5, 0.02);
    scene.background = bgColor;
    scene.fog = new THREE.FogExp2(bgColor, 0.08);

    speed += 0.0001; 
    distance += speed;
    updateTether();
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
