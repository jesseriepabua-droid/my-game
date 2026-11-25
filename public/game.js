const socket = io();

// UI Elements
const lobby = document.getElementById('lobby');
const hud = document.getElementById('hud');
const playerNameInput = document.getElementById('playerName');
const roomCodeInput = document.getElementById('roomCodeInput');
const createBtn = document.getElementById('createBtn');
const joinBtn = document.getElementById('joinBtn');
const errorMsg = document.getElementById('errorMsg');
const displayRoomCode = document.getElementById('displayRoomCode');
const copyCodeBtn = document.getElementById('copyCodeBtn');
const timerDisplay = document.getElementById('timerDisplay');
const scoreboard = document.getElementById('scoreboard');
const killFeed = document.getElementById('killFeed');
const hpBar = document.getElementById('hpBar');
const hpText = document.getElementById('hpText');
const ammoText = document.getElementById('ammoText');
const clickPrompt = document.getElementById('clickPrompt');
const matchOverModal = document.getElementById('matchOverModal');
const finalStandings = document.getElementById('finalStandings');

let selectedColor = '#ff5252';
let myId = null;
let myPlayer = null;
let allPlayers = {};
let remoteMeshes = {};
let bullets = [];
let obstacles = [];

// Color selection
document.querySelectorAll('.color-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.color-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    selectedColor = btn.dataset.color;
  });
});

createBtn.addEventListener('click', () => {
  errorMsg.textContent = '';
  socket.emit('createRoom', {
    name: playerNameInput.value,
    color: selectedColor
  });
});

joinBtn.addEventListener('click', () => {
  errorMsg.textContent = '';
  const code = roomCodeInput.value.trim().toUpperCase();
  if (code.length !== 4) {
    errorMsg.textContent = 'Please enter a 4-letter room code.';
    return;
  }
  socket.emit('joinRoom', {
    code,
    name: playerNameInput.value,
    color: selectedColor
  });
});

copyCodeBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(displayRoomCode.textContent);
  copyCodeBtn.textContent = 'Copied!';
  setTimeout(() => (copyCodeBtn.textContent = 'Copy'), 1500);
});

// THREE.JS SETUP
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
scene.fog = new THREE.Fog(0x87ceeb, 20, 95);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 200);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(25, 45, 20);
dirLight.castShadow = true;
scene.add(dirLight);

// Arena Floor & Walls
const floorGeo = new THREE.PlaneGeometry(70, 70);
const floorMat = new THREE.MeshStandardMaterial({ color: 0x4caf50 });
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

function addBox(x, y, z, w, h, d, color) {
  const geo = new THREE.BoxGeometry(w, h, d);
  const mat = new THREE.MeshStandardMaterial({ color });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
  obstacles.push({ minX: x - w / 2, maxX: x + w / 2, minZ: z - d / 2, maxZ: z + d / 2, maxY: y + h / 2 });
}

// Outer Walls
addBox(0, 3, -35, 70, 6, 2, 0x546e7a);
addBox(0, 3, 35, 70, 6, 2, 0x546e7a);
addBox(-35, 3, 0, 2, 6, 70, 0x546e7a);
addBox(35, 3, 0, 2, 6, 70, 0x546e7a);

// Cover Crates & Pillars
addBox(0, 1.5, 0, 5, 3, 5, 0xd84315);
addBox(-12, 1.25, -10, 4, 2.5, 4, 0xff8f00);
addBox(12, 1.25, 10, 4, 2.5, 4, 0xff8f00);
addBox(-12, 1.25, 10, 4, 2.5, 4, 0x8d6e63);
addBox(12, 1.25, -10, 4, 2.5, 4, 0x8d6e63);
addBox(0, 1.25, -18, 6, 2.5, 2, 0x78909c);
addBox(0, 1.25, 18, 6, 2.5, 2, 0x78909c);

// Create 3D Egg Mesh for Remote Players
function createEggMesh(colorHex) {
  const group = new THREE.Group();
  const eggGeo = new THREE.SphereGeometry(0.85, 20, 20);
  eggGeo.scale(1, 1.35, 1);
  const eggMat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.35 });
  const body = new THREE.Mesh(eggGeo, eggMat);
  body.castShadow = true;
  group.add(body);

  // Visor / Eyes
  const visorGeo = new THREE.BoxGeometry(0.9, 0.25, 0.4);
  const visorMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
  const visor = new THREE.Mesh(visorGeo, visorMat);
  visor.position.set(0, 0.35, -0.7);
  group.add(visor);

  // Blaster
  const gunGeo = new THREE.BoxGeometry(0.2, 0.2, 0.9);
  const gunMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
  const gun = new THREE.Mesh(gunGeo, gunMat);
  gun.position.set(0.65, 0.1, -0.6);
  group.add(gun);

  return group;
}

