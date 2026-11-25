const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

const rooms = {};
const MATCH_DURATION = 180; // 3 minutes in seconds

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return rooms[code] ? generateRoomCode() : code;
}

function getRandomSpawn() {
  const spawns = [
    { x: -18, y: 1.5, z: -18 },
    { x: 18, y: 1.5, z: 18 },
    { x: -18, y: 1.5, z: 18 },
    { x: 18, y: 1.5, z: -18 },
    { x: 0, y: 1.5, z: -22 },
    { x: 0, y: 1.5, z: 22 }
  ];
  return spawns[Math.floor(Math.random() * spawns.length)];
}

io.on('connection', (socket) => {
  let currentRoom = null;

  socket.on('createRoom', ({ name, color }) => {
    const code = generateRoomCode();
    const spawn = getRandomSpawn();
    rooms[code] = {
      code,
      timeLeft: MATCH_DURATION,
      players: {},
      interval: null
    };

    rooms[code].players[socket.id] = {
      id: socket.id,
      name: (name || 'Player').slice(0, 14),
      color: color || '#ff5252',
      x: spawn.x,
      y: spawn.y,
      z: spawn.z,
      ry: 0,
      hp: 100,
      kills: 0,
      deaths: 0
    };

    currentRoom = code;
    socket.join(code);

    // Start room match countdown
    rooms[code].interval = setInterval(() => {
      const room = rooms[code];
      if (!room) return;
      room.timeLeft--;
      io.to(code).emit('timerUpdate', room.timeLeft);

      if (room.timeLeft <= 0) {
        io.to(code).emit('matchOver', Object.values(room.players));
        // Reset match after 8 seconds
        room.timeLeft = MATCH_DURATION;
        Object.values(room.players).forEach((p) => {
          const s = getRandomSpawn();
          p.hp = 100;
          p.kills = 0;
          p.deaths = 0;
          p.x = s.x;
          p.y = s.y;
          p.z = s.z;
        });
        setTimeout(() => {
          if (rooms[code]) {
            io.to(code).emit('matchReset', rooms[code].players);
          }
        }, 8000);
      }
    }, 1000);

    socket.emit('roomJoined', {
      code,
      playerId: socket.id,
      players: rooms[code].players,
      timeLeft: rooms[code].timeLeft
    });
  });

  socket.on('joinRoom', ({ code, name, color }) => {
    const cleanCode = (code || '').trim().toUpperCase();
    const room = rooms[cleanCode];

    if (!room) {
      socket.emit('joinError', 'Room not found! Check the 4-letter code.');
      return;
    }

    const spawn = getRandomSpawn();
    room.players[socket.id] = {
      id: socket.id,
      name: (name || 'Player').slice(0, 14),
      color: color || '#448aff',
      x: spawn.x,
      y: spawn.y,
      z: spawn.z,
      ry: 0,
      hp: 100,
      kills: 0,
      deaths: 0
    };

    currentRoom = cleanCode;
    socket.join(cleanCode);

    socket.emit('roomJoined', {
      code: cleanCode,
      playerId: socket.id,
      players: room.players,
      timeLeft: room.timeLeft
    });

    socket.to(cleanCode).emit('playerJoined', room.players[socket.id]);
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
      origin: shotData.origin,
      dir: shotData.dir
    });
  });

  socket.on('hitPlayer', ({ targetId, damage }) => {
    if (!currentRoom || !rooms[currentRoom]) return;
    const room = rooms[currentRoom];
    const target = room.players[targetId];
    const shooter = room.players[socket.id];
    if (!target || !shooter || target.hp <= 0) return;

    target.hp = Math.max(0, target.hp - (damage || 25));

    if (target.hp === 0) {
      shooter.kills += 1;
      target.deaths += 1;
      const respawn = getRandomSpawn();

      io.to(currentRoom).emit('playerKilled', {
        killerId: shooter.id,
        killerName: shooter.name,
        victimId: target.id,
        victimName: target.name,
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
  console.log(`Egg Shockers Multiplayer running on port ${PORT}`);
});
