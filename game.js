// EGG SHOCKERS 3D — 10 Complex Multi-Floor Maps + Destructible Cover + Ladders + Offline Bots & Game Code P2P

const PEER_PREFIX = 'eggshockers3d-v3-';

const WEAPONS = {
  eggk47:     { name: 'EggK-47 (Soldier)',   dmg: 28, rpm: 520, mag: 30, reserve: 120, spread: 0.022, auto: true,  pellets: 1, zoomFov: 58, projectile: false },
  scrambler:  { name: 'Dozen Gauge',         dmg: 18, rpm: 95,  mag: 2,  reserve: 24,  spread: 0.11,  auto: false, pellets: 8, zoomFov: 65, projectile: false },
  freeRanger: { name: 'CSG-1 Sniper',        dmg: 72, rpm: 140, mag: 5,  reserve: 25,  spread: 0.002, auto: false, pellets: 1, zoomFov: 26, projectile: false },
  rpegg:      { name: 'RPEGG Launcher',      dmg: 95, rpm: 55,  mag: 1,  reserve: 12,  spread: 0.01,  auto: false, pellets: 1, zoomFov: 55, projectile: true },
  whipper:    { name: 'SMEGG (Whipper)',     dmg: 19, rpm: 780, mag: 40, reserve: 160, spread: 0.042, auto: true,  pellets: 1, zoomFov: 60, projectile: false },
  crackshot:  { name: 'M24 Crackshot',       dmg: 105,rpm: 50,  mag: 1,  reserve: 15,  spread: 0.001, auto: false, pellets: 1, zoomFov: 22, projectile: false },
  triHard:    { name: 'Tri-Hard (Burst)',    dmg: 26, rpm: 460, mag: 24, reserve: 96,  spread: 0.014, auto: false, pellets: 1, zoomFov: 52, projectile: false },
  cluck9mm:   { name: 'Cluck 9mm (Pistol)',  dmg: 24, rpm: 400, mag: 12, reserve: 999, spread: 0.025, auto: false, pellets: 1, zoomFov: 62, projectile: false }
};

const MAP_CONFIGS = {
  coop:     { title: 'BLUE BARN COOP',       sky: 0x7dd3fc, fog: 0xbae6fd, fogDensity: 0.006, sunColor: 0xfffbeb, sunIntensity: 1.4,  hemiSky: 0xffffff, hemiGround: 0x3f6212, gravity: 28 },
  fort:     { title: 'FORT FLIP CASTLES',    sky: 0x38bdf8, fog: 0xe0f2fe, fogDensity: 0.006, sunColor: 0xfef9c3, sunIntensity: 1.5,  hemiSky: 0xffffff, hemiGround: 0x475569, gravity: 28 },
  village:  { title: 'CLUCKTOWN VILLAGE',    sky: 0xfdba74, fog: 0xffedd5, fogDensity: 0.0065,sunColor: 0xffedd5, sunIntensity: 1.45, hemiSky: 0xffedd5, hemiGround: 0x78350f, gravity: 28 },
  forest:   { title: 'SHELLWOOD FOREST',     sky: 0x86efac, fog: 0xdcfce7, fogDensity: 0.008, sunColor: 0xfefce8, sunIntensity: 1.3,  hemiSky: 0xecfdf5, hemiGround: 0x14532d, gravity: 28 },
  shipyard: { title: 'RUST SHIPYARD',        sky: 0xf97316, fog: 0xfed7aa, fogDensity: 0.007, sunColor: 0xffedd5, sunIntensity: 1.55, hemiSky: 0xffedd5, hemiGround: 0x1e293b, gravity: 28 },
  ruins:    { title: 'OVERGROWN RUINS',      sky: 0x6ee7b7, fog: 0xd1fae5, fogDensity: 0.007, sunColor: 0xfef08a, sunIntensity: 1.5,  hemiSky: 0xe0f2fe, hemiGround: 0x365314, gravity: 28 },
  moonbase: { title: 'LUNAR MOONBASE',       sky: 0x050811, fog: 0x090d1c, fogDensity: 0.005, sunColor: 0xf8fafc, sunIntensity: 1.75, hemiSky: 0x94a3b8, hemiGround: 0x0f172a, gravity: 15.5 },
  canyon:   { title: 'RED ROCK CANYON',      sky: 0xfb923c, fog: 0xfde68a, fogDensity: 0.0065,sunColor: 0xfef3c7, sunIntensity: 1.65, hemiSky: 0xfef3c7, hemiGround: 0x9a3412, gravity: 28 },
  facility: { title: 'CRYO LAB FACILITY',    sky: 0x0f172a, fog: 0x1e293b, fogDensity: 0.0075,sunColor: 0xe0f2fe, sunIntensity: 1.3,  hemiSky: 0x38bdf8, hemiGround: 0x0f172a, gravity: 28 },
  arena:    { title: 'EGGOSEUM COLOSSEUM',   sky: 0x60a5fa, fog: 0xbfdbfe, fogDensity: 0.0055,sunColor: 0xfef9c3, sunIntensity: 1.55, hemiSky: 0xeff6ff, hemiGround: 0x92400e, gravity: 28 }
};

const EGG_COLORS = [0xfef3c7, 0xfde047, 0x38bdf8, 0xf43f5e, 0x10b981, 0xa855f7, 0xf97316, 0x94a3b8];

// Session & Multiplayer State
let peer = null;
let myId = 'local_player';
let isHost = true;
let isOffline = true;
let hostConn = null;
let clientConns = new Map();

let selectedMap = 'coop';
let selectedTimeLimit = 180; // 3, 4, or 5 minutes in seconds
let matchTimeRemaining = 180;
let matchEnded = false;
let selectedClass = 'eggk47';
let currentWeaponKey = 'eggk47';
let usingPistol = false;
let ammoMag = 30;
let ammoReserve = 120;
let grenades = 2;
let goldenEggs = 0;
let isReloading = false;
let isScoped = false;
let fireCooldown = 0;
let mouseDown = false;

let player = {
  id: 'local_player',
  name: 'YolkSniper',
  x: 0, y: 1.8, z: 0,
  vx: 0, vy: 0, vz: 0,
  yaw: 0, pitch: 0,
  hp: 200,
  maxHp: 200,
  alive: true,
  kills: 0,
  color: 0xfef3c7
};

let remotePlayers = new Map();
let aiBots = [];
let rockets = [];
let thrownGrenades = [];
let ammoPickups = [];

// Rich 3D World Geometry Collections
let mapColliders = [];     // Solid walls, floors, roofs, trees, pillars
let ladderZones = [];      // { minX, maxX, minZ, maxZ, topY } -> Walk into ladder to climb!
let destructibles = [];    // { id, mesh, collider, hp, maxHp, kind } -> Shootable crates, glass, barrels, sandbags!
let mapSpawns = [];        // Safe ground & upper-floor spawn points
let debrisParticles = [];  // Shattered wood/glass/stone chunks when barriers break

const menuScreen = document.getElementById('menuScreen');
const lobbyScreen = document.getElementById('lobbyScreen');
const gameContainer = document.getElementById('gameContainer');
const lockPrompt = document.getElementById('lockPrompt');
const deathOverlay = document.getElementById('deathOverlay');
const menuError = document.getElementById('menuError');

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let c = '';
  for (let i = 0; i < 5; i++) c += chars[Math.floor(Math.random() * chars.length)];
  return c;
}

document.querySelectorAll('.class-card').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.class-card').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    selectedClass = btn.dataset.cls;
  });
});

// ==========================================
// 1. INSTANT OFFLINE MODE
// ==========================================
document.getElementById('offlineBtn').addEventListener('click', () => {
  isOffline = true;
  isHost = true;
  myId = 'local_player';
  selectedMap = document.getElementById('mapSelect').value;
  selectedTimeLimit = parseInt(document.getElementById('timeLimitSelect').value, 10) || 180;
  player.name = (document.getElementById('playerName').value.trim() || 'YolkSniper').slice(0, 14);
  player.kills = 0;
  goldenEggs = 0;

  const botCount = parseInt(document.getElementById('botCountSelect').value, 10);
  startArena('OFFLINE', selectedMap, botCount);
});

// ==========================================
// 2. HOST & JOIN ONLINE GAME CODE (STUN + TURN RELAYS + 1-CLICK LINK)
// ==========================================
const ICE_CONFIG = {
  debug: 1,
  pingInterval: 2500,
  config: {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun.relay.metered.ca:80' },
      {
        urls: 'turn:global.relay.metered.ca:80',
        username: 'e8dd65b92f62d3e36cafe502',
        credential: 'uWdWNcQs226269+6'
      },
      {
        urls: 'turn:global.relay.metered.ca:80?transport=tcp',
        username: 'e8dd65b92f62d3e36cafe502',
        credential: 'uWdWNcQs226269+6'
      },
      {
        urls: 'turn:global.relay.metered.ca:443',
        username: 'e8dd65b92f62d3e36cafe502',
        credential: 'uWdWNcQs226269+6'
      },
      {
        urls: 'turns:global.relay.metered.ca:443?transport=tcp',
        username: 'e8dd65b92f62d3e36cafe502',
        credential: 'uWdWNcQs226269+6'
      },
      {
        urls: 'turn:openrelay.metered.ca:80',
        username: 'openrelayproject',
        credential: 'openrelayproject'
      },
      {
        urls: 'turn:openrelay.metered.ca:443?transport=tcp',
        username: 'openrelayproject',
        credential: 'openrelayproject'
      }
    ],
    iceTransportPolicy: 'all',
    iceCandidatePoolSize: 12
  }
};

let matchStarted = false;

// Copy 1-Click Invite Link button in Lobby
document.getElementById('copyInviteBtn').addEventListener('click', () => {
  const code = document.getElementById('lobbyCode').textContent;
  const shareUrl = `${window.location.origin}${window.location.pathname}?join=${code}`;
  navigator.clipboard.writeText(shareUrl).then(() => {
    document.getElementById('copyFeedback').textContent = '✓ Invite link copied! Send it to your friends—they join automatically!';
  }).catch(() => {
    document.getElementById('copyFeedback').textContent = 'Share URL: ' + shareUrl;
  });
});

// Auto-fill and auto-join if friend opened an invite link (?join=XXXXX)
window.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const joinParam = (params.get('join') || '').trim().toUpperCase();
  if (joinParam.length === 5) {
    document.getElementById('codeInput').value = joinParam;
    setTimeout(() => document.getElementById('joinBtn').click(), 350);
  }
});

document.getElementById('hostBtn').addEventListener('click', () => {
  const name = (document.getElementById('playerName').value.trim() || 'HostEgg').slice(0, 14);
  selectedMap = document.getElementById('mapSelect').value;
  selectedTimeLimit = parseInt(document.getElementById('timeLimitSelect').value, 10) || 180;
  const code = generateCode();
  matchStarted = false;
  menuError.textContent = 'Registering Room Code on global relay...';

  if (peer) peer.destroy();
  peer = new Peer(PEER_PREFIX + code, ICE_CONFIG);

  setInterval(() => {
    if (peer && !peer.destroyed && peer.disconnected) peer.reconnect();
  }, 3500);

  peer.on('open', (id) => {
    myId = id;
    isHost = true;
    isOffline = false;
    player.id = myId;
    player.name = name;
    menuError.textContent = '';

    menuScreen.classList.add('hidden');
    lobbyScreen.classList.remove('hidden');
    document.getElementById('lobbyCode').textContent = code;
    document.getElementById('lobbyMapLabel').textContent = `MAP: ${MAP_CONFIGS[selectedMap].title} • ${Math.round(selectedTimeLimit / 60)} MIN`;
    renderLobby();
  });

  peer.on('connection', (conn) => {
    const setupConn = () => {
      clientConns.set(conn.peer, conn);
      conn.on('data', (msg) => {
        if (msg.type === 'hello') {
          remotePlayers.set(conn.peer, {
            id: conn.peer,
            name: msg.name || 'EggFriend',
            x: 12, y: 1.8, z: 12,
            yaw: 0, hp: 200, alive: true, kills: 0,
            color: EGG_COLORS[remotePlayers.size % EGG_COLORS.length]
          });
          renderLobby();
          broadcastLobby();

          // If host already started the match, drop the friend straight into the live 3D arena!
          if (matchStarted) {
            conn.send({ type: 'startGame', mapKey: selectedMap, timeLimit: selectedTimeLimit, timeRemaining: matchTimeRemaining });
          }
        } else if (msg.type === 'playerSync') {
          const rp = remotePlayers.get(conn.peer);
          if (rp) Object.assign(rp, msg.state);
          if (!isHost && typeof msg.state.timeRemaining === 'number') {
            matchTimeRemaining = Math.min(matchTimeRemaining, msg.state.timeRemaining);
          }
          broadcastToClients({ type: 'peerUpdate', id: conn.peer, state: msg.state }, conn.peer);
        } else if (msg.type === 'hitEvent') {
          if (msg.targetId === myId) {
            damageLocalPlayer(msg.dmg, msg.attackerName);
          } else {
            broadcastToClients(msg);
          }
        } else if (msg.type === 'destroyBarrier') {
          destroyBarrierById(msg.barrierId, false);
          broadcastToClients(msg, conn.peer);
        }
      });
    };

    if (conn.open) setupConn();
    else conn.on('open', setupConn);

    conn.on('close', () => {
      clientConns.delete(conn.peer);
      remotePlayers.delete(conn.peer);
      renderLobby();
    });
  });

  peer.on('error', (err) => {
    menuError.textContent = 'Host relay error: ' + err.type;
  });
});