// First-person gun model
const fpGun = new THREE.Mesh(
  new THREE.BoxGeometry(0.14, 0.14, 0.65),
  new THREE.MeshStandardMaterial({ color: 0x263238 })
);
fpGun.position.set(0.32, -0.25, -0.5);
camera.add(fpGun);
scene.add(camera);

// Movement & Controls State
const keys = {};
let yaw = 0;
let pitch = 0;
let velocityY = 0;
let isGrounded = true;
let ammo = 12;
let isReloading = false;
let gameActive = false;

window.addEventListener('keydown', (e) => {
  keys[e.code] = true;
  if (e.code === 'KeyR' && ammo < 12 && !isReloading) reload();
});
window.addEventListener('keyup', (e) => (keys[e.code] = false));

renderer.domElement.addEventListener('click', () => {
  if (!gameActive) return;
  if (document.pointerLockElement !== renderer.domElement) {
    renderer.domElement.requestPointerLock();
  } else {
    shoot();
  }
});

document.addEventListener('pointerlockchange', () => {
  const locked = document.pointerLockElement === renderer.domElement;
  clickPrompt.classList.toggle('hidden', locked);
});

document.addEventListener('mousemove', (e) => {
  if (document.pointerLockElement !== renderer.domElement) return;
  yaw -= e.movementX * 0.0022;
  pitch -= e.movementY * 0.0022;
  pitch = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, pitch));
});

function reload() {
  isReloading = true;
  ammoText.textContent = 'Reloading...';
  setTimeout(() => {
    ammo = 12;
    isReloading = false;
    ammoText.textContent = `${ammo} / 12`;
  }, 1100);
}

function shoot() {
  if (isReloading || ammo <= 0 || !myPlayer || myPlayer.hp <= 0) return;
  ammo--;
  ammoText.textContent = `${ammo} / 12`;
  if (ammo === 0) reload();

  const dir = new THREE.Vector3(0, 0, -1).applyEuler(new THREE.Euler(pitch, yaw, 0, 'YXZ')).normalize();
  const origin = camera.position.clone().addScaledVector(dir, 0.8);

  spawnBullet(origin, dir, true);
  socket.emit('shoot', {
    origin: { x: origin.x, y: origin.y, z: origin.z },
    dir: { x: dir.x, y: dir.y, z: dir.z }
  });
}

function spawnBullet(origin, dir, isMine) {
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.14, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xffd740 })
  );
  mesh.position.set(origin.x, origin.y, origin.z);
  scene.add(mesh);

  bullets.push({
    mesh,
    dir: new THREE.Vector3(dir.x, dir.y, dir.z),
    isMine,
    life: 1.5
  });
}

function updateScoreboard() {
  const list = Object.values(allPlayers).sort((a, b) => b.kills - a.kills);
  scoreboard.innerHTML = list
    .map(
      (p) =>
        `<div class="score-row">
          <span style="color:${p.color}">● ${p.name}</span>
          <span>${p.kills} K / ${p.deaths} D</span>
        </div>`
    )
    .join('');
}

function addKillFeed(text) {
  const div = document.createElement('div');
  div.className = 'kill-msg';
  div.textContent = text;
  killFeed.appendChild(div);
  setTimeout(() => div.remove(), 4000);
}

// SOCKET EVENTS
socket.on('joinError', (msg) => {
  errorMsg.textContent = msg;
});

socket.on('roomJoined', ({ code, playerId, players, timeLeft }) => {
  myId = playerId;
  allPlayers = players;
  myPlayer = allPlayers[myId];
  gameActive = true;

  lobby.classList.add('hidden');
  hud.classList.remove('hidden');
  displayRoomCode.textContent = code;

  camera.position.set(myPlayer.x, myPlayer.y + 0.5, myPlayer.z);

  Object.values(players).forEach((p) => {
    if (p.id !== myId) {
      const mesh = createEggMesh(p.color);
      mesh.position.set(p.x, p.y, p.z);
      scene.add(mesh);
      remoteMeshes[p.id] = mesh;
    }
  });

  updateScoreboard();
});

socket.on('playerJoined', (player) => {
  allPlayers[player.id] = player;
  const mesh = createEggMesh(player.color);
  mesh.position.set(player.x, player.y, player.z);
  scene.add(mesh);
  remoteMeshes[player.id] = mesh;
  updateScoreboard();
  addKillFeed(`${player.name} joined the arena!`);
});

socket.on('playerMoved', ({ id, x, y, z, ry }) => {
  if (allPlayers[id]) {
    allPlayers[id].x = x;
    allPlayers[id].y = y;
    allPlayers[id].z = z;
  }
  if (remoteMeshes[id]) {
    remoteMeshes[id].position.set(x, y, z);
    remoteMeshes[id].rotation.y = ry;
  }
});

socket.on('playerShot', ({ origin, dir }) => {
  spawnBullet(origin, dir, false);
});

