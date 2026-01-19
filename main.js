import * as THREE from 'https://cdn.skypack.dev/three@0.136.0';

// --- CONFIGURATION ---
const COLORS = {
    cyan: 0x00f2ff,
    red: 0xff003c,
    bg: 0x050505
};

let speed = 0.2;
let distance = 0;
let syncLevel = 100;
let partnerHealth = 100;
let isGameOver = false;

// --- THREE.JS SETUP ---
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(COLORS.bg, 0.15);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('#game-canvas'), antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

// --- WORLD GENERATION: THE TUNNEL ---
const tunnelGeometry = new THREE.CylinderGeometry(5, 5, 100, 32, 1, true);
const tunnelMaterial = new THREE.MeshPhongMaterial({
    color: 0x222222,
    wireframe: true,
    side: THREE.BackSide
});

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

// --- THE TETHER CORE LOGIC ---
function updateTether() {
    if (isGameOver) return;

    // Simulate Partner Health Decay (The Game Theory Variable)
    // A random decay represents the unpredictable nature of a human partner
    const decay = Math.random() > 0.95 ? Math.random() * 5 : 0.1;
    partnerHealth -= decay;

    // Sync Level is the average of your stability and theirs
    syncLevel = Math.max(0, partnerHealth);

    // Update UI
    document.getElementById('sync-level').style.width = `${syncLevel}%`;
    document.getElementById('sync-percent').innerText = `${Math.floor(syncLevel)}%`;
    document.getElementById('distance').innerText = Math.floor(distance);
    document.getElementById('speed').innerText = (speed * 100).toFixed(1);

    // Trigger Visual Alerts
    if (syncLevel < 30) {
        document.body.classList.add('danger');
        light.color.setHex(COLORS.red);
    } else {
        document.body.classList.remove('danger');
        light.color.setHex(COLORS.cyan);
    }

    // Death Condition: Connection Severed
    if (syncLevel <= 0) endGame();
}

// --- COOPERATION MECHANIC: THE PULSE ---
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !isGameOver) {
        // Sacrifice Personal Speed to Heal Partner
        // Game Theory: The "Altruist" choice
        if (partnerHealth < 100) {
            partnerHealth = Math.min(100, partnerHealth + 15);
            speed *= 0.8; // You slow down significantly
            
            // Visual feedback for the Pulse
            renderer.setClearColor(0x111111);
            setTimeout(() => renderer.setClearColor(COLORS.bg), 50);
        }
    }
});

function endGame() {
    isGameOver = true;
    document.getElementById('death-screen').classList.remove('hidden');
}

// --- MAIN LOOP ---
function animate() {
    if (isGameOver) return;
    requestAnimationFrame(animate);

    // Move Tunnel
    tunnels.forEach(t => {
        t.position.z += speed;
        if (t.position.z > 50) t.position.z = -250;
    });

    // Passive Acceleration (Incentive to not help partner)
    speed += 0.0001; 
    distance += speed;

    updateTether();
    renderer.render(scene, camera);
}

// Handle Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
