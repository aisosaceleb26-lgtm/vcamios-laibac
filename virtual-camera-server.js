// Simple Node server to relay gallery frames from phone to desktop via WebSocket
// Usage:
// 1. Install dependencies: npm install express ws
// 2. Run: node virtual-camera-server.js
// 3. Open http://<desktop-ip>:3000/phone.html on phone and http://localhost:3000/desktop.html on desktop

const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Serve static files from this directory
app.use(express.static(path.join(__dirname)));

wss.on('connection', (ws) => {
  console.log('WebSocket client connected');
  ws.on('message', (msg) => {
    // Broadcast to all clients except sender
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(msg);
      }
    });
  });
  ws.on('close', () => console.log('WebSocket client disconnected'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