document.getElementById('joinBtn').addEventListener('click', () => {
  const name = (document.getElementById('playerName').value.trim() || 'EggJoiner').slice(0, 14);
  const code = document.getElementById('codeInput').value.trim().toUpperCase();
  if (code.length !== 5) {
    menuError.textContent = 'Enter a 5-character Game Code.';
    return;
  }

  menuError.textContent = 'Step 1/2: Connecting to signaling relay...';
  if (peer) peer.destroy();
  peer = new Peer(ICE_CONFIG);
  let connectedToHost = false;

  peer.on('error', (err) => {
    if (err.type === 'peer-unavailable') {
      menuError.textContent = `Code "${code}" not found. Ask host to click "Host Game Code" first!`;
    } else {
      menuError.textContent = `Relay error (${err.type}). Retrying...`;
    }
  });

  peer.on('open', (id) => {
    myId = id;
    isHost = false;
    isOffline = false;
    player.id = myId;
    player.name = name;

    let attempt = 1;
    const connectAttempt = () => {
      if (connectedToHost || peer.destroyed) return;
      menuError.textContent = `Step 2/2: Connecting to Room ${code} via Global Relay (Attempt ${attempt}/3)...`;
      if (hostConn) { try { hostConn.close(); } catch (e) {} }
      hostConn = peer.connect(PEER_PREFIX + code, { serialization: 'json' });
      hostConn.on('open', onHostConnected);
      bindHostData(hostConn);
    };

    connectAttempt();

    const handshakeRetry = setInterval(() => {
      if (connectedToHost) {
        clearInterval(handshakeRetry);
        return;
      }
      if (hostConn && hostConn.open) {
        onHostConnected();
        return;
      }
      attempt++;
      if (attempt <= 3 && attempt % 1 === 0) {
        connectAttempt();
      }
    }, 5000);

    const failTimeout = setTimeout(() => {
      clearInterval(handshakeRetry);
      if (!connectedToHost) {
        menuError.textContent = `Could not reach ${code}. Make sure Host clicked "Host Game Code" and kept the browser open.`;
      }
    }, 18000);

    function onHostConnected() {
      if (connectedToHost) return;
      connectedToHost = true;
      clearTimeout(failTimeout);
      clearInterval(handshakeRetry);
      menuError.textContent = '';
      hostConn.send({ type: 'hello', name });
      menuScreen.classList.add('hidden');
      lobbyScreen.classList.remove('hidden');
      document.getElementById('lobbyCode').textContent = code;
    }

    function bindHostData(conn) {
      conn.on('data', (msg) => {
        if (msg.type === 'lobbySync') {
          selectedMap = msg.mapKey || 'coop';
          document.getElementById('lobbyMapLabel').textContent = `MAP: ${MAP_CONFIGS[selectedMap].title} • ${Math.round(selectedTimeLimit / 60)} MIN`;
          remotePlayers.clear();
          msg.players.forEach(p => {
            if (p.id !== myId) remotePlayers.set(p.id, p);
          });
          renderLobby();
        } else if (msg.type === 'startGame') {
          selectedMap = msg.mapKey || selectedMap;
          if (msg.timeLimit) selectedTimeLimit = msg.timeLimit;
          startArena(code, selectedMap, 0, msg.timeRemaining);
        } else if (msg.type === 'peerUpdate') {
          if (msg.id !== myId) {
            let rp = remotePlayers.get(msg.id);
            if (!rp) {
              rp = { id: msg.id, color: 0x38bdf8 };
              remotePlayers.set(msg.id, rp);
            }
            Object.assign(rp, msg.state);
          if (!isHost && typeof msg.state.timeRemaining === 'number') {
            matchTimeRemaining = Math.min(matchTimeRemaining, msg.state.timeRemaining);
          }
          }
        } else if (msg.type === 'hitEvent' && msg.targetId === myId) {
          const wasAlive = player.alive;
          damageLocalPlayer(msg.dmg, msg.attackerName);
          if (wasAlive && !player.alive && msg.attackerId) {
            const killerPeer = remotePlayers.get(msg.attackerId);
            if (killerPeer) killerPeer.kills = (killerPeer.kills || 0) + 1;
            updateHud();
          }
        } else if (msg.type === 'destroyBarrier') {
          destroyBarrierById(msg.barrierId, false);
        }
      });

      conn.on('close', () => {
        if (connectedToHost) {
          alert('Host closed the room.');
          location.href = window.location.pathname;
        }
      });
    }
  });
});

function broadcastToClients(payload, excludeId = null) {
  for (const [id, conn] of clientConns.entries()) {
    if (id !== excludeId && conn.open) conn.send(payload);
  }
}

function broadcastLobby() {
  const all = [
    { id: myId, name: player.name, color: player.color },
    ...Array.from(remotePlayers.values())
  ];
  broadcastToClients({ type: 'lobbySync', mapKey: selectedMap, timeLimit: selectedTimeLimit, players: all });
}

function renderLobby() {
  const all = [
    { id: myId, name: player.name },
    ...Array.from(remotePlayers.values())
  ];
  document.getElementById('lobbyCount').textContent = `${all.length} / 8 Eggs`;
  document.getElementById('startNetBtn').classList.toggle('hidden', !isHost);
  document.getElementById('lobbyList').innerHTML = all.map((p, i) => `
    <div class="player-row">
      <span>🥚 #${i + 1} ${p.name}</span>
      <span>${i === 0 ? 'HOST' : 'READY'}</span>
    </div>
  `).join('');
}

document.getElementById('startNetBtn').addEventListener('click', () => {
  if (!isHost) return;
  matchStarted = true;
  const code = document.getElementById('lobbyCode').textContent;
  const botCount = parseInt(document.getElementById('botCountSelect').value, 10);
  broadcastToClients({ type: 'startGame', mapKey: selectedMap, timeLimit: selectedTimeLimit, timeRemaining: matchTimeRemaining });
  startArena(code, selectedMap, botCount);
});

document.getElementById('leaveLobbyBtn').addEventListener('click', () => location.reload());

// ==========================================
// ARENA START, WEAPONS & SPAWNING
// ==========================================
function equipClass(clsKey) {
  selectedClass = clsKey;
  currentWeaponKey = clsKey;
  usingPistol = false;
  const w = WEAPONS[clsKey];
  ammoMag = w.mag;
  ammoReserve = w.reserve;
  grenades = 2;
  isReloading = false;
  setScope(false);
  updateWeaponMesh();
  updateHud();
}

function startArena(roomTag, mapKey, botCount, initialTimeRemaining = null) {
  selectedMap = MAP_CONFIGS[mapKey] ? mapKey : 'coop';
  const mCfg = MAP_CONFIGS[selectedMap];
  matchEnded = false;
  matchTimeRemaining = initialTimeRemaining !== null ? initialTimeRemaining : selectedTimeLimit;
  player.kills = 0;

  menuScreen.classList.add('hidden');
  lobbyScreen.classList.add('hidden');
  document.getElementById('matchOverOverlay').classList.add('hidden');
  gameContainer.classList.remove('hidden');
  document.getElementById('hudRoomTag').textContent =
    (roomTag === 'OFFLINE' ? 'OFFLINE' : `CODE: ${roomTag}`) + ` • ${mCfg.title}`;

  initThreeFPS(selectedMap);
  equipClass(selectedClass);
  spawnLocalPlayer();

  aiBots = [];
  const botNames = ['Benedict', 'Scramble', 'Omelette', 'Poacher', 'OverEasy', 'SunnySide', 'HardBoiled'];
  const clsKeys = Object.keys(WEAPONS).filter(k => k !== 'cluck9mm');
  for (let i = 0; i < botCount; i++) {
    const sp = getRandomSpawn();
    aiBots.push({
      id: 'bot_' + i,
      name: botNames[i % botNames.length] + ' [AI]',
      cls: clsKeys[i % clsKeys.length],
      x: sp.x, y: sp.y, z: sp.z,
      vy: 0,
      yaw: Math.random() * Math.PI * 2,
      hp: 200,
      alive: true,
      kills: 0,
      shootTimer: 1.2 + Math.random(),
      color: EGG_COLORS[(i + 1) % EGG_COLORS.length]
    });
  }

  spawnPickups();
  updateHud();
}

function getRandomSpawn() {
  if (mapSpawns.length === 0) return { x: 0, y: 1.8, z: 0 };
  return mapSpawns[Math.floor(Math.random() * mapSpawns.length)];
}

function spawnLocalPlayer() {
  const sp = getRandomSpawn();
  player.x = sp.x;
  player.y = sp.y;
  player.z = sp.z;
  player.vx = 0;
  player.vy = 0;
  player.vz = 0;
  player.hp = 200;
  player.alive = true;
  deathOverlay.classList.add('hidden');
  updateHud();
}

document.getElementById('respawnBtn').addEventListener('click', () => {
  const chosen = document.getElementById('respawnClassSelect').value;
  equipClass(chosen);
  spawnLocalPlayer();
  renderer.domElement.requestPointerLock();
});

// ==========================================
// POINTER LOCK & FPS CONTROLS
// ==========================================
const keys = { w: false, a: false, s: false, d: false, space: false };

lockPrompt.addEventListener('click', () => {
  renderer.domElement.requestPointerLock();
});

document.addEventListener('pointerlockchange', () => {
  const locked = document.pointerLockElement === renderer.domElement;
  lockPrompt.classList.toggle('hidden', locked || !player.alive);
});

document.addEventListener('mousemove', (e) => {
  if (document.pointerLockElement !== renderer.domElement || !player.alive) return;
  const sens = isScoped ? 0.0009 : 0.0022;
  player.yaw -= e.movementX * sens;
  player.pitch -= e.movementY * sens;
  player.pitch = Math.max(-1.45, Math.min(1.45, player.pitch));
});

window.addEventListener('mousedown', (e) => {
  if (document.pointerLockElement !== renderer.domElement || !player.alive) return;
  if (e.button === 0) {
    mouseDown = true;
    tryFireWeapon();
  } else if (e.button === 2) {
    setScope(!isScoped);
  }
});

window.addEventListener('mouseup', (e) => {
  if (e.button === 0) mouseDown = false;
});

window.addEventListener('contextmenu', (e) => e.preventDefault());

window.addEventListener('keydown', (e) => {
  if (document.activeElement.tagName === 'INPUT') return;
  if (e.code === 'KeyW') keys.w = true;
  if (e.code === 'KeyA') keys.a = true;
  if (e.code === 'KeyS') keys.s = true;
  if (e.code === 'KeyD') keys.d = true;
  if (e.code === 'Space') keys.space = true;
  if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') setScope(!isScoped);
  if (e.code === 'KeyR') reloadWeapon();
  if (e.code === 'KeyQ') throwGrenade();
  if (e.code === 'KeyE') swapPistol();
});

window.addEventListener('keyup', (e) => {
  if (e.code === 'KeyW') keys.w = false;
  if (e.code === 'KeyA') keys.a = false;
  if (e.code === 'KeyS') keys.s = false;
  if (e.code === 'KeyD') keys.d = false;
  if (e.code === 'Space') keys.space = false;
});

function setScope(active) {
  isScoped = active;
  const w = WEAPONS[currentWeaponKey];
  document.getElementById('scopeOverlay').classList.toggle('hidden', !active || w.zoomFov > 40);
  if (camera) {
    camera.fov = active ? w.zoomFov : 75;
    camera.updateProjectionMatrix();
  }
  if (viewWeaponGroup) viewWeaponGroup.visible = !(active && w.zoomFov <= 40);
}

