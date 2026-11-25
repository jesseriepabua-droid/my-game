window.addEventListener('DOMContentLoaded', () => {
  // WEAPON DEFINITIONS (Shell Shockers Classes)
  const WEAPONS = {
    eggk47: {
      name: 'EggK-47',
      damage: 24,
      fireRate: 135,
      magSize: 30,
      reloadMs: 1400,
      spread: 0.018,
      pellets: 1,
      speed: 95,
      auto: true,
      burst: 1,
      zoomFov: 60,
      scope: false,
      explosive: false,
      color: 0x37474f
    },
    scrambler: {
      name: 'Scrambler',
      damage: 19,
      fireRate: 650,
      magSize: 2,
      reloadMs: 1200,
      spread: 0.085,
      pellets: 7,
      speed: 80,
      auto: false,
      burst: 1,
      zoomFov: 65,
      scope: false,
      explosive: false,
      color: 0x8d6e63
    },
    freeranger: {
      name: 'Free Ranger',
      damage: 65,
      fireRate: 360,
      magSize: 8,
      reloadMs: 1600,
      spread: 0.002,
      pellets: 1,
      speed: 140,
      auto: false,
      burst: 1,
      zoomFov: 26,
      scope: true,
      explosive: false,
      color: 0x2e7d32
    },
    rpegg: {
      name: 'RPEGG',
      damage: 115,
      fireRate: 1100,
      magSize: 1,
      reloadMs: 1700,
      spread: 0.008,
      pellets: 1,
      speed: 55,
      auto: false,
      burst: 1,
      zoomFov: 58,
      scope: false,
      explosive: true,
      color: 0xd84315
    },
    whipper: {
      name: 'Whipper',
      damage: 15,
      fireRate: 80,
      magSize: 40,
      reloadMs: 1500,
      spread: 0.036,
      pellets: 1,
      speed: 90,
      auto: true,
      burst: 1,
      zoomFov: 62,
      scope: false,
      explosive: false,
      color: 0x5e35b1
    },
    crackshot: {
      name: 'Crackshot',
      damage: 130,
      fireRate: 1150,
      magSize: 1,
      reloadMs: 1450,
      spread: 0.001,
      pellets: 1,
      speed: 165,
      auto: false,
      burst: 1,
      zoomFov: 20,
      scope: true,
      explosive: false,
      color: 0x1565c0
    },
    trihard: {
      name: 'Tri-Hard',
      damage: 25,
      fireRate: 420,
      magSize: 24,
      reloadMs: 1450,
      spread: 0.012,
      pellets: 1,
      speed: 105,
      auto: false,
      burst: 3,
      zoomFov: 48,
      scope: false,
      explosive: false,
      color: 0xf9a825
    }
  };

  const WEAPON_KEYS = Object.keys(WEAPONS);

  // UI ELEMENTS
  const lobby = document.getElementById('lobby');
  const hud = document.getElementById('hud');
  const connStatus = document.getElementById('connStatus');
  const playerNameInput = document.getElementById('playerName');
  const mapSelect = document.getElementById('mapSelect');
  const roomCodeInput = document.getElementById('roomCodeInput');
  const createBtn = document.getElementById('createBtn');
  const joinBtn = document.getElementById('joinBtn');
  const errorMsg = document.getElementById('errorMsg');
  const displayRoomCode = document.getElementById('displayRoomCode');
  const displayMapName = document.getElementById('displayMapName');
  const copyCodeBtn = document.getElementById('copyCodeBtn');
  const timerDisplay = document.getElementById('timerDisplay');
  const scoreboardList = document.getElementById('scoreboardList');
  const killFeed = document.getElementById('killFeed');
  const hpBar = document.getElementById('hpBar');
  const hpText = document.getElementById('hpText');
  const ammoText = document.getElementById('ammoText');
  const currentWeaponName = document.getElementById('currentWeaponName');
  const clickPrompt = document.getElementById('clickPrompt');
  const scopeOverlay = document.getElementById('scopeOverlay');
  const hitmarker = document.getElementById('hitmarker');
  const damageFlash = document.getElementById('damageFlash');
  const quickWeaponBar = document.getElementById('quickWeaponBar');
  const qwList = document.getElementById('qwList');
  const matchOverModal = document.getElementById('matchOverModal');
  const winnerNameFlash = document.getElementById('winnerNameFlash');
  const finalStandings = document.getElementById('finalStandings');

  // LOBBY SELECTION STATE
  let selectedColor = '#ff5252';
  let selectedWeapon = 'eggk47';
  let selectedDuration = 180;

  // 1. BIND ALL LOBBY BUTTONS IMMEDIATELY SO THEY ARE ALWAYS CLICKABLE
  document.querySelectorAll('.color-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('.color-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      selectedColor = btn.dataset.color;
    });
  });

  document.querySelectorAll('.weapon-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('.weapon-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      selectedWeapon = btn.dataset.weapon;
    });
  });

  document.querySelectorAll('.time-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('.time-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      selectedDuration = Number(btn.dataset.time);
    });
  });

  // CONNECT SOCKET.IO
  const socket = typeof io !== 'undefined' ? io() : null;

  if (!socket) {
    connStatus.textContent = 'Server script missing (run via Node server)';
    connStatus.className = 'status-offline';
  } else {
    socket.on('connect', () => {
      connStatus.textContent = 'Server Online • Ready';
      connStatus.className = 'status-ready';
    });
    socket.on('disconnect', () => {
      connStatus.textContent = 'Disconnected • Reconnecting...';
      connStatus.className = 'status-offline';
    });
  }

  createBtn.addEventListener('click', (e) => {
    e.preventDefault();
    errorMsg.textContent = '';
    if (!socket || !socket.connected) {
      errorMsg.textContent = 'Still connecting to server... wait 2 seconds and click again.';
      return;
    }
    createBtn.textContent = 'CREATING ARENA...';
    socket.emit('createRoom', {
      name: playerNameInput.value,
      color: selectedColor,
      weapon: selectedWeapon,
      mapId: mapSelect.value,
      duration: selectedDuration
    });
  });

  joinBtn.addEventListener('click', (e) => {
    e.preventDefault();
    errorMsg.textContent = '';
    const code = roomCodeInput.value.trim().toUpperCase();
    if (code.length !== 4) {
      errorMsg.textContent = 'Please enter a 4-letter room code.';
      return;
    }
    if (!socket || !socket.connected) {
      errorMsg.textContent = 'Still connecting to server... wait 2 seconds and click again.';
      return;
    }
    joinBtn.textContent = 'JOINING...';
    socket.emit('joinRoom', {
      code,
      name: playerNameInput.value,
      color: selectedColor,
      weapon: selectedWeapon
    });
  });

  copyCodeBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(displayRoomCode.textContent);
    copyCodeBtn.textContent = 'Copied!';
    setTimeout(() => (copyCodeBtn.textContent = 'Copy'), 1500);
  });

  // Build Quick Weapon Bar
  WEAPON_KEYS.forEach((key, idx) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'qw-item';
    btn.dataset.weapon = key;
    btn.textContent = `${idx + 1}. ${WEAPONS[key].name}`;
    btn.addEventListener('click', () => equipWeapon(key));
    qwList.appendChild(btn);
  });

  // GAME STATE
  let myId = null;
  let myPlayer = null;
  let allPlayers = {};
  let remoteMeshes = {};
  let bullets = [];
  let explosions = [];
  let mapGroup = null;
  let colliders = [];
  let ramps = [];
  let currentGravity = 26;

  // THREE.JS SETUP
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 260);
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.body.appendChild(renderer.domElement);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
  scene.add(ambientLight);

  const sunLight = new THREE.DirectionalLight(0xffffff, 0.95);
  sunLight.position.set(35, 65, 30);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 1024;
  sunLight.shadow.mapSize.height = 1024;
  const d = 50;
  sunLight.shadow.camera.left = -d;
  sunLight.shadow.camera.right = d;
  sunLight.shadow.camera.top = d;
  sunLight.shadow.camera.bottom = -d;
  scene.add(sunLight);

  function makeGridTexture(bgHex, lineHex, repeat = 12) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = bgHex;
    ctx.fillRect(0, 0, 256, 256);
    ctx.strokeStyle = lineHex;
    ctx.lineWidth = 6;
    ctx.strokeRect(3, 3, 250, 250);
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.fillRect(16, 16, 104, 104);
    ctx.fillRect(136, 136, 104, 104);

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(repeat, repeat);
    return tex;
  }

  // 10 COMPLEX 3D MAPS BUILDER
  function buildArenaMap(mapId) {
    if (mapGroup) scene.remove(mapGroup);
    mapGroup = new THREE.Group();
    scene.add(mapGroup);

    colliders = [];
    ramps = [];
    currentGravity = mapId === 'moonbase' ? 14 : 26;

    const themes = {
      castle: { sky: 0x7ec0ee, fog: 0x7ec0ee, floorBg: '#5d7c47', floorLn: '#4a6637', wall: 0x78909c, accent: 0xb71c1c, title: 'CASTLE' },
      blue: { sky: 0x4fc3f7, fog: 0x4fc3f7, floorBg: '#1976d2', floorLn: '#0d47a1', wall: 0x90caf9, accent: 0xffd54f, title: 'BLUE' },
      dirt: { sky: 0xe6b87d, fog: 0xd9a76a, floorBg: '#a16b3f', floorLn: '#7d4f2a', wall: 0x8d6e63, accent: 0xd84315, title: 'DIRT' },
      fortflip: { sky: 0x81d4fa, fog: 0x81d4fa, floorBg: '#558b2f', floorLn: '#33691e', wall: 0x546e7a, accent: 0xff8f00, title: 'FORT FLIP' },
      moonbase: { sky: 0x090d1a, fog: 0x090d1a, floorBg: '#37474f', floorLn: '#263238', wall: 0xb0bec5, accent: 0x00e5ff, title: 'MOONBASE (LOW-G)' },
      ruins: { sky: 0xa5d6a7, fog: 0x90caf9, floorBg: '#689f38', floorLn: '#558b2f', wall: 0xbcaaa4, accent: 0xffb300, title: 'RUINS' },
      shipyard: { sky: 0x90a4ae, fog: 0x90a4ae, floorBg: '#455a64', floorLn: '#37474f', wall: 0x0277bd, accent: 0xc62828, title: 'SHIPYARD' },
      shellville: { sky: 0x80deea, fog: 0x80deea, floorBg: '#616161', floorLn: '#424242', wall: 0xefebe9, accent: 0x2e7d32, title: 'SHELLVILLE' },
      twotowers: { sky: 0x64b5f6, fog: 0x64b5f6, floorBg: '#388e3c', floorLn: '#1b5e20', wall: 0x607d8b, accent: 0xf57c00, title: 'TWO TOWERS' },
      bastion: { sky: 0xffcc80, fog: 0xffb74d, floorBg: '#795548', floorLn: '#4e342e', wall: 0x455a64, accent: 0xd32f2f, title: 'BASTION' }
    };

    const t = themes[mapId] || themes.castle;
    displayMapName.textContent = `MAP: ${t.title}`;
    scene.background = new THREE.Color(t.sky);
    scene.fog = new THREE.Fog(t.fog, 30, 125);

    const floorTex = makeGridTexture(t.floorBg, t.floorLn, 16);
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(80, 80),
      new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.85 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    mapGroup.add(floor);

    const boxTex = makeGridTexture('#888888', '#555555', 2);

    function addBlock(x, y, z, w, h, d, colorHex) {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(w, h, d),
        new THREE.MeshStandardMaterial({ color: colorHex, map: boxTex, roughness: 0.65 })
      );
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mapGroup.add(mesh);

      colliders.push({
        minX: x - w / 2,
        maxX: x + w / 2,
        minY: y - h / 2,
        maxY: y + h / 2,
        minZ: z - d / 2,
        maxZ: z + d / 2
      });
    }

    function addRamp(x, z, w, d, yStart, yEnd, axis, colorHex) {
      const steps = 14;
      for (let i = 0; i < steps; i++) {
        const ratio = (i + 1) / steps;
        const h = yStart + (yEnd - yStart) * ratio;
        if (axis === 'z') {
          const stepD = d / steps;
          const sz = z - d / 2 + stepD * (i + 0.5);
          addBlock(x, h / 2, sz, w, h, stepD + 0.05, colorHex);
        } else {
          const stepW = w / steps;
          const sx = x - w / 2 + stepW * (i + 0.5);
          addBlock(sx, h / 2, z, stepW + 0.05, h, d, colorHex);
        }
      }
      ramps.push({
        minX: x - w / 2,
        maxX: x + w / 2,
        minZ: z - d / 2,
        maxZ: z + d / 2,
        yStart,
        yEnd,
        axis
      });
    }

    // Perimeter Fortress Walls
    addBlock(0, 4.5, -40, 82, 9, 2, t.wall);
    addBlock(0, 4.5, 40, 82, 9, 2, t.wall);
    addBlock(-40, 4.5, 0, 2, 9, 82, t.wall);
    addBlock(40, 4.5, 0, 2, 9, 82, t.wall);

    if (mapId === 'castle' || mapId === 'bastion') {
      addBlock(0, 2.25, 0, 14, 4.5, 14, t.wall);
      addBlock(0, 5.2, -6.5, 14, 1.4, 1, t.accent);
      addBlock(0, 5.2, 6.5, 14, 1.4, 1, t.accent);
      addRamp(-11, 0, 8, 5, 0, 4.5, 'x', t.accent);
      addRamp(11, 0, 8, 5, 4.5, 0, 'x', t.accent);
      addBlock(-20, 2, -20, 7, 4, 7, t.wall);
      addBlock(20, 2, 20, 7, 4, 7, t.wall);
      addBlock(-20, 2, 20, 6, 4, 6, t.accent);
      addBlock(20, 2, -20, 6, 4, 6, t.accent);
    } else if (mapId === 'twotowers' || mapId === 'fortflip') {
      addBlock(0, 2.5, -18, 18, 5, 10, t.wall);
      addBlock(0, 2.5, 18, 18, 5, 10, t.wall);
      addBlock(0, 4.75, 0, 6, 0.5, 26, t.accent);
      addRamp(-12, -18, 6, 8, 0, 5, 'z', t.accent);
      addRamp(12, 18, 6, 8, 5, 0, 'z', t.accent);
      addBlock(-14, 1.5, 0, 5, 3, 5, t.wall);
      addBlock(14, 1.5, 0, 5, 3, 5, t.wall);
    } else if (mapId === 'shipyard' || mapId === 'shellville') {
      addBlock(-14, 2, -12, 6, 4, 14, t.wall);
      addBlock(14, 2, 12, 6, 4, 14, t.accent);
      addBlock(-14, 2, 14, 12, 4, 6, t.accent);
      addBlock(14, 2, -14, 12, 4, 6, t.wall);
      addRamp(-14, 0, 5, 10, 0, 4, 'z', t.accent);
      addRamp(14, 0, 5, 10, 4, 0, 'z', t.wall);
      addBlock(0, 1.5, 0, 6, 3, 6, t.wall);
    } else if (mapId === 'blue' || mapId === 'moonbase') {
      addBlock(0, 2, 0, 10, 4, 10, t.accent);
      addBlock(0, 3.75, -15, 24, 0.5, 5, t.wall);
      addBlock(0, 3.75, 15, 24, 0.5, 5, t.wall);
      addRamp(-16, -15, 8, 5, 0, 4, 'x', t.accent);
      addRamp(16, 15, 8, 5, 4, 0, 'x', t.accent);
      addBlock(-22, 1.75, 0, 4, 3.5, 12, t.wall);
      addBlock(22, 1.75, 0, 4, 3.5, 12, t.wall);
    } else {
      addBlock(0, 2, 0, 8, 4, 8, t.accent);
      addBlock(0, 4.5, 0, 4, 1, 4, t.wall);
      addRamp(0, -9, 5, 10, 0, 4, 'z', t.wall);
      addRamp(0, 9, 5, 10, 4, 0, 'z', t.wall);
      addBlock(-16, 2.5, -14, 5, 5, 5, t.wall);
      addBlock(16, 2.5, -14, 5, 5, 5, t.wall);
      addBlock(-16, 2.5, 14, 5, 5, 5, t.wall);
      addBlock(16, 2.5, 14, 5, 5, 5, t.wall);
      addBlock(0, 1.5, -23, 10, 3, 2, t.accent);
      addBlock(0, 1.5, 23, 10, 3, 2, t.accent);
    }
  }

  // SAFE NAMETAG SPRITE (No roundRect compatibility issues)
  function createNameTag(name, color) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    ctx.fillRect(16, 10, 224, 44);
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.strokeRect(16, 10, 224, 44);
    ctx.font = 'bold 26px Segoe UI, sans-serif';
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.fillText(name, 128, 40);

    const tex = new THREE.CanvasTexture(canvas);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true }));
    sprite.scale.set(2.6, 0.65, 1);
    sprite.position.set(0, 1.75, 0);
    return sprite;
  }

  function createEggMesh(player) {
    const group = new THREE.Group();

    const eggGeo = new THREE.SphereGeometry(0.85, 28, 28);
    eggGeo.scale(1, 1.35, 1);
    const eggMat = new THREE.MeshStandardMaterial({
      color: player.color,
      roughness: 0.25,
      metalness: 0.08
    });
    const body = new THREE.Mesh(eggGeo, eggMat);
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    const visor = new THREE.Mesh(
      new THREE.BoxGeometry(0.95, 0.24, 0.35),
      new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.1, metalness: 0.8 })
    );
    visor.position.set(0, 0.35, -0.72);
    group.add(visor);

    const wSpec = WEAPONS[player.weapon] || WEAPONS.eggk47;
    const gun = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 0.22, 1.15),
      new THREE.MeshStandardMaterial({ color: wSpec.color })
    );
    gun.position.set(0.68, 0.05, -0.65);
    group.add(gun);

    group.add(createNameTag(player.name, player.color));
    return group;
  }

  // FIRST-PERSON 3D VIEWMODEL GUN
  const fpGunGroup = new THREE.Group();
  const fpBarrel = new THREE.Mesh(
    new THREE.BoxGeometry(0.13, 0.14, 0.72),
    new THREE.MeshStandardMaterial({ color: 0x37474f, roughness: 0.35 })
  );
  const fpScope = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.04, 0.28, 12),
    new THREE.MeshStandardMaterial({ color: 0x111111 })
  );
  fpScope.rotation.x = Math.PI / 2;
  fpScope.position.set(0, 0.11, -0.05);
  fpGunGroup.add(fpBarrel);
  fpGunGroup.add(fpScope);
  fpGunGroup.position.set(0.32, -0.25, -0.52);
  camera.add(fpGunGroup);
  scene.add(camera);

  // PLAYER CONTROLS & WEAPON MECHANICS
  const keys = {};
  let yaw = 0;
  let pitch = 0;
  let velocityY = 0;
  let isGrounded = true;
  let gameActive = false;
  let isMouseDown = false;
  let isScoped = false;
  let currentAmmo = 30;
  let isReloading = false;
  let lastShotTime = 0;
  let gunRecoil = 0;

  function equipWeapon(wKey) {
    if (!WEAPONS[wKey]) return;
    selectedWeapon = wKey;
    const w = WEAPONS[wKey];
    currentAmmo = w.magSize;
    isReloading = false;
    setScope(false);

    currentWeaponName.textContent = w.name;
    ammoText.textContent = `${currentAmmo} / ${w.magSize}`;
    fpBarrel.material.color.setHex(w.color);
    fpScope.visible = w.scope;

    document.querySelectorAll('.qw-item').forEach((el) => {
      el.classList.toggle('active', el.dataset.weapon === wKey);
    });

    if (gameActive && socket) {
      socket.emit('changeWeapon', wKey);
      quickWeaponBar.classList.add('hidden');
    }
  }

  function setScope(active) {
    const w = WEAPONS[selectedWeapon];
    if (active && w && w.scope && gameActive && document.pointerLockElement === renderer.domElement) {
      isScoped = true;
      camera.fov = w.zoomFov;
      fpGunGroup.visible = false;
      scopeOverlay.classList.remove('hidden');
    } else {
      isScoped = false;
      camera.fov = 75;
      fpGunGroup.visible = true;
      scopeOverlay.classList.add('hidden');
    }
    camera.updateProjectionMatrix();
  }

  window.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if (!gameActive) return;

    if (e.code === 'KeyR') triggerReload();
    if (e.code === 'KeyB') {
      quickWeaponBar.classList.toggle('hidden');
      if (!quickWeaponBar.classList.contains('hidden')) {
        document.exitPointerLock();
      }
    }
    if (e.code.startsWith('Digit')) {
      const idx = Number(e.code.replace('Digit', '')) - 1;
      if (WEAPON_KEYS[idx]) equipWeapon(WEAPON_KEYS[idx]);
    }
  });

  window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
  });

  renderer.domElement.addEventListener('mousedown', (e) => {
    if (!gameActive) return;
    if (document.pointerLockElement !== renderer.domElement) {
      quickWeaponBar.classList.add('hidden');
      renderer.domElement.requestPointerLock();
      return;
    }
    if (e.button === 0) {
      isMouseDown = true;
      tryFireWeapon();
    } else if (e.button === 2) {
      setScope(!isScoped);
    }
  });

  window.addEventListener('mouseup', (e) => {
    if (e.button === 0) isMouseDown = false;
  });

  window.addEventListener('contextmenu', (e) => {
    if (gameActive) e.preventDefault();
  });

  document.addEventListener('pointerlockchange', () => {
    const locked = document.pointerLockElement === renderer.domElement;
    clickPrompt.classList.toggle('hidden', locked);
    if (!locked) {
      isMouseDown = false;
      setScope(false);
    }
  });

  document.addEventListener('mousemove', (e) => {
    if (document.pointerLockElement !== renderer.domElement) return;
    const sens = isScoped ? 0.00085 : 0.0021;
    yaw -= e.movementX * sens;
    pitch -= e.movementY * sens;
    pitch = Math.max(-Math.PI / 2.15, Math.min(Math.PI / 2.15, pitch));
  });

  function triggerReload() {
    const w = WEAPONS[selectedWeapon];
    if (isReloading || currentAmmo >= w.magSize) return;
    isReloading = true;
    setScope(false);
    ammoText.textContent = 'RELOADING...';
    setTimeout(() => {
      currentAmmo = w.magSize;
      isReloading = false;
      ammoText.textContent = `${currentAmmo} / ${w.magSize}`;
    }, w.reloadMs);
  }

  function tryFireWeapon() {
    if (!gameActive || isReloading || !myPlayer || myPlayer.hp <= 0) return;
    const w = WEAPONS[selectedWeapon];
    const now = performance.now();
    if (now - lastShotTime < w.fireRate) return;
    if (currentAmmo <= 0) {
      triggerReload();
      return;
    }

    lastShotTime = now;

    const fireOnce = () => {
      if (currentAmmo <= 0 || !myPlayer || myPlayer.hp <= 0) return;
      currentAmmo--;
      ammoText.textContent = `${currentAmmo} / ${w.magSize}`;
      gunRecoil = 0.14;

      const baseDir = new THREE.Vector3(0, 0, -1).applyEuler(new THREE.Euler(pitch, yaw, 0, 'YXZ')).normalize();
      const origin = camera.position.clone().addScaledVector(baseDir, 0.85);

      for (let p = 0; p < w.pellets; p++) {
        const spreadFactor = isScoped ? w.spread * 0.15 : w.spread;
        const dir = baseDir
          .clone()
          .add(
            new THREE.Vector3(
              (Math.random() - 0.5) * spreadFactor,
              (Math.random() - 0.5) * spreadFactor,
              (Math.random() - 0.5) * spreadFactor
            )
          )
          .normalize();

        spawnProjectile(origin, dir, selectedWeapon, true);
        if (socket) {
          socket.emit('shoot', {
            weapon: selectedWeapon,
            origin: { x: origin.x, y: origin.y, z: origin.z },
            dir: { x: dir.x, y: dir.y, z:
