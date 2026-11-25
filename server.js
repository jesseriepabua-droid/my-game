const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
  pingInterval: 10000,
  pingTimeout: 5000
});

app.use(express.static(path.join(__dirname, 'public')));

const rooms = {};
const VALID_DURATIONS = [180, 300, 480];
const VALID_MAPS = [
  'castle', 'blue', 'dirt', 'fortflip', 'moonbase',
  'ruins', 'shipyard', 'shellville', 'twotowers', 'bastion'
];

const SPAWN_POINTS = [
  { x: -24, y: 2.0, z: -24 },
  { x: 24, y: 2.0, z: 24 },
  { x: -24, y: 2.0, z: 24 },
  { x: 24, y: 2.0, z: -24 },
  { x: 0, y: 2.0, z: -26 },
  { x: 0, y: 2.0, z: 26 },
  { x: -26, y: 2.0, z: 0 },
  { x: 26, y: 2.0, z: 0 }
];

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return rooms[code] ? generateRoomCode() : code;
}

function getRandomSpawn() {
  return SPAWN_POINTS[Math.floor(Math.random() * SPAWN_POINTS.length)];
}

io.on('connection', (socket) => {
  let currentRoom = null;

  socket.on('createRoom', ({ name, color, weapon, mapId, duration }) => {
    const code = generateRoomCode();
    const spawn = getRandomSpawn();
    const chosenDuration = VALID_DURATIONS.includes(Number(duration)) ? Number(duration) : 180;
    const chosenMap = VALID_MAPS.includes(mapId) ? mapId : 'castle';

    rooms[code] = {
      code,
      mapId: chosenMap,
      duration: chosenDuration,
      timeLeft: chosenDuration,
      state: 'playing',
      players: {},
      interval: null
    };

    rooms[code].players[socket.id] = {
      id: socket.id,
      name: (name || 'EggWarrior').trim().slice(0, 14) || 'EggWarrior',
      color: color || '#ff5252',
      weapon: weapon || 'eggk47',
      x: spawn.x,
      y: spawn.y,
      z: spawn.z,
      ry: 0,
      hp: 100,
      kills: 0,
      deaths: 0,
      score: 0
    };

    currentRoom = code;
    socket.join(code);

    rooms[code].interval = setInterval(() => {
      const room = rooms[code];
      if (!room || room.state !== 'playing') return;

      room.timeLeft--;
      io.to(code).emit('timerUpdate', room.timeLeft);

      if (room.timeLeft <= 0) {
        room.state = 'ended';
        const rankings = Object.values(room.players).sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score;
          if (b.kills !== a.kills) return b.kills - a.kills;
          return a.deaths - b.deaths;
        });

        io.to(code).emit('matchOver', { rankings });

        setTimeout(() => {
          if (!rooms[code]) return;
          room.timeLeft = room.duration;
          room.state = 'playing';
          Object.values(room.players).forEach((p) => {
            const s = getRandomSpawn();
            p.hp = 100;
            p.kills = 0;
            p.deaths = 0;
            p.score = 0;
            p.x = s.x;
            p.y = s.y;
            p.z = s.z;
          });
          io.to(code).emit('matchReset', {
            players: room.players,
            timeLeft: room.timeLeft
          });
        }, 10000);
      }
    }, 1000);

    socket.emit('roomJoined', {
      code,
      mapId: room.mapId,
      playerId: socket.id,
      players: rooms[code].players,
      timeLeft: rooms[code].timeLeft
    });
  });

  socket.on('joinRoom', ({ code, name, color, weapon }) => {
    const cleanCode = (code || '').trim().toUpperCase();
    const room = rooms[cleanCode];

    if (!room) {
      socket.emit('joinError', `Room "${cleanCode}" not found! Check the 4-letter code.`);
      return;
    }

    const spawn = getRandomSpawn();
    room.players[socket.id] = {
      id: socket.id,
      name: (name || 'EggWarrior').trim().slice(0, 14) || 'EggWarrior',
      color: color || '#448aff',
      weapon: weapon || 'eggk47',
      x: spawn.x,
      y: spawn.y,
      z: spawn.z,
      ry: 0,
      hp: 100,
      kills: 0,
      deaths: 0,
      score: 0
    };

    currentRoom = cleanCode;
    socket.join(cleanCode);

    socket.emit('roomJoined', {
      code: cleanCode,
      mapId: room.mapId,
      playerId: socket.id,
      players: room.players,
      timeLeft: room.timeLeft
    });

    socket.to(cleanCode).emit('playerJoined', room.players[socket.id]);
  });

  socket.on('changeWeapon', (weapon) => {
    if (!currentRoom || !rooms[currentRoom]) return;
    const player = rooms[currentRoom].players[socket.id];
    if (!player) return;
    player.weapon = weapon;
    socket.to(currentRoom).emit('playerWeaponChanged', { id: socket.id, weapon });
  });

  socket.on('move', (data) => {
    if (!currentRoom || !rooms[currentRoom]) return;
    const player = rooms[currentRoom].players[socket.id];
    if (!player) return;

    player.x = data.x;
    player.y = data.y;
    player.z = data.z;
    player.ry = data.ry;

    socket.to(currentRoom).emit('playerMoved', {
      id: socket.id,
      x: data.x,
      y: data.y,
      z: data.z,
      ry: data.ry
    });
  });

  socket.on('shoot', (shotData) => {
    if (!currentRoom || !rooms[currentRoom]) return;
    socket.to(currentRoom).emit('playerShot', {
      id: socket.id,
      weapon: shotData.weapon,
      origin: shotData.origin,
      dir: shotData.dir
    });
  });

  socket.on('hitPlayer', ({ targetId, damage, weapon }) => {
    if (!currentRoom || !rooms[currentRoom]) return;
    const room = rooms[currentRoom];
    if (room.state !== 'playing') return;

    const target = room.players[targetId];
    const shooter = room.players[socket.id];
    if (!target || !shooter || target.hp <= 0) return;

    const dmg = Math.min(200, Math.max(1, Number(damage) || 25));
    target.hp = Math.max(0, target.hp - dmg);

    if (target.hp === 0) {
      shooter.kills += 1;
      shooter.score += 100;
      target.deaths += 1;
      const respawn = getRandomSpawn();

      io.to(currentRoom).emit('playerKilled', {
        killerId: shooter.id,
        killerName: shooter.name,
        victimId: target.id,
        victimName: target.name,
        weapon: weapon || shooter.weapon,
        players: room.players
      });

      setTimeout(() => {
        if (rooms[currentRoom] && rooms[currentRoom].players[targetId]) {
          target.hp = 100;
          target.x = respawn.x;
          target.y = respawn.y;
          target.z = respawn.z;
          io.to(currentRoom).emit('playerRespawned', target);
        }
      }, 2500);
    } else {
      io.to(currentRoom).emit('playerDamaged', {
        targetId: target.id,
        hp: target.hp
      });
    }
  });

  socket.on('disconnect', () => {
    if (currentRoom && rooms[currentRoom]) {
      delete rooms[currentRoom].players[socket.id];
      io.to(currentRoom).emit('playerLeft', socket.id);

      if (Object.keys(rooms[currentRoom].players).length === 0) {
        clearInterval(rooms[currentRoom].interval);
        delete rooms[currentRoom];
      }
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Shell Shockers 3D Multiplayer running on port ${PORT}`);
});