function swapPistol() {
  if (isReloading) return;
  usingPistol = !usingPistol;
  currentWeaponKey = usingPistol ? 'cluck9mm' : selectedClass;
  const w = WEAPONS[currentWeaponKey];
  ammoMag = w.mag;
  ammoReserve = w.reserve;
  setScope(false);
  updateWeaponMesh();
  updateHud();
}

function reloadWeapon() {
  const w = WEAPONS[currentWeaponKey];
  if (isReloading || ammoMag === w.mag || ammoReserve <= 0) return;
  isReloading = true;
  setScope(false);
  document.getElementById('hudAmmo').textContent = 'RELOADING...';
  setTimeout(() => {
    const needed = w.mag - ammoMag;
    const take = Math.min(needed, ammoReserve);
    ammoMag += take;
    ammoReserve -= take;
    isReloading = false;
    updateHud();
  }, 1150);
}

function throwGrenade() {
  if (!player.alive || grenades <= 0) return;
  grenades--;
  updateHud();

  const dir = new THREE.Vector3(0, 0, -1).applyEuler(new THREE.Euler(player.pitch, player.yaw, 0, 'YXZ'));
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.24, 14, 14),
    new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.3, metalness: 0.6 })
  );
  mesh.scale.set(0.85, 1.15, 0.85);
  mesh.position.set(player.x + dir.x * 1.1, player.y + 0.3, player.z + dir.z * 1.1);
  scene.add(mesh);

  thrownGrenades.push({
    mesh,
    vx: dir.x * 24,
    vy: dir.y * 24 + 5,
    vz: dir.z * 24,
    fuse: 2.3
  });
}

// ==========================================
// WEAPON FIRING, WALL OCCLUSION & DESTRUCTIBLE BARRIERS
// ==========================================
function rayIntersectAABB(origin, dir, box, maxDist) {
  let tmin = 0;
  let tmax = maxDist;
  const axes = [
    ['x', 'minX', 'maxX'],
    ['y', 'minY', 'maxY'],
    ['z', 'minZ', 'maxZ']
  ];
  for (const [axis, minK, maxK] of axes) {
    if (Math.abs(dir[axis]) < 1e-6) {
      if (origin[axis] < box[minK] || origin[axis] > box[maxK]) return null;
    } else {
      const invD = 1 / dir[axis];
      let t1 = (box[minK] - origin[axis]) * invD;
      let t2 = (box[maxK] - origin[axis]) * invD;
      if (t1 > t2) [t1, t2] = [t2, t1];
      tmin = Math.max(tmin, t1);
      tmax = Math.min(tmax, t2);
      if (tmin > tmax) return null;
    }
  }
  return tmin;
}

function tryFireWeapon() {
  if (!player.alive || isReloading || fireCooldown > 0) return;
  const w = WEAPONS[currentWeaponKey];
  if (ammoMag <= 0) {
    reloadWeapon();
    return;
  }

  ammoMag--;
  fireCooldown = 60 / w.rpm;
  updateHud();

  if (viewWeaponGroup) viewWeaponGroup.position.z = 0.22;
  player.pitch = Math.min(1.45, player.pitch + 0.015);

  const origin = new THREE.Vector3(player.x, player.y + 0.35, player.z);
  const baseEuler = new THREE.Euler(player.pitch, player.yaw, 0, 'YXZ');

  if (w.projectile) {
    const dir = new THREE.Vector3(0, 0, -1).applyEuler(baseEuler);
    const rMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.16, 0.9, 10),
      new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xf97316, emissiveIntensity: 0.8 })
    );
    rMesh.position.copy(origin).addScaledVector(dir, 1.5);
    rMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    scene.add(rMesh);
    rockets.push({ mesh: rMesh, dir, speed: 46, ttl: 3.0 });
    return;
  }

  for (let p = 0; p < w.pellets; p++) {
    const sp = isScoped ? w.spread * 0.25 : w.spread;
    const shotEuler = new THREE.Euler(
      player.pitch + (Math.random() - 0.5) * sp,
      player.yaw + (Math.random() - 0.5) * sp,
      0,
      'YXZ'
    );
    const dir = new THREE.Vector3(0, 0, -1).applyEuler(shotEuler).normalize();
    checkHitscanWithWallsAndCover(origin, dir, w.dmg);
  }
}

function checkHitscanWithWallsAndCover(origin, dir, baseDmg) {
  let maxDist = 140;

  // 1. Check solid walls/houses/trees so bullets cannot shoot through walls!
  for (const box of mapColliders) {
    if (box.isDestructible) continue;
    const hitT = rayIntersectAABB(origin, dir, box, maxDist);
    if (hitT !== null && hitT < maxDist) {
      maxDist = hitT;
    }
  }

  // 2. Check Destructible Barriers (Crates, Glass, Barrels, Sandbags)
  let hitBarrier = null;
  for (const d of destructibles) {
    if (d.hp <= 0) continue;
    const hitT = rayIntersectAABB(origin, dir, d.collider, maxDist);
    if (hitT !== null && hitT < maxDist) {
      maxDist = hitT;
      hitBarrier = d;
    }
  }

  // 3. Check AI Bots + Remote Players before the nearest wall/barrier
  let hitTarget = null;
  let isHeadshot = false;
  const candidates = [...aiBots, ...Array.from(remotePlayers.values())];
  for (const target of candidates) {
    if (!target.alive) continue;
    const toTarget = new THREE.Vector3(target.x - origin.x, target.y - origin.y, target.z - origin.z);
    const proj = toTarget.dot(dir);
    if (proj < 0 || proj > maxDist) continue;

    const closestPt = origin.clone().addScaledVector(dir, proj);
    const horizDist = Math.hypot(closestPt.x - target.x, closestPt.z - target.z);
    const vertDiff = closestPt.y - target.y;

    if (horizDist < 0.88 && vertDiff > -1.2 && vertDiff < 1.15) {
      maxDist = proj;
      hitTarget = target;
      hitBarrier = null;
      isHeadshot = vertDiff > 0.35;
    }
  }

  spawnBulletTracer(origin, dir, maxDist);

  if (hitBarrier) {
    showHitmarker();
    damageDestructible(hitBarrier, baseDmg);
    return;
  }

  if (hitTarget) {
    const finalDmg = Math.round(baseDmg * (isHeadshot ? 1.45 : 1.0));
    showHitmarker();
    spawnYolkParticles(hitTarget.x, hitTarget.y + 0.2, hitTarget.z);

    if (hitTarget.id.startsWith('bot_')) {
      hitTarget.hp -= finalDmg;
      if (hitTarget.hp <= 0 && hitTarget.alive) {
        hitTarget.alive = false;
        player.kills++;
        goldenEggs += 3;
        addKillFeed(`${player.name} 🍳 ${hitTarget.name}`);
        updateHud();
        setTimeout(() => {
          const sp = getRandomSpawn();
          hitTarget.x = sp.x; hitTarget.y = sp.y; hitTarget.z = sp.z; hitTarget.hp = 200; hitTarget.alive = true;
        }, 3000);
      }
    } else {
      const payload = { type: 'hitEvent', targetId: hitTarget.id, dmg: finalDmg, attackerId: myId, attackerName: player.name };
      if (isHost) broadcastToClients(payload);
      else if (hostConn && hostConn.open) hostConn.send(payload);
    }
  }
}

function damageDestructible(barrier, dmg) {
  barrier.hp -= dmg;
  // Visual crack/darken feedback on damaged barrier
  if (barrier.hp > 0) {
    const ratio = Math.max(0.25, barrier.hp / barrier.maxHp);
    barrier.mesh.scale.set(0.95 + ratio * 0.05, 0.95 + ratio * 0.05, 0.95 + ratio * 0.05);
    return;
  }
  destroyBarrierById(barrier.id, true);
}

function destroyBarrierById(id, broadcastEvent = true) {
  const idx = destructibles.findIndex(d => d.id === id);
  if (idx === -1) return;
  const d = destructibles[idx];
  destructibles.splice(idx, 1);

  // Remove collider so players & bullets can now pass through the breached barrier!
  const cIdx = mapColliders.indexOf(d.collider);
  if (cIdx !== -1) mapColliders.splice(cIdx, 1);

  const pos = d.mesh.position.clone();
  worldGroup.remove(d.mesh);

  // Spawn flying shattered debris chunks
  const color = d.kind === 'explosiveBarrel' ? 0xef4444 : d.kind === 'glass' ? 0x38bdf8 : 0xb45309;
  for (let i = 0; i < 12; i++) {
    const chunk = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 0.28, 0.28),
      new THREE.MeshStandardMaterial({ color, roughness: 0.6 })
    );
    chunk.position.copy(pos).add(new THREE.Vector3((Math.random() - 0.5) * 1.4, (Math.random() - 0.5) * 1.4, (Math.random() - 0.5) * 1.4));
    scene.add(chunk);
    debrisParticles.push({
      mesh: chunk,
      vx: (Math.random() - 0.5) * 12,
      vy: Math.random() * 8 + 3,
      vz: (Math.random() - 0.5) * 12,
      ttl: 0.75
    });
  }

  // Red Explosive Barrels detonate and damage nearby eggs & chain-destroy adjacent cover!
  if (d.kind === 'explosiveBarrel') {
    explodeAt(pos, 9.5, 110);
  }

  if (broadcastEvent && !isOffline) {
    const msg = { type: 'destroyBarrier', barrierId: id };
    if (isHost) broadcastToClients(msg);
    else if (hostConn && hostConn.open) hostConn.send(msg);
  }
}

function damageLocalPlayer(amount, attackerName) {
  if (!player.alive) return;
  player.hp = Math.max(0, player.hp - amount);
  const flash = document.getElementById('yolkFlash');
  flash.style.opacity = '1';
  setTimeout(() => { flash.style.opacity = '0'; }, 180);
  updateHud();

  if (player.hp <= 0) {
    player.alive = false;
    setScope(false);
    document.exitPointerLock();
    document.getElementById('killerLabel').textContent = `Scrambled by ${attackerName}`;
    deathOverlay.classList.remove('hidden');
    addKillFeed(`${attackerName} 🍳 ${player.name}`);
  }
}

function showHitmarker() {
  const hm = document.getElementById('hitmarker');
  hm.classList.remove('hidden');
  setTimeout(() => hm.classList.add('hidden'), 120);
}

function addKillFeed(text) {
  const feed = document.getElementById('killFeed');
  const div = document.createElement('div');
  div.className = 'kf-item';
  div.textContent = text;
  feed.prepend(div);
  setTimeout(() => div.remove(), 4000);
}

function formatMatchClock(sec) {
  const s = Math.max(0, Math.ceil(sec));
  const mins = Math.floor(s / 60);
  const rem = s % 60;
  return `${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
}

function endMatchAndShowPodium() {
  if (matchEnded) return;
  matchEnded = true;
  mouseDown = false;
  setScope(false);
  if (document.pointerLockElement) document.exitPointerLock();

  deathOverlay.classList.add('hidden');
  lockPrompt.classList.add('hidden');

  // Gather ALL participants (local player, online friends, and AI bots) with accumulated kills
  const allStandings = [
    { id: myId, name: `${player.name} (YOU)`, kills: player.kills },
    ...Array.from(remotePlayers.values()).map(r => ({
      id: r.id,
      name: r.name || 'Friend',
      kills: r.kills || 0
    })),
    ...aiBots.map(b => ({
      id: b.id,
      name: b.name,
      kills: b.kills || 0
    }))
  ].sort((a, b) => b.kills - a.kills);

  const champion = allStandings[0] || { name: player.name, kills: player.kills };
  document.getElementById('matchWinnerHeadline').textContent = `🏆 #1 ${champion.name} WINS!`;
  document.getElementById('matchWinnerSub').textContent = `Champion with ${champion.kills} Total Eliminations`;

  const listEl = document.getElementById('finalRankingsList');
  listEl.innerHTML = allStandings.map((entry, idx) => {
    const place = idx + 1;
    const medal = place === 1 ? '🥇' : place === 2 ? '🥈' : place === 3 ? '🥉' : `#${place}`;
    const cls = place === 1 ? 'first-place' : place === 2 ? 'second-place' : place === 3 ? 'third-place' : '';
    return `
      <div class="rank-row ${cls}">
        <span>${medal} &nbsp; ${entry.name}</span>
        <span>${entry.kills} KILLS</span>
      </div>
    `;
  }).join('');

  document.getElementById('matchOverOverlay').classList.remove('hidden');
}

