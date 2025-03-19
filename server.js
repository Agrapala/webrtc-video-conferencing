const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
    console.log('a user connected');

    // Handle WebRTC signaling
    socket.on('offer', (offer) => {
        socket.broadcast.emit('offer', offer); // Send offer to other users
    });

    socket.on('answer', (answer) => {
        socket.broadcast.emit('answer', answer); // Send answer to other users
    });

    socket.on('candidate', (candidate) => {
        socket.broadcast.emit('candidate', candidate); // Send ICE candidate to other users
    });

    // Handle chat messages
    socket.on('chat message', (msg) => {
        io.emit('chat message', msg); // Broadcast chat message to all users
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});