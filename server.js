/**
 * THE TETHER // P2P MULTIPLAYER SERVER
 * Logic: Pairing strangers into high-stakes dependencies.
 */

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let waitingPlayer = null;

io.on('connection', (socket) => {
    console.log(`User Connected: ${socket.id}`);

    // --- PAIRING LOGIC (The Lobby) ---
    if (waitingPlayer) {
        // Create a unique Room ID for the two strangers
        const roomId = `room_${waitingPlayer.id}_${socket.id}`;
        
        socket.join(roomId);
        waitingPlayer.join(roomId);

        // Notify both players they are now Tethered
        io.to(roomId).emit('TETHER_ESTABLISHED', {
            partnerId: socket.id,
            roomId: roomId
        });

        console.log(`Link Created: ${roomId}`);
        waitingPlayer = null; 
    } else {
        waitingPlayer = socket;
        socket.emit('SEARCHING_FOR_PARTNER');
    }

    // --- THE COOPERATION BRIDGE ---
    // When Player A sends a "PULSE", Player B receives health
    socket.on('SEND_PULSE', (data) => {
        socket.to(data.roomId).emit('RECEIVE_PULSE', {
            amount: 15, // The health boost
            from: socket.id
        });
    });

    // --- THE DISCONNECT (Game Theory: Punishment) ---
    socket.on('disconnect', () => {
        console.log(`User Disconnected: ${socket.id}`);
        // In a real implementation, we would find the room and notify the partner
        io.emit('PARTNER_DISCONNECTED', { id: socket.id });
        
        if (waitingPlayer === socket) {
            waitingPlayer = null;
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`THE TETHER SERVER RUNNING ON PORT ${PORT}`);
});