document.getElementById('playAgainBtn').addEventListener('click', () => {
  const botCount = parseInt(document.getElementById('botCountSelect').value, 10);
  if (isOffline) {
    startArena('OFFLINE', selectedMap, botCount);
  } else if (isHost) {
    const code = document.getElementById('lobbyCode').textContent;
    broadcastToClients({ type: 'startGame', mapKey: selectedMap, timeLimit: selectedTimeLimit, timeRemaining: selectedTimeLimit });
    startArena(code, selectedMap, botCount);
  } else {
    document.getElementById('matchOverOverlay').classList.add('hidden');
  }
});

document.getElementById('returnMenuBtn').addEventListener('click', () => {
  location.href = window.location.pathname;
});

function updateHud() {
  document.getElementById('hudHp').textContent = `${Math.max(0, Math.round(player.hp))} / 200 HP`;
  document.getElementById('hudHpBar').style.width = `${Math.max(0, (player.hp / 200) * 100)}%`;
  document.getElementById('hudEggIcon').textContent = player.hp > 90 ? '🥚' : '🐣';
  document.getElementById('hudGolden').textContent = `🪙 ${goldenEggs} GOLDEN EGGS`;
  document.getElementById('hudGrenades').textContent = `💣 x${grenades} [Q]`;

  const w = WEAPONS[currentWeaponKey];
  document.getElementById('hudWepName').textContent = w.name;
  if (!isReloading) {
    document.getElementById('hudAmmo').textContent = `${ammoMag} / ${ammoReserve}`;
  }

  const board = [
    { name: player.name, kills: player.kills },
    ...aiBots.map(b => ({ name: b.name, kills: b.kills })),
    ...Array.from(remotePlayers.values()).map(r => ({ name: r.name, kills: r.kills || 0 }))
  ].sort((a, b) => b.kills - a.kills);

  document.getElementById('hudScoreboard').innerHTML = board.map((r, i) => `
    <div class="sb-row">
      <span>#${i + 1} ${r.name}</span>
      <span style="color:#fde047">${r.kills} KILLS</span>
    </div>
  `).join('');
}

// ==========================================
// PROCEDURAL PBR TEXTURES & NORMAL BUMP MAPS
// ==========================================
function generatePBRMaterialSet(theme, repeatX = 4, repeatY = 4, roughnessVal = 0.68, metalnessVal = 0.12) {
  const size = 256;
  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = size; colorCanvas.height = size;
  const cCtx = colorCanvas.getContext('2d');

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size; bumpCanvas.height = size;
  const bCtx = bumpCanvas.getContext('2d');
  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, size, size);

  if (theme === 'grass') {
    cCtx.fillStyle = '#3f6212';
    cCtx.fillRect(0, 0, size, size);
    for (let i = 0; i < 6000; i++) {
      const x = Math.random() * size, y = Math.random() * size;
      const g = 75 + Math.floor(Math.random() * 55);
      cCtx.fillStyle = `rgb(${Math.floor(g * 0.55)}, ${g}, 18)`;
      cCtx.fillRect(x, y, 2, 4);
      const b = 110 + Math.floor(Math.random() * 60);
      bCtx.fillStyle = `rgb(${b},${b},${b})`;
      bCtx.fillRect(x, y, 2, 3);
    }
  } else if (theme === 'barnWood' || theme === 'plankWood') {
    cCtx.fillStyle = theme === 'barnWood' ? '#991b1b' : '#92400e';
    cCtx.fillRect(0, 0, size, size);
    for (let y = 0; y < size; y += 32) {
      cCtx.fillStyle = '#290d05';
      cCtx.fillRect(0, y, size, 3);
      bCtx.fillStyle = '#222222';
      bCtx.fillRect(0, y, size, 3);
      for (let g = 0; g < 35; g++) {
        cCtx.fillStyle = 'rgba(255,220,200,0.07)';
        cCtx.fillRect(0, y + 4 + Math.random() * 26, size, 1);
      }
    }
  } else if (theme === 'hay') {
    cCtx.fillStyle = '#ca8a04';
    cCtx.fillRect(0, 0, size, size);
    for (let i = 0; i < 2400; i++) {
      const x = Math.random() * size, y = Math.random() * size;
      cCtx.strokeStyle = Math.random() > 0.4 ? '#eab308' : '#854d0e';
      cCtx.lineWidth = 1.5;
      cCtx.beginPath();
      cCtx.moveTo(x, y);
      cCtx.lineTo(x + (Math.random() - 0.5) * 18, y + (Math.random() - 0.5) * 18);
      cCtx.stroke();
      bCtx.fillStyle = '#d4d4d4';
      bCtx.fillRect(x, y, 3, 2);
    }
  } else if (theme === 'castleStone' || theme === 'marble') {
    cCtx.fillStyle = theme === 'castleStone' ? '#475569' : '#e2e8f0';
    cCtx.fillRect(0, 0, size, size);
    for (let y = 0; y < size; y += 32) {
      const off = (y / 32) % 2 === 0 ? 0 : 32;
      for (let x = -32; x < size; x += 64) {
        const base = theme === 'castleStone' ? 68 : 210;
        const v = base + Math.floor(Math.random() * 28);
        cCtx.fillStyle = `rgb(${v}, ${v + 4}, ${v + 10})`;
        cCtx.fillRect(x + off + 2, y + 2, 60, 28);
        bCtx.fillStyle = '#c8c8c8';
        bCtx.fillRect(x + off + 2, y + 2, 60, 28);
      }
    }
  } else if (theme === 'rustSteel' || theme === 'containerBlue' || theme === 'containerRed') {
    cCtx.fillStyle = theme === 'containerBlue' ? '#1d4ed8' : theme === 'containerRed' ? '#b91c1c' : '#334155';
    cCtx.fillRect(0, 0, size, size);
    for (let x = 0; x < size; x += 16) {
      cCtx.fillStyle = (x / 16) % 2 === 0 ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.24)';
      cCtx.fillRect(x, 0, 8, size);
      bCtx.fillStyle = (x / 16) % 2 === 0 ? '#dcdcdc' : '#3a3a3a';
      bCtx.fillRect(x, 0, 8, size);
    }
  } else if (theme === 'moonRegolith') {
    cCtx.fillStyle = '#475569';
    cCtx.fillRect(0, 0, size, size);
    for (let i = 0; i < 4500; i++) {
      const s = 55 + Math.floor(Math.random() * 45);
      cCtx.fillStyle = `rgb(${s},${s + 3},${s + 8})`;
      cCtx.fillRect(Math.random() * size, Math.random() * size, 2, 2);
    }
    for (let c = 0; c < 14; c++) {
      const cx = Math.random() * size, cy = Math.random() * size, cr = 8 + Math.random() * 18;
      cCtx.strokeStyle = 'rgba(203, 213, 225, 0.35)';
      cCtx.lineWidth = 3;
      cCtx.beginPath(); cCtx.arc(cx, cy, cr, 0, Math.PI * 2); cCtx.stroke();
      bCtx.strokeStyle = '#ffffff';
      bCtx.lineWidth = 3;
      bCtx.beginPath(); bCtx.arc(cx, cy, cr, 0, Math.PI * 2); bCtx.stroke();
    }
  } else if (theme === 'sandstone' || theme === 'redRock') {
    cCtx.fillStyle = theme === 'sandstone' ? '#d97706' : '#9a3412';
    cCtx.fillRect(0, 0, size, size);
    for (let y = 0; y < size; y += 24) {
      const v = (theme === 'sandstone' ? 185 : 145) + Math.floor(Math.random() * 35);
      cCtx.fillStyle = `rgb(${v}, ${Math.floor(v * 0.62)}, ${Math.floor(v * 0.28)})`;
      cCtx.fillRect(0, y, size, 20);
      bCtx.fillStyle = '#c4c4c4';
      bCtx.fillRect(0, y, size, 20);
    }
  } else {
    cCtx.fillStyle = '#1e293b';
    cCtx.fillRect(0, 0, size, size);
    for (let y = 0; y < size; y += 64) {
      for (let x = 0; x < size; x += 64) {
        cCtx.strokeStyle = '#38bdf8';
        cCtx.lineWidth = 2;
        cCtx.strokeRect(x + 2, y + 2, 60, 60);
        bCtx.fillStyle = '#b8b8b8';
        bCtx.fillRect(x + 4, y + 4, 56, 56);
      }
    }
  }

  const colorTex = new THREE.CanvasTexture(colorCanvas);
  colorTex.wrapS = THREE.RepeatWrapping;
  colorTex.wrapT = THREE.RepeatWrapping;
  colorTex.repeat.set(repeatX, repeatY);

  const bumpTex = new THREE.CanvasTexture(bumpCanvas);
  bumpTex.wrapS = THREE.RepeatWrapping;
  bumpTex.wrapT = THREE.RepeatWrapping;
  bumpTex.repeat.set(repeatX, repeatY);

  return new THREE.MeshStandardMaterial({
    map: colorTex,
    bumpMap: bumpTex,
    bumpScale: 0.14,
    roughness: roughnessVal,
    metalness: metalnessVal
  });
}

// ==========================================
// 3D WORLD & ARCHITECTURAL BUILDING KIT (HOUSES, LADDERS, TREES, DESTRUCTIBLES)
// ==========================================
let scene, camera, renderer;
let worldGroup = null;
let viewWeaponGroup = null;
let eggMeshes = new Map();
let tracers = [];
let yolkParticles = [];
let hemiLight, sunLight;

function initThreeFPS(mapKey) {
  const mount = document.getElementById('threeMount');
  const mCfg = MAP_CONFIGS[mapKey];

  if (!renderer) {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 450);
    scene.add(camera);

    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    mount.appendChild(renderer.domElement);

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    hemiLight = new THREE.HemisphereLight(mCfg.hemiSky, mCfg.hemiGround, 0.78);
    scene.add(hemiLight);

    sunLight = new THREE.DirectionalLight(mCfg.sunColor, mCfg.sunIntensity);
    sunLight.position.set(42, 68, 32);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.left = -54;
    sunLight.shadow.camera.right = 54;
    sunLight.shadow.camera.top = 54;
    sunLight.shadow.camera.bottom = -54;
    scene.add(sunLight);

    viewWeaponGroup = new THREE.Group();
    viewWeaponGroup.position.set(0.32, -0.28, -0.55);
    camera.add(viewWeaponGroup);
    updateWeaponMesh();

    requestAnimationFrame(fpsGameLoop);
  }

  scene.background = new THREE.Color(mCfg.sky);
  scene.fog = new THREE.FogExp2(mCfg.fog, mCfg.fogDensity);
  hemiLight.color.setHex(mCfg.hemiSky);
  hemiLight.groundColor.setHex(mCfg.hemiGround);
  sunLight.color.setHex(mCfg.sunColor);
  sunLight.intensity = mCfg.sunIntensity;

  if (worldGroup) scene.remove(worldGroup);
  worldGroup = new THREE.Group();
  scene.add(worldGroup);
  mapColliders = [];
  ladderZones = [];
  destructibles = [];
  ammoPickups = [];
  mapSpawns = [];

  const builders = {
    coop: buildBlueBarnCoopMap,
    fort: buildFortFlipMap,
    village: buildClucktownVillageMap,
    forest: buildShellwoodForestMap,
    shipyard: buildShipyardMap,
    ruins: buildOvergrownRuinsMap,
    moonbase: buildMoonbaseMap,
    canyon: buildRedRockCanyonMap,
    facility: buildCryoFacilityMap,
    arena: buildEggosseumArenaMap
  };
  (builders[mapKey] || buildBlueBarnCoopMap)();
  addUniversalTacticalDetails();
}

function addUniversalTacticalDetails() {
  const steelMat = generatePBRMaterialSet('rustSteel', 2, 2, 0.4, 0.7);
  const woodMat  = generatePBRMaterialSet('plankWood', 2, 2, 0.7, 0.05);

  // Corner Elevated Sniper Perches with Ladders in all 4 outer quadrants
  const corners = [
    { x: -38, z: -38, ladSide: 'x', lx: -35.2, lz: -38 },
    { x: 38,  z: 38,  ladSide: 'x', lx: 35.2,  lz: 38 },
    { x: -38, z: 38,  ladSide: 'z', lx: -38,   lz: 35.2 },
    { x: 38,  z: -38, ladSide: 'z', lx: 38,    lz: -35.2 }
  ];
  corners.forEach(c => {
    addBlock(c.x, 2.4, c.z, 5.2, 4.8, 5.2, steelMat);
    addClimbableLadder(c.lx, c.lz, 0, 4.8, c.ladSide);
    addDestructible(c.x, 4.8, c.z, 'sandbag');
  });

  // Extra Destructible Cover & Explosive Barrels along flank routes
  addDestructible(-20, 0, 0, 'crate');
  addDestructible(20, 0, 0, 'crate');
  addDestructible(0, 0, -20, 'crate');
  addDestructible(0, 0, 20, 'crate');
  addDestructible(-16, 0, -16, 'explosiveBarrel');
  addDestructible(16, 0, 16, 'explosiveBarrel');
}