socket.on('playerDamaged', ({ targetId, hp }) => {
  if (allPlayers[targetId]) allPlayers[targetId].hp = hp;
  if (targetId === myId) {
    hpBar.style.width = `${hp}%`;
    hpText.textContent = hp;
  }
});

socket.on('playerKilled', ({ killerName, victimId, victimName, players }) => {
  allPlayers = players;
  updateScoreboard();
  addKillFeed(`${killerName} cracked ${victimName}!`);

  if (victimId === myId) {
    hpBar.style.width = '0%';
    hpText.textContent = '0';
  } else if (remoteMeshes[victimId]) {
    remoteMeshes[victimId].visible = false;
  }
});

socket.on('playerRespawned', (player) => {
  allPlayers[player.id] = player;
  if (player.id === myId) {
    myPlayer = player;
    camera.position.set(player.x, player.y + 0.5, player.z);
    hpBar.style.width = '100%';
    hpText.textContent = '100';
    ammo = 12;
    ammoText.textContent = '12 / 12';
  } else if (remoteMeshes[player.id]) {
    remoteMeshes[player.id].position.set(player.x, player.y, player.z);
    remoteMeshes[player.id].visible = true;
  }
});

socket.on('playerLeft', (id) => {
  if (allPlayers[id]) {
    addKillFeed(`${allPlayers[id].name} left.`);
    delete allPlayers[id];
  }
  if (remoteMeshes[id]) {
    scene.remove(remoteMeshes[id]);
    delete remoteMeshes[id];
  }
  updateScoreboard();
});

socket.on('timerUpdate', (seconds) => {
  const m = String(Math.floor(seconds / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  timerDisplay.textContent = `${m}:${s}`;
});

socket.on('matchOver', (playersList) => {
  document.exitPointerLock();
  const sorted = playersList.sort((a, b) => b.kills - a.kills);
  finalStandings.innerHTML = sorted
    .map((p, idx) => `<p style="margin:8px 0;font-size:1.1rem;">#${idx + 1} <b>${p.name}</b> — ${p.kills} Kills</p>`)
    .join('');
  matchOverModal.classList.remove('hidden');
});

socket.on('matchReset', (players) => {
  allPlayers = players;
  matchOverModal.classList.add('hidden');
  updateScoreboard();
  if (players[myId]) {
    const p = players[myId];
    camera.position.set(p.x, p.y + 0.5, p.z);
    hpBar.style.width = '100%';
    hpText.textContent = '100';
  }
});

// GAME LOOP
const clock = new THREE.Clock();

function checkCollision(x, z) {
  if (x < -33 || x > 33 || z < -33 || z > 33) return true;
  for (const box of obstacles) {
    if (x > box.minX - 0.7 && x < box.maxX + 0.7 && z > box.minZ - 0.7 && z < box.maxZ + 0.7) {
      return true;
    }
  }
  return false;
}

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.1);

  if (gameActive && myPlayer && myPlayer.hp > 0) {
    camera.rotation.order = 'YXZ';
    camera.rotation.y = yaw;
    camera.rotation.x = pitch;

    const speed = 11 * dt;
    const forward = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw));
    const right = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));
    let moveX = 0;
    let moveZ = 0;

    if (keys['KeyW']) { moveX += forward.x * speed; moveZ += forward.z * speed; }
    if (keys['KeyS']) { moveX -= forward.x * speed; moveZ -= forward.z * speed; }
    if (keys['KeyA']) { moveX -= right.x * speed; moveZ -= right.z * speed; }
    if (keys['KeyD']) { moveX += right.x * speed; moveZ += right.z * speed; }

    if (!checkCollision(camera.position.x + moveX, camera.position.z)) camera.position.x += moveX;
    if (!checkCollision(camera.position.x, camera.position.z + moveZ)) camera.position.z += moveZ;

    if (keys['Space'] && isGrounded) {
      velocityY = 9.5;
      isGrounded = false;
    }

    velocityY -= 24 * dt;
    camera.position.y += velocityY * dt;
    if (camera.position.y <= 2.0) {
      camera.position.y = 2.0;
      velocityY = 0;
      isGrounded = true;
    }

    socket.emit('move', {
      x: camera.position.x,
      y: camera.position.y - 0.5,
      z: camera.position.z,
      ry: yaw
    });
  }

  // Update Bullets & Hit Detection
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    b.mesh.position.addScaledVector(b.dir, 55 * dt);
    b.life -= dt;

    let hit = false;
    if (b.isMine) {
      for (const [id, mesh] of Object.entries(remoteMeshes)) {
        if (!mesh.visible) continue;
        if (b.mesh.position.distanceTo(mesh.position) < 1.25) {
          socket.emit('hitPlayer', { targetId: id, damage: 25 });
          hit = true;
          break;
        }
      }
    }

    if (hit || b.life <= 0 || checkCollision(b.mesh.position.x, b.mesh.position.z)) {
      scene.remove(b.mesh);
      bullets.splice(i, 1);
    }
  }

  renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
