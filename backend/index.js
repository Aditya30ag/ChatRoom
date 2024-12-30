const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3001",
    methods: ["GET", "POST"]
  }
});

// Store users with their socket IDs
const users = new Map();

// Helper function to get array of active usernames
const getActiveUsers = () => Array.from(users.values());

// Helper function to broadcast active users to all clients
const broadcastActiveUsers = () => {
  io.emit('activeUsers', getActiveUsers());
};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", (username) => {
    // Store the new user
    users.set(socket.id, username);

    // Emit join message
    io.emit("userJoined", {
      user: username,
      message: `${username} has joined the chat`,
      timestamp: new Date(),
    });

    // Broadcast updated active users list
    broadcastActiveUsers();
  });

  socket.on("message", (message) => {
    const username = users.get(socket.id);
    io.emit("message", {
      user: username,
      text: message,
      timestamp: new Date(),
    });
  });

  socket.on("typing", (isTyping) => {
    const username = users.get(socket.id);
    socket.broadcast.emit("userTyping", { user: username, isTyping });
  });

  socket.on("dis", () => {
    const username = users.get(socket.id);
    if (username) {
      // Remove user and broadcast their departure
      users.delete(socket.id);
      io.emit("userLeft", {
        user: username,
        message: `${username} has left the chat`,
        timestamp: new Date(),
      });
      // Broadcast updated active users list
      broadcastActiveUsers();
    }
  });

  socket.on("disconnect", () => {
    const username = users.get(socket.id);
    if (username) {
      // Remove user and broadcast their departure
      users.delete(socket.id);
      io.emit("userLeft", {
        user: username,
        message: `${username} has left the chat`,
        timestamp: new Date(),
      });
      // Broadcast updated active users list
      broadcastActiveUsers();
    }
  });

  // Send initial active users list to newly connected client
  socket.emit('activeUsers', getActiveUsers());
});

const PORT = 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});