function addBlock(x, y, z, w, h, d, mat, collide = true) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  worldGroup.add(mesh);
  if (collide) {
    mapColliders.push({
      minX: x - w / 2, maxX: x + w / 2,
      minY: y - h / 2, maxY: y + h / 2,
      minZ: z - d / 2, maxZ: z + d / 2
    });
  }
  return mesh;
}

// Walkable Staircase Ramp between two points
function addStaircase(x1, z1, x2, z2, baseY, topY, width, mat) {
  const steps = 12;
  const totalH = topY - baseY;
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const sx = x1 + (x2 - x1) * t;
    const sz = z1 + (z2 - z1) * t;
    const sh = totalH * t;
    const len = Math.hypot(x2 - x1, z2 - z1) / steps + 0.35;
    const isX = Math.abs(x2 - x1) > Math.abs(z2 - z1);
    addBlock(sx, baseY + sh / 2, sz, isX ? len : width, sh, isX ? width : len, mat, true);
  }
}

// Climbable 3D Ladder (Walk up to the yellow/steel ladder rails to ascend vertically!)
function addClimbableLadder(x, z, bottomY, topY, facingAxis = 'z') {
  const height = topY - bottomY;
  const railMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.35, metalness: 0.7 });
  const rungMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.4, metalness: 0.8 });

  const grp = new THREE.Group();
  grp.position.set(x, bottomY, z);
  if (facingAxis === 'x') grp.rotation.y = Math.PI / 2;

  const railL = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, height, 8), railMat);
  railL.position.set(-0.55, height / 2, 0);
  const railR = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, height, 8), railMat);
  railR.position.set(0.55, height / 2, 0);
  grp.add(railL, railR);

  for (let y = 0.5; y < height; y += 0.55) {
    const rung = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.1, 8), rungMat);
    rung.rotation.z = Math.PI / 2;
    rung.position.set(0, y, 0);
    grp.add(rung);
  }
  worldGroup.add(grp);

  ladderZones.push({
    minX: x - 1.35, maxX: x + 1.35,
    minZ: z - 1.35, maxZ: z + 1.35,
    topY: topY + 1.8
  });
}

// Enterable Multi-Story House / Bunker with Doorways, Windows, Interior Stairs/Ladder & Roof Deck!
function addEnterableHouse(cx, cz, w, d, wallH, levels, wallMat, floorMat, ladderSide = 'north') {
  const t = 0.65; // wall thickness
  for (let lv = 0; lv < levels; lv++) {
    const y0 = lv * wallH;
    const midY = y0 + wallH / 2;

    // Floor / Ceiling slab (leave ladder hatch opening on one edge if multi-story)
    if (lv > 0) {
      addBlock(cx, y0, cz, w, 0.4, d, floorMat, true);
    }

    // North & South Walls with wide doorway openings on ground floor, window slits on upper floors
    if (lv === 0) {
      const sideW = (w - 3.6) / 2;
      addBlock(cx - w / 2 + sideW / 2, midY, cz - d / 2, sideW, wallH, t, wallMat);
      addBlock(cx + w / 2 - sideW / 2, midY, cz - d / 2, sideW, wallH, t, wallMat);
      addBlock(cx, y0 + wallH - 0.6, cz - d / 2, 3.6, 1.2, t, wallMat); // door lintel

      addBlock(cx - w / 2 + sideW / 2, midY, cz + d / 2, sideW, wallH, t, wallMat);
      addBlock(cx + w / 2 - sideW / 2, midY, cz + d / 2, sideW, wallH, t, wallMat);
      addBlock(cx, y0 + wallH - 0.6, cz + d / 2, 3.6, 1.2, t, wallMat);
    } else {
      // Sniper parapet walls with shooting windows
      addBlock(cx, y0 + 0.75, cz - d / 2, w, 1.5, t, wallMat);
      addBlock(cx, y0 + 0.75, cz + d / 2, w, 1.5, t, wallMat);
    }

    // East & West Walls with side window openings
    const wingD = (d - 3.0) / 2;
    addBlock(cx - w / 2, midY, cz - d / 2 + wingD / 2, t, wallH, wingD, wallMat);
    addBlock(cx - w / 2, midY, cz + d / 2 - wingD / 2, t, wallH, wingD, wallMat);
    addBlock(cx - w / 2, y0 + 0.65, cz, t, 1.3, 3.0, wallMat); // window sill

    addBlock(cx + w / 2, midY, cz - d / 2 + wingD / 2, t, wallH, wingD, wallMat);
    addBlock(cx + w / 2, midY, cz + d / 2 - wingD / 2, t, wallH, wingD, wallMat);
    addBlock(cx + w / 2, y0 + 0.65, cz, t, 1.3, 3.0, wallMat);
  }

  // Roof Sniper Deck + Low Battlement Walls
  const roofY = levels * wallH;
  addBlock(cx, roofY, cz, w + 0.6, 0.45, d + 0.6, floorMat, true);
  addBlock(cx, roofY + 0.65, cz - d / 2, w, 1.1, 0.4, wallMat);
  addBlock(cx, roofY + 0.65, cz + d / 2, w, 1.1, 0.4, wallMat);

  // Exterior Ladder to Roof Deck
  if (ladderSide === 'north') addClimbableLadder(cx, cz - d / 2 - 0.65, 0, roofY, 'z');
  else if (ladderSide === 'south') addClimbableLadder(cx, cz + d / 2 + 0.65, 0, roofY, 'z');
  else if (ladderSide === 'east') addClimbableLadder(cx + w / 2 + 0.65, cz, 0, roofY, 'x');
  else addClimbableLadder(cx - w / 2 - 0.65, cz, 0, roofY, 'x');
}

// 3D Trees & Pillars
function addTree(x, z, scale = 1.0, autumn = false) {
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5c2d0c, roughness: 0.9 });
  const leafMat  = new THREE.MeshStandardMaterial({ color: autumn ? 0xd97706 : 0x15803d, roughness: 0.75 });

  const trunkH = 5.5 * scale;
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.45 * scale, 0.65 * scale, trunkH, 10), trunkMat);
  trunk.position.set(x, trunkH / 2, z);
  trunk.castShadow = true;
  worldGroup.add(trunk);

  mapColliders.push({
    minX: x - 0.65 * scale, maxX: x + 0.65 * scale,
    minY: 0, maxY: trunkH,
    minZ: z - 0.65 * scale, maxZ: z + 0.65 * scale
  });

  for (let tier = 0; tier < 3; tier++) {
    const cone = new THREE.Mesh(new THREE.ConeGeometry((2.8 - tier * 0.55) * scale, 3.6 * scale, 10), leafMat);
    cone.position.set(x, trunkH + tier * 2.1 * scale, z);
    cone.castShadow = true;
    worldGroup.add(cone);
  }
}

// Destructible Cover Objects (Wooden Crates, Glass Panels, Sandbag Walls, Explosive Red Barrels!)
function addDestructible(x, y, z, kind = 'crate') {
  const id = 'dest_' + Math.random().toString(36).slice(2, 9);
  let w = 2.2, h = 2.2, d = 2.2, hp = 55;
  let mat;

  if (kind === 'explosiveBarrel') {
    w = 1.5; h = 2.2; d = 1.5; hp = 35;
    mat = new THREE.MeshStandardMaterial({ color: 0xdc2626, emissive: 0x7f1d1d, emissiveIntensity: 0.4, roughness: 0.35, metalness: 0.6 });
  } else if (kind === 'glass') {
    w = 3.8; h = 2.6; d = 0.35; hp = 25;
    mat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.45, roughness: 0.1, metalness: 0.8 });
  } else if (kind === 'sandbag') {
    w = 3.6; h = 1.5; d = 1.3; hp = 85;
    mat = new THREE.MeshStandardMaterial({ color: 0xd6d3d1, roughness: 0.9 });
  } else {
    mat = generatePBRMaterialSet('plankWood', 1, 1, 0.7, 0.05);
  }

  const mesh = kind === 'explosiveBarrel'
    ? new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 2.2, 16), mat)
    : new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);

  mesh.position.set(x, y + h / 2, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  worldGroup.add(mesh);

  const collider = {
    minX: x - w / 2, maxX: x + w / 2,
    minY: y, maxY: y + h,
    minZ: z - d / 2, maxZ: z + d / 2,
    isDestructible: true
  };
  mapColliders.push(collider);
  destructibles.push({ id, mesh, collider, hp, maxHp: hp, kind });
}

function addPerimeterAndGround(size, groundMat, wallMat, wallH = 9) {
  const half = size / 2;
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(size, size), groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  worldGroup.add(ground);

  addBlock(0, wallH / 2, -half, size + 2, wallH, 2, wallMat);
  addBlock(0, wallH / 2, half,  size + 2, wallH, 2, wallMat);
  addBlock(-half, wallH / 2, 0, 2, wallH, size + 2, wallMat);
  addBlock(half, wallH / 2, 0,  2, wallH, size + 2, wallMat);
}

// ==========================================
// THE 10 COMPLEX MULTI-FLOOR 3D MAPS
// ==========================================

// 1. BLUE BARN COOP
function buildBlueBarnCoopMap() {
  const grass = generatePBRMaterialSet('grass', 16, 16, 0.88, 0.02);
  const barn  = generatePBRMaterialSet('barnWood', 4, 2, 0.65, 0.08);
  const hay   = generatePBRMaterialSet('hay', 2, 2, 0.92, 0.0);
  const plank = generatePBRMaterialSet('plankWood', 3, 3, 0.7, 0.05);
  addPerimeterAndGround(96, grass, barn, 9);

  // Two-Story Central Red Barn House with Roof Deck & Ladders
  addEnterableHouse(0, 0, 14, 12, 4.2, 2, barn, plank, 'north');
  addClimbableLadder(0, 6.65, 0, 8.4, 'z');

  // Side Hayloft Platforms + Ramps
  addBlock(-24, 2.0, -18, 10, 4.0, 10, plank);
  addStaircase(-24, -6, -24, -13.2, 0, 4.0, 3.6, hay);
  addBlock(24, 2.0, 18, 10, 4.0, 10, plank);
  addStaircase(24, 6, 24, 13.2, 0, 4.0, 3.6, hay);

  // Apple Orchard Trees & Destructible Hay/Barrel Barriers
  [[-32, 24], [-22, 30], [32, -24], [22, -30], [-14, -28], [14, 28]].forEach(([tx, tz]) => addTree(tx, tz, 1.15));
  addDestructible(-10, 0, 12, 'crate');
  addDestructible(10, 0, -12, 'crate');
  addDestructible(-12, 0, -12, 'explosiveBarrel');
  addDestructible(12, 0, 12, 'explosiveBarrel');
  addDestructible(0, 8.6, 0, 'sandbag');

  mapSpawns = [
    { x: -36, y: 1.8, z: -36 }, { x: 36, y: 1.8, z: 36 },
    { x: -36, y: 1.8, z: 36 },  { x: 36, y: 1.8, z: -36 },
    { x: 0,   y: 10.4, z: 0 },  { x: -24, y: 5.8, z: -18 },
    { x: 24,  y: 5.8, z: 18 },  { x: 0,   y: 1.8, z: -26 }
  ];
}

