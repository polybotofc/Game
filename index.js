const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const fs = require('fs');
const path = require('path');

const app = express();
const server = createServer(app);
const io = new Server(server);

let secretNumber = Math.floor(Math.random() * 100) + 1;

// Serve index.html at "/"
app.get('/', (req, res) => {
  const filePath = path.join(__dirname, 'index.html');
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.status(500).send('Failed to load page');
    } else {
      res.setHeader('Content-Type', 'text/html');
      res.end(data);
    }
  });
});

// Socket.io logic
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
});

// Vercel handler
module.exports = (req, res) => {
  if (!res.socket.server.io) {
    server.listen(0, () => console.log('Socket server started'));
    res.socket.server.io = io;
  }

  app(req, res); // <- Ini penting: jalankan Express app!
};