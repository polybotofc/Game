const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const fs = require('fs');
const path = require('path');

const app = express();
const server = createServer(app);
const io = new Server(server);

let secretNumber = Math.floor(Math.random() * 100) + 1;

io.on('connection', (socket) => {
  console.log('Connected:', socket.id);
  socket.emit('message', 'Tebak angka antara 1 - 100!');

  socket.on('guess', (num) => {
    const number = parseInt(num);
    if (number === secretNumber) {
      io.emit('message', `🎉 ${socket.id.slice(0,5)} menang! Angkanya: ${secretNumber}`);
      secretNumber = Math.floor(Math.random() * 100) + 1;
    } else if (number < secretNumber) {
      socket.emit('message', 'Terlalu kecil!');
    } else {
      socket.emit('message', 'Terlalu besar!');
    }
  });

  socket.on('disconnect', () => {
    console.log('Disconnected:', socket.id);
  });
});

app.get('/', (req, res) => {
  const file = path.join(__dirname, 'index.html');
  res.setHeader('Content-Type', 'text/html');
  res.send(fs.readFileSync(file, 'utf8'));
});

module.exports = (req, res) => {
  if (!res.socket.server.io) {
    server.listen(0, () => {
      console.log('Server started');
    });
    res.socket.server.io = io;
  }
  res.end('Multiplayer game running');
};