// 2. FORT FLIP CASTLES (Classic Shell Shockers Twin Castles + Elevated Sky Bridge!)
function buildFortFlipMap() {
  const grass = generatePBRMaterialSet('grass', 16, 16, 0.88, 0.02);
  const stone = generatePBRMaterialSet('castleStone', 4, 3, 0.72, 0.15);
  const plank = generatePBRMaterialSet('plankWood', 3, 3, 0.7, 0.05);
  addPerimeterAndGround(100, grass, stone, 10);

  // Twin Multi-Story Castles (West & East)
  addEnterableHouse(-26, 0, 15, 18, 4.4, 2, stone, plank, 'east');
  addEnterableHouse(26, 0, 15, 18, 4.4, 2, stone, plank, 'west');

  // High Sky-Bridge connecting both Castle Roofs!
  addBlock(0, 8.8, 0, 38, 0.5, 4.6, plank);
  addDestructible(-6, 9.05, 0, 'sandbag');
  addDestructible(6, 9.05, 0, 'sandbag');
  addDestructible(0, 9.05, 0, 'explosiveBarrel');

  // Central Courtyard Bunker & Ramps
  addBlock(0, 1.8, -18, 10, 3.6, 8, stone);
  addStaircase(-11, -18, -5.2, -18, 0, 3.6, 3.6, stone);
  addBlock(0, 1.8, 18, 10, 3.6, 8, stone);
  addStaircase(11, 18, 5.2, 18, 0, 3.6, 3.6, stone);

  addDestructible(-12, 0, 0, 'crate');
  addDestructible(12, 0, 0, 'crate');
  addDestructible(0, 0, -8, 'explosiveBarrel');
  addDestructible(0, 0, 8, 'explosiveBarrel');

  mapSpawns = [
    { x: -38, y: 1.8, z: -34 }, { x: 38, y: 1.8, z: 34 },
    { x: -38, y: 1.8, z: 34 },  { x: 38, y: 1.8, z: -34 },
    { x: -26, y: 10.8, z: 0 },  { x: 26, y: 10.8, z: 0 },
    { x: 0,   y: 5.4, z: -18 }, { x: 0,  y: 5.4, z: 18 }
  ];
}

// 3. CLUCKTOWN VILLAGE (4 Enterable Houses, Narrow Streets, Fountain Plaza & Destructible Cover)
function buildClucktownVillageMap() {
  const cobble = generatePBRMaterialSet('castleStone', 18, 18, 0.78, 0.08);
  const wood   = generatePBRMaterialSet('plankWood', 4, 3, 0.68, 0.05);
  const barn   = generatePBRMaterialSet('barnWood', 4, 3, 0.65, 0.05);
  addPerimeterAndGround(104, cobble, barn, 10);

  // 4 Quadrant Houses with Rooftop Ladders
  addEnterableHouse(-22, -22, 13, 13, 4.2, 2, barn, wood, 'south');
  addEnterableHouse(22, -22,  13, 13, 4.2, 2, wood, barn, 'south');
  addEnterableHouse(-22, 22,  13, 13, 4.2, 2, wood, barn, 'north');
  addEnterableHouse(22, 22,   13, 13, 4.2, 2, barn, wood, 'north');

  // Town Square Fountain Monument & Street Barricades
  addBlock(0, 1.2, 0, 7, 2.4, 7, cobble);
  addDestructible(-8, 0, 0, 'sandbag');
  addDestructible(8, 0, 0, 'sandbag');
  addDestructible(0, 0, -8, 'crate');
  addDestructible(0, 0, 8, 'crate');
  addDestructible(-14, 0, 0, 'explosiveBarrel');
  addDestructible(14, 0, 0, 'explosiveBarrel');

  [[-36, 0], [36, 0], [0, -36], [0, 36]].forEach(([tx, tz]) => addTree(tx, tz, 1.1, true));

  mapSpawns = [
    { x: -38, y: 1.8, z: -38 }, { x: 38, y: 1.8, z: 38 },
    { x: -38, y: 1.8, z: 38 },  { x: 38, y: 1.8, z: -38 },
    { x: -22, y: 10.4, z: -22 },{ x: 22, y: 10.4, z: 22 },
    { x: -22, y: 10.4, z: 22 }, { x: 22, y: 10.4, z: -22 }
  ];
}

// 4. SHELLWOOD FOREST (Dense Pine Trees, 3 Sniper Watchtowers, Wooden Cabins & Bunkers)
function buildShellwoodForestMap() {
  const grass = generatePBRMaterialSet('grass', 18, 18, 0.9, 0.02);
  const wood  = generatePBRMaterialSet('plankWood', 4, 3, 0.72, 0.05);
  const stone = generatePBRMaterialSet('castleStone', 4, 3, 0.8, 0.1);
  addPerimeterAndGround(104, grass, wood, 9);

  // Central Ranger Cabin
  addEnterableHouse(0, 0, 12, 12, 4.2, 1, wood, stone, 'north');

  // 3 Elevated Sniper Watchtowers with Ladders
  [[-26, -24], [26, -24], [0, 28]].forEach(([wx, wz]) => {
    addBlock(wx, 3.0, wz, 5.5, 6.0, 5.5, wood);
    addClimbableLadder(wx, wz - 3.1, 0, 6.0, 'z');
    addDestructible(wx, 6.0, wz + 2.0, 'sandbag');
  });

  // 22 Pine Trees scattered as natural cover
  const trees = [
    [-16, -14], [16, -14], [-16, 14], [16, 14], [-34, 0], [34, 0],
    [-12, -30], [12, -30], [-28, 16], [28, 16], [-8, 16], [8, 16],
    [-36, -16], [36, -16], [-20, 4], [20, 4], [0, -22], [-32, 28], [32, 28]
  ];
  trees.forEach(([tx, tz], i) => addTree(tx, tz, 0.95 + (i % 3) * 0.25));

  addDestructible(-10, 0, 0, 'explosiveBarrel');
  addDestructible(10, 0, 0, 'explosiveBarrel');
  addDestructible(0, 0, -12, 'crate');

  mapSpawns = [
    { x: -40, y: 1.8, z: -40 }, { x: 40, y: 1.8, z: 40 },
    { x: -40, y: 1.8, z: 40 },  { x: 40, y: 1.8, z: -40 },
    { x: -26, y: 7.8, z: -24 }, { x: 26, y: 7.8, z: -24 },
    { x: 0,   y: 7.8, z: 28 },  { x: 0,   y: 6.2, z: 0 }
  ];
}

// 5. RUST SHIPYARD (3-Story Stacked Cargo Containers, Catwalks, Ladders & Explosive Fuel Drums)
function buildShipyardMap() {
  const deck  = generatePBRMaterialSet('rustSteel', 16, 16, 0.55, 0.45);
  const blueC = generatePBRMaterialSet('containerBlue', 3, 2, 0.45, 0.55);
  const redC  = generatePBRMaterialSet('containerRed', 3, 2, 0.45, 0.55);
  addPerimeterAndGround(100, deck, deck, 10);

  // Stacked Container Mazes with Ladders & Catwalk Bridges
  addBlock(-18, 2.0, -14, 14, 4.0, 5.2, blueC);
  addBlock(-18, 6.0, -14, 14, 4.0, 5.2, redC);
  addClimbableLadder(-18, -17.0, 0, 8.0, 'z');

  addBlock(18, 2.0, 14, 14, 4.0, 5.2, redC);
  addBlock(18, 6.0, 14, 14, 4.0, 5.2, blueC);
  addClimbableLadder(18, 17.0, 0, 8.0, 'z');

  // Elevated Steel Gantry Bridge connecting the stacks
  addBlock(0, 8.0, 0, 34, 0.45, 4.2, deck);
  addStaircase(-26, 0, -17.2, 0, 0, 8.0, 3.6, deck);
  addStaircase(26, 0, 17.2, 0, 0, 8.0, 3.6, deck);

  // Ground Maze Containers & Explosive Barrels
  addBlock(-20, 2.0, 18, 5.2, 4.0, 14, blueC);
  addBlock(20, 2.0, -18, 5.2, 4.0, 14, redC);
  addDestructible(-6, 0, -6, 'explosiveBarrel');
  addDestructible(6, 0, 6, 'explosiveBarrel');
  addDestructible(-6, 0, 6, 'crate');
  addDestructible(6, 0, -6, 'crate');

  mapSpawns = [
    { x: -38, y: 1.8, z: -36 }, { x: 38, y: 1.8, z: 36 },
    { x: -38, y: 1.8, z: 36 },  { x: 38, y: 1.8, z: -36 },
    { x: -18, y: 9.8, z: -14 }, { x: 18, y: 9.8, z: 14 },
    { x: 0,   y: 9.8, z: 0 },   { x: 0,  y: 1.8, z: -32 }
  ];
}

// 6. OVERGROWN RUINS (4-Tier Ziggurat Temple, Jungle Trees, Pillars & Stone Bridges)
function buildOvergrownRuinsMap() {
  const sand  = generatePBRMaterialSet('sandstone', 16, 16, 0.78, 0.05);
  const stone = generatePBRMaterialSet('castleStone', 4, 4, 0.8, 0.1);
  addPerimeterAndGround(104, sand, stone, 10);

  // 4-Tier Stepped Pyramid Center with Ramps on all 4 sides
  addBlock(0, 1.25, 0, 26, 2.5, 26, sand);
  addBlock(0, 3.75, 0, 18, 2.5, 18, sand);
  addBlock(0, 6.25, 0, 10, 2.5, 10, stone);
  addStaircase(-20, 0, -13.2, 0, 0, 2.5, 4.2, stone);
  addStaircase(20, 0, 13.2, 0, 0, 2.5, 4.2, stone);
  addClimbableLadder(0, -9.4, 2.5, 7.5, 'z');
  addClimbableLadder(0, 9.4, 2.5, 7.5, 'z');

  // Corner Ruined Watch-Houses + Jungle Trees
  addEnterableHouse(-30, -30, 10, 10, 4.0, 1, stone, sand, 'south');
  addEnterableHouse(30, 30,   10, 10, 4.0, 1, stone, sand, 'north');
  [[-30, 26], [30, -26], [-24, 0], [24, 0], [0, -28], [0, 28]].forEach(([tx, tz]) => addTree(tx, tz, 1.25));

  addDestructible(0, 7.5, 0, 'crate');
  addDestructible(-15, 0, -15, 'explosiveBarrel');
  addDestructible(15, 0, 15, 'explosiveBarrel');

  mapSpawns = [
    { x: -40, y: 1.8, z: 0 },   { x: 40, y: 1.8, z: 0 },
    { x: 0,   y: 1.8, z: -40 }, { x: 0,  y: 1.8, z: 40 },
    { x: 0,   y: 9.3, z: 0 },   { x: -30, y: 6.0, z: -30 },
    { x: 30,  y: 6.0, z: 30 },  { x: -15, y: 4.3, z: 0 }
  ];
}

// 7. LUNAR MOONBASE (Low-Gravity Craters, Pressurized Bunkers, Glass Airlocks & Catwalks)
function buildMoonbaseMap() {
  const moon  = generatePBRMaterialSet('moonRegolith', 16, 16, 0.9, 0.05);
  const alloy = generatePBRMaterialSet('facility', 4, 4, 0.35, 0.65);
  addPerimeterAndGround(104, moon, alloy, 8);

  // Twin Lunar Research Habitats with Breakable Glass Airlocks
  addEnterableHouse(-24, 0, 14, 16, 4.2, 2, alloy, alloy, 'east');
  addEnterableHouse(24, 0,  14, 16, 4.2, 2, alloy, alloy, 'west');

  addDestructible(-16.5, 0, 0, 'glass');
  addDestructible(16.5, 0, 0, 'glass');
  addDestructible(0, 0, -10, 'explosiveBarrel');
  addDestructible(0, 0, 10, 'explosiveBarrel');

  // Central Lunar Reactor Tower
  addBlock(0, 2.5, 0, 8, 5.0, 8, alloy);
  addClimbableLadder(0, -4.4, 0, 5.0, 'z');

  mapSpawns = [
    { x: -40, y: 1.8, z: -36 }, { x: 40, y: 1.8, z: 36 },
    { x: -40, y: 1.8, z: 36 },  { x: 40, y: 1.8, z: -36 },
    { x: -24, y: 10.4, z: 0 },  { x: 24, y: 10.4, z: 0 },
    { x: 0,   y: 6.8, z: 0 },   { x: 0,  y: 1.8, z: -30 }
  ];
}

// 8. RED ROCK CANYON (Twin Mesa Cliffs, Canyon Bridges, Wooden Mine Shacks & TNT Barrels)
function buildRedRockCanyonMap() {
  const rock  = generatePBRMaterialSet('redRock', 16, 16, 0.85, 0.05);
  const plank = generatePBRMaterialSet('plankWood', 4, 3, 0.72, 0.05);
  addPerimeterAndGround(104, rock, rock, 11);

  // North & South High Mesa Plateaus + Canyon Bridges
  addBlock(0, 3.0, -28, 56, 6.0, 18, rock);
  addBlock(0, 3.0, 28,  56, 6.0, 18, rock);
  addStaircase(-34, -12, -34, -19.2, 0, 6.0, 4.2, plank);
  addStaircase(34, 12, 34, 19.2, 0, 6.0, 4.2, plank);

  // Two Wooden Suspension Bridges spanning the Canyon Floor!
  addBlock(-14, 6.0, 0, 4.4, 0.45, 38, plank);
  addBlock(14, 6.0, 0,  4.4, 0.45, 38, plank);

  // Canyon Floor Mine Shack & TNT Barrels
  addEnterableHouse(0, 0, 10, 10, 4.0, 1, plank, plank, 'east');
  addDestructible(-6, 0, 0, 'explosiveBarrel');
  addDestructible(6, 0, 0, 'explosiveBarrel');
  addDestructible(-14, 6.25, 0, 'sandbag');
  addDestructible(14, 6.25, 0, 'sandbag');

  mapSpawns = [
    { x: -24, y: 7.8, z: -28 }, { x: 24, y: 7.8, z: 28 },
    { x: -24, y: 7.8, z: 28 },  { x: 24, y: 7.8, z: -28 },
    { x: -38, y: 1.8, z: 0 },   { x: 38, y: 1.8, z: 0 },
    { x: 0,   y: 6.0, z: 0 },   { x: 0,  y: 1.8, z: -12 }
  ];
}

