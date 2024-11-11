import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import ngrok from '@ngrok/ngrok';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const app = express();
const server = createServer(app);
const io = new Server(server);

// Resolve __dirname in ES modules
const __dirname = dirname(fileURLToPath(import.meta.url));

// Serve the HTML file for the frontend
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

// Socket.IO event handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('chat message', (msg) => {
    console.log('Message received:', msg);
    io.emit('chat message', msg); // Broadcast message to all clients
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Start the server and Ngrok
(async () => {
  try {
    await ngrok.authtoken('2kku5nLgkIYAy7OswuJy0BQx6R2_3mp48C8N3n5JBkVu4dn57'); // Replace with your Ngrok auth token
    const url = await ngrok.connect(3000); // Connect Ngrok to port 3000
    console.log(`Ngrok public URL: ${url}`);

    // Pass Ngrok URL to the frontend
    app.get('/ngrok-url', (req, res) => {
      res.json({ url });
    });
  } catch (error) {
    console.error('Error starting Ngrok:', error);
  }
})();

// Start the server
server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