// 9. CRYO LAB FACILITY (Multi-Level Glass Offices, Steel Catwalks & Cryo Chambers)
function buildCryoFacilityMap() {
  const tile  = generatePBRMaterialSet('facility', 18, 18, 0.35, 0.55);
  const steel = generatePBRMaterialSet('rustSteel', 4, 4, 0.3, 0.75);
  addPerimeterAndGround(100, tile, steel, 10);

  // Multi-Story Lab Control Rooms with Breakable Glass Walls
  addEnterableHouse(-22, -20, 14, 12, 4.2, 2, steel, tile, 'south');
  addEnterableHouse(22, 20,   14, 12, 4.2, 2, steel, tile, 'north');

  // Destructible Glass Partitions & Cryo Barrels
  addDestructible(-12, 0, 0, 'glass');
  addDestructible(12, 0, 0, 'glass');
  addDestructible(0, 0, -12, 'glass');
  addDestructible(0, 0, 12, 'glass');
  addDestructible(-6, 0, -6, 'explosiveBarrel');
  addDestructible(6, 0, 6, 'explosiveBarrel');

  // Central Elevated Reactor Ring + Ramps
  addBlock(0, 2.0, 0, 10, 4.0, 10, steel);
  addStaircase(-11, 0, -5.2, 0, 0, 4.0, 3.6, tile);
  addStaircase(11, 0, 5.2, 0, 0, 4.0, 3.6, tile);

  mapSpawns = [
    { x: -38, y: 1.8, z: 36 },  { x: 38, y: 1.8, z: -36 },
    { x: -22, y: 10.4, z: -20 },{ x: 22, y: 10.4, z: 20 },
    { x: 0,   y: 5.8, z: 0 },   { x: -36, y: 1.8, z: 0 },
    { x: 36,  y: 1.8, z: 0 },   { x: 0,   y: 1.8, z: -34 }
  ];
}

// 10. EGGOSEUM COLOSSEUM (3-Tier Roman Amphitheater Balconies, Marble Pillars & Gladiator Cover)
function buildEggosseumArenaMap() {
  const sand   = generatePBRMaterialSet('sandstone', 18, 18, 0.85, 0.05);
  const marble = generatePBRMaterialSet('marble', 6, 4, 0.45, 0.25);
  addPerimeterAndGround(104, sand, marble, 11);

  // 3-Tier Stepped Colosseum Spectator Balconies around the North & South Wings
  addBlock(0, 1.5, -34, 68, 3.0, 14, marble);
  addBlock(0, 4.5, -38, 68, 3.0, 6, marble);
  addStaircase(-38, -20, -38, -27.2, 0, 3.0, 4.5, marble);
  addStaircase(38, -20, 38, -27.2, 0, 3.0, 4.5, marble);
  addClimbableLadder(0, -34.6, 3.0, 6.0, 'z');

  addBlock(0, 1.5, 34, 68, 3.0, 14, marble);
  addBlock(0, 4.5, 38, 68, 3.0, 6, marble);
  addStaircase(-38, 20, -38, 27.2, 0, 3.0, 4.5, marble);
  addStaircase(38, 20, 38, 27.2, 0, 3.0, 4.5, marble);
  addClimbableLadder(0, 34.6, 3.0, 6.0, 'z');

  // Ring of 12 Roman Marble Columns across the Arena Floor
  for (let i = 0; i < 12; i++) {
    const ang = (i * Math.PI * 2) / 12;
    const px = Math.cos(ang) * 18;
    const pz = Math.sin(ang) * 18;
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.1, 9, 16), marble);
    col.position.set(px, 4.5, pz);
    col.castShadow = true;
    worldGroup.add(col);
    mapColliders.push({ minX: px - 1.0, maxX: px + 1.0, minY: 0, maxY: 9, minZ: pz - 1.0, maxZ: pz + 1.0 });
  }

  // Center Emperor's Podium & Destructible Gladiator Crates/Barrels
  addBlock(0, 1.2, 0, 7, 2.4, 7, marble);
  addDestructible(-8, 0, 0, 'crate');
  addDestructible(8, 0, 0, 'crate');
  addDestructible(0, 0, -8, 'explosiveBarrel');
  addDestructible(0, 0, 8, 'explosiveBarrel');

  mapSpawns = [
    { x: -38, y: 1.8, z: 0 },   { x: 38, y: 1.8, z: 0 },
    { x: -24, y: 4.8, z: -34 }, { x: 24, y: 4.8, z: 34 },
    { x: 0,   y: 7.8, z: -38 }, { x: 0,  y: 7.8, z: 38 },
    { x: 0,   y: 4.2, z: 0 },   { x: -12, y: 1.8, z: 12 }
  ];
}

function updateWeaponMesh() {
  if (!viewWeaponGroup) return;
  while (viewWeaponGroup.children.length > 0) {
    viewWeaponGroup.remove(viewWeaponGroup.children[0]);
  }
  const gunMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.28, metalness: 0.85 });
  const accentMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.35, metalness: 0.6 });

  const body = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.14, 0.65), gunMat);
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.45, 10), accentMat);
  barrel.rotation.x = Math.PI / 2;
  barrel.position.set(0, 0.03, -0.45);
  viewWeaponGroup.add(body, barrel);
}

const POTION_CANDIDATE_SPOTS = [
  { x: -12, y: 0.85, z: -12 }, { x: 12, y: 0.85, z: 12 },
  { x: -12, y: 0.85, z: 12 },  { x: 12, y: 0.85, z: -12 },
  { x: -28, y: 0.85, z: 0 },   { x: 28, y: 0.85, z: 0 },
  { x: 0,   y: 0.85, z: -28 }, { x: 0,  y: 0.85, z: 28 },
  { x: -34, y: 0.85, z: -22 }, { x: 34, y: 0.85, z: 22 },
  { x: -20, y: 0.85, z: 32 },  { x: 20, y: 0.85, z: -32 }
];

let healingPotions = [];

function createHealingPotionMesh() {
  const grp = new THREE.Group();
  // Glowing Emerald Flask Body
  const flask = new THREE.Mesh(
    new THREE.SphereGeometry(0.42, 16, 16),
    new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x059669,
      emissiveIntensity: 0.85,
      roughness: 0.15,
      metalness: 0.2
    })
  );
  // Bottle Neck & Cork
  const neck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.14, 0.16, 0.28, 12),
    new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.3 })
  );
  neck.position.y = 0.44;
  // Floating Healing Cross Ring
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.58, 0.04, 8, 24),
    new THREE.MeshBasicMaterial({ color: 0x34d399 })
  );
  ring.rotation.x = Math.PI / 2;
  grp.add(flask, neck, ring);
  return grp;
}

function getUnusedPotionSpot(currentSpots) {
  const available = POTION_CANDIDATE_SPOTS.filter(s =>
    !currentSpots.some(used => Math.hypot(used.x - s.x, used.z - s.z) < 4)
  );
  const pool = available.length > 0 ? available : POTION_CANDIDATE_SPOTS;
  return pool[Math.floor(Math.random() * pool.length)];
}

function spawnPickups() {
  healingPotions = [];
  // Spawn exactly 4 Healing Potions across the map
  const chosen = [];
  for (let i = 0; i < 4; i++) {
    const spot = getUnusedPotionSpot(chosen);
    chosen.push(spot);
    const mesh = createHealingPotionMesh();
    mesh.position.set(spot.x, spot.y, spot.z);
    worldGroup.add(mesh);
    healingPotions.push({ mesh, x: spot.x, y: spot.y, z: spot.z, active: true });
  }

  // Spawn Golden Eggs & Ammo Crates
  const spots = [[-10, -6], [10, 6], [0, -16], [0, 16]];
  spots.forEach(([px, pz], idx) => {
    const isGolden = idx % 2 === 0;
    const mesh = new THREE.Mesh(
      isGolden ? new THREE.SphereGeometry(0.45, 16, 16) : new THREE.BoxGeometry(0.75, 0.55, 0.75),
      new THREE.MeshStandardMaterial({
        color: isGolden ? 0xfbbf24 : 0x38bdf8,
        emissive: isGolden ? 0xd97706 : 0x0284c7,
        emissiveIntensity: 0.55,
        metalness: 0.65,
        roughness: 0.2
      })
    );
    if (isGolden) mesh.scale.set(0.85, 1.25, 0.85);
    mesh.position.set(px, 0.75, pz);
    worldGroup.add(mesh);
    ammoPickups.push({ mesh, x: px, z: pz, isGolden, active: true });
  });
}

function build3DEggCharacter(colorHex) {
  const grp = new THREE.Group();
  const shellGeo = new THREE.SphereGeometry(0.82, 24, 24);
  shellGeo.scale(0.88, 1.28, 0.88);
  const shellMat = new THREE.MeshStandardMaterial({
    color: colorHex,
    roughness: 0.26,
    metalness: 0.08
  });
  const shell = new THREE.Mesh(shellGeo, shellMat);
  shell.castShadow = true;
  grp.add(shell);

  const goggle = new THREE.Mesh(
    new THREE.BoxGeometry(0.75, 0.22, 0.35),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2, metalness: 0.8 })
  );
  goggle.position.set(0, 0.25, -0.62);
  grp.add(goggle);

  const gun = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 0.16, 1.1),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.75, roughness: 0.28 })
  );
  gun.position.set(0.55, -0.05, -0.55);
  grp.add(gun);

  return grp;
}

function spawnBulletTracer(origin, dir, length = 55) {
  const end = origin.clone().addScaledVector(dir, length);
  const geo = new THREE.BufferGeometry().setFromPoints([origin, end]);
  const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0xfef08a }));
  scene.add(line);
  tracers.push({ line, ttl: 0.07 });
}

function spawnYolkParticles(x, y, z) {
  for (let i = 0; i < 8; i++) {
    const drop = new THREE.Mesh(
      new THREE.SphereGeometry(0.14, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xf59e0b })
    );
    drop.position.set(x, y, z);
    scene.add(drop);
    yolkParticles.push({
      mesh: drop,
      vx: (Math.random() - 0.5) * 9,
      vy: Math.random() * 6 + 2,
      vz: (Math.random() - 0.5) * 9,
      ttl: 0.45
    });
  }
}

// ==========================================
// MAIN 60FPS GAME, LADDER CLIMBING & DESTRUCTION LOOP
// ==========================================
let lastTime = performance.now();
let netSyncTimer = 0;

function fpsGameLoop() {
  requestAnimationFrame(fpsGameLoop);
  const now = performance.now();
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;

  if (gameContainer.classList.contains('hidden') || matchEnded) return;

  // Match Countdown Timer
  matchTimeRemaining = Math.max(0, matchTimeRemaining - dt);
  const timerEl = document.getElementById('hudMatchTimer');
  timerEl.textContent = formatMatchClock(matchTimeRemaining);
  timerEl.classList.toggle('urgent', matchTimeRemaining <= 15);

  if (matchTimeRemaining <= 0) {
    endMatchAndShowPodium();
    return;
  }

  if (fireCooldown > 0) fireCooldown -= dt;
  if (mouseDown && WEAPONS[currentWeaponKey].auto) tryFireWeapon();

  if (viewWeaponGroup) {
    viewWeaponGroup.position.z += (-0.55 - viewWeaponGroup.position.z) * 14 * dt;
  }

  // Local Player 3D Movement, Ladder Climbing, Ramps & Gravity
  if (player.alive) {
    const mCfg = MAP_CONFIGS[selectedMap];
    const forward = new THREE.Vector3(-Math.sin(player.yaw), 0, -Math.cos(player.yaw));
    const right = new THREE.Vector3(Math.cos(player.yaw), 0, -Math.sin(player.yaw));
    const move = new THREE.Vector3();
    if (keys.w) move.add(forward);
    if (keys.s) move.sub(forward);
    if (keys.d) move.add(right);
    if (keys.a) move.sub(right);
    if (move.lengthSq() > 0) move.normalize();

    const speed = isScoped ? 6.5 : 13.0;
    player.x += move.x * speed * dt;
    player.z += move.z * speed * dt;

    // Check if player is inside a Climbable Ladder Zone
    let onLadder = false;
    for (const lad of ladderZones) {
      if (player.x >= lad.minX && player.x <= lad.maxX &&
          player.z >= lad.minZ && player.z <= lad.maxZ &&
          player.y <= lad.topY + 0.5) {
        onLadder = true;
        if (keys.w || keys.space) {
          player.y = Math.min(lad.topY, player.y + 10.5 * dt);
          player.vy = 0;
        } else if (keys.s) {
          player.y = Math.max(1.8, player.y - 10.5 * dt);
          player.vy = 0;
        } else {
          player.vy = 0;
        }
        break;
      }
    }

    // Highest walkable floor beneath player (supports multi-story roofs, bridges & stair ramps!)
    let floorY = 1.8;
    const pad = 0.72;
    for (const box of mapColliders) {
      if (player.x > box.minX - pad && player.x < box.maxX + pad &&
          player.z > box.minZ - pad && player.z < box.maxZ + pad) {
        const topEyeY = box.maxY + 1.8;
        if (player.y >= topEyeY - 0.65 && topEyeY > floorY) {
          floorY = topEyeY;
        }
      }
    }

    if (!onLadder) {
      if (keys.space && player.y <= floorY + 0.06) {
        player.vy = 11.8;
      }
      player.vy -= mCfg.gravity * dt;
      player.y += player.vy * dt;

      if (player.y <= floorY) {
        player.y = floorY;
        player.vy = 0;
      }
    }

    // Horizontal Wall & House Collision Resolution
    for (const box of mapColliders) {
      const feetY = player.y - 1.8;
      if (feetY < box.maxY - 0.45 && player.y + 0.5 > box.minY) {
        if (player.x > box.minX - pad && player.x < box.maxX + pad &&
            player.z > box.minZ - pad && player.z < box.maxZ + pad) {
          const penL = Math.abs(player.x - (box.minX - pad));
          const penR = Math.abs((box.maxX + pad) - player.x);
          const penT = Math.abs(player.z - (box.minZ - pad));
          const penB = Math.abs((box.maxZ + pad) - player.z);
          const m = Math.min(penL, penR, penT, penB);
          if (m === penL) player.x = box.minX - pad;
          else if (m === penR) player.x = box.maxX + pad;
          else if (m === penT) player.z = box.minZ - pad;
          else player.z = box.maxZ + pad;
        }
      }
    }

    camera.position.set(player.x, player.y + 0.35, player.z);
    camera.rotation.order = 'YXZ';
    camera.rotation.y = player.yaw;
    camera.rotation.x = player.pitch;

    // Collect & Relocate Healing Potions (+85 HP, reappears at a NEW spot!)
    healingPotions.forEach(pot => {
      pot.mesh.rotation.y += 2.6 * dt;
      pot.mesh.position.y = pot.y + Math.sin(now * 0.004 + pot.x) * 0.18;
      if (pot.active && Math.hypot(player.x - pot.x, player.z - pot.z) < 2.1 && Math.abs(player.y - 1.8) < 2.5) {
        if (player.hp < 200) {
          player.hp = Math.min(200, player.hp + 85);
          pot.active = false;
          pot.mesh.visible = false;
          addKillFeed(`🧪 ${player.name} drank a Healing Potion (+85 HP)!`);
          updateHud();

          // Reappear after 6 seconds at a DIFFERENT random spot on the map!
          setTimeout(() => {
            const newSpot = getUnusedPotionSpot(healingPotions.filter(p => p.active));
            pot.x = newSpot.x;
            pot.y = newSpot.y;
            pot.z = newSpot.z;
            pot.mesh.position.set(pot.x, pot.y, pot.z);
            pot.active = true;
            pot.mesh.visible = true;
          }, 6000);
        }
      }
    });

    ammoPickups.forEach(pk => {
      pk.mesh.rotation.y += 2.2 * dt;
      if (pk.active && Math.hypot(player.x - pk.x, player.z - pk.z) < 2.0) {
        pk.active = false;
        pk.mesh.visible = false;
        if (pk.isGolden) {
          goldenEggs += 5;
        } else {
          const w = WEAPONS[currentWeaponKey];
          ammoReserve = Math.min(w.reserve, ammoReserve + w.mag);
          grenades = Math.min(3, grenades + 1);
        }
        updateHud();
        setTimeout(() => { pk.active = true; pk.mesh.visible = true; }, 8000);
      }
    });
  }

  // Update AI Egg Bots with Obstacle Avoidance
  for (const bot of aiBots) {
    if (!bot.alive) continue;
    const dx = player.x - bot.x;
    const dz = player.z - bot.z;
    const dist = Math.hypot(dx, dz);
    bot.yaw = Math.atan2(-dx, -dz);

    const moveSpeed = 6.2;
    let stepX = (dx / (dist || 1)) * moveSpeed * dt;
    let stepZ = (dz / (dist || 1)) * moveSpeed * dt;
    if (dist <= 9) {
      stepX = Math.cos(now * 0.002 + bot.color) * 4.5 * dt;
      stepZ = Math.sin(now * 0.002 + bot.color) * 4.5 * dt;
    }

    const nextX = Math.max(-46, Math.min(46, bot.x + stepX));
    const nextZ = Math.max(-46, Math.min(46, bot.z + stepZ));
    let blocked = false;
    for (const box of mapColliders) {
      if (bot.y - 1.5 < box.maxY - 0.5 && bot.y + 0.5 > box.minY) {
        if (nextX > box.minX - 0.8 && nextX < box.maxX + 0.8 &&
            nextZ > box.minZ - 0.8 && nextZ < box.maxZ + 0.8) {
          blocked = true;
          break;
        }
      }
    }
    if (!blocked) {
      bot.x = nextX;
      bot.z = nextZ;
    } else {
      // Strafe around barrier
      bot.x = Math.max(-46, Math.min(46, bot.x - stepZ));
      bot.z = Math.max(-46, Math.min(46, bot.z + stepX));
    }

    bot.shootTimer -= dt;
    if (bot.shootTimer <= 0 && player.alive && dist < 38) {
      bot.shootTimer = 1.5 + Math.random() * 1.2;
      // Line-of-sight wall check before bot can hit player
      const bOrigin = new THREE.Vector3(bot.x, bot.y + 0.3, bot.z);
      const bDir = new THREE.Vector3(player.x - bot.x, player.y - bot.y, player.z - bot.z).normalize();
      let wallBlocking = false;
      for (const box of mapColliders) {
        if (rayIntersectAABB(bOrigin, bDir, box, dist) !== null) {
          wallBlocking = true;
          break;
        }
      }
      if (!wallBlocking && Math.random() < 0.45) {
        const wasAlive = player.alive;
        damageLocalPlayer(11, bot.name);
        if (wasAlive && !player.alive) {
          bot.kills += 1;
          updateHud();
        }
      }
    }
  }

  // Update Thrown Egg Grenades
  for (let i = thrownGrenades.length - 1; i >= 0; i--) {
    const g = thrownGrenades[i];
    g.fuse -= dt;
    g.vy -= 26 * dt;
    g.mesh.position.x += g.vx * dt;
    g.mesh.position.y += g.vy * dt;
    g.mesh.position.z += g.vz * dt;
    if (g.mesh.position.y < 0.3) {
      g.mesh.position.y = 0.3;
      g.vy = -g.vy * 0.45;
      g.vx *= 0.7;
      g.vz *= 0.7;
    }
    if (g.fuse <= 0) {
      explodeAt(g.mesh.position, 9.0, 95);
      scene.remove(g.mesh);
      thrownGrenades.splice(i, 1);
    }
  }

  // Update RPEGG Rockets (Detonate on Wall/Barrier/Ground Impact!)
  for (let i = rockets.length - 1; i >= 0; i--) {
    const r = rockets[i];
    r.ttl -= dt;
    r.mesh.position.addScaledVector(r.dir, r.speed * dt);
    let hitWall = r.mesh.position.y <= 0.2 || r.ttl <= 0;
    if (!hitWall) {
      for (const box of mapColliders) {
        if (r.mesh.position.x >= box.minX && r.mesh.position.x <= box.maxX &&
            r.mesh.position.y >= box.minY && r.mesh.position.y <= box.maxY &&
            r.mesh.position.z >= box.minZ && r.mesh.position.z <= box.maxZ) {
          hitWall = true;
          break;
        }
      }
    }
    if (hitWall) {
      explodeAt(r.mesh.position, 9.0, 105);
      scene.remove(r.mesh);
      rockets.splice(i, 1);
    }
  }

  // Sync 3D Egg Models
  const activeEggs = new Set();
  const allEggs = [...aiBots, ...Array.from(remotePlayers.values())];
  for (const e of allEggs) {
    if (!e.alive) continue;
    activeEggs.add(e.id);
    let mesh = eggMeshes.get(e.id);
    if (!mesh) {
      mesh = build3DEggCharacter(e.color || 0xfde047);
      scene.add(mesh);
      eggMeshes.set(e.id, mesh);
    }
    mesh.position.set(e.x, e.y - 0.5, e.z);
    mesh.rotation.y = e.yaw || 0;
  }
  for (const [id, mesh] of eggMeshes.entries()) {
    if (!activeEggs.has(id)) {
      scene.remove(mesh);
      eggMeshes.delete(id);
    }
  }

  // Expire tracers, yolk & shattered barrier debris
  tracers = tracers.filter(t => {
    t.ttl -= dt;
    if (t.ttl <= 0) { scene.remove(t.line); return false; }
    return true;
  });
  yolkParticles = yolkParticles.filter(p => {
    p.ttl -= dt;
    p.vy -= 22 * dt;
    p.mesh.position.x += p.vx * dt;
    p.mesh.position.y += p.vy * dt;
    p.mesh.position.z += p.vz * dt;
    if (p.ttl <= 0) { scene.remove(p.mesh); return false; }
    return true;
  });
  debrisParticles = debrisParticles.filter(d => {
    d.ttl -= dt;
    d.vy -= 24 * dt;
    d.mesh.position.x += d.vx * dt;
    d.mesh.position.y += d.vy * dt;
    d.mesh.position.z += d.vz * dt;
    d.mesh.rotation.x += 6 * dt;
    d.mesh.rotation.y += 6 * dt;
    if (d.ttl <= 0) { scene.remove(d.mesh); return false; }
    return true;
  });

  if (!isOffline) {
    netSyncTimer += dt;
    if (netSyncTimer >= 0.05) {
      netSyncTimer = 0;
      const state = {
        name: player.name,
        x: Math.round(player.x * 100) / 100,
        y: Math.round(player.y * 100) / 100,
        z: Math.round(player.z * 100) / 100,
        yaw: Math.round(player.yaw * 100) / 100,
        hp: player.hp,
        alive: player.alive,
        kills: player.kills,
        timeRemaining: Math.round(matchTimeRemaining * 10) / 10
      };
      if (isHost) broadcastToClients({ type: 'peerUpdate', id: myId, state });
      else if (hostConn && hostConn.open) hostConn.send({ type: 'playerSync', state });
    }
  }

  renderer.render(scene, camera);
}

function explodeAt(pos, radius, maxDmg) {
  spawnYolkParticles(pos.x, pos.y + 0.5, pos.z);

  // Blast shatters all destructible crates, glass, sandbags & explosive barrels in radius!
  for (let i = destructibles.length - 1; i >= 0; i--) {
    const d = destructibles[i];
    const dist = d.mesh.position.distanceTo(pos);
    if (dist < radius) {
      destroyBarrierById(d.id, true);
    }
  }

  for (const bot of aiBots) {
    if (!bot.alive) continue;
    const d = Math.hypot(bot.x - pos.x, bot.z - pos.z);
    if (d < radius) {
      bot.hp -= maxDmg * (1 - d / radius);
      if (bot.hp <= 0) {
        bot.alive = false;
        player.kills++;
        goldenEggs += 3;
        addKillFeed(`${player.name} 💥 ${bot.name}`);
        updateHud();
        setTimeout(() => {
          const sp = getRandomSpawn();
          bot.x = sp.x; bot.y = sp.y; bot.z = sp.z; bot.hp = 200; bot.alive = true;
        }, 3000);
      }
    }
  }
}
