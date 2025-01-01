const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const dotenv = require("dotenv");
const path = require("path");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3001",
    methods: ["GET", "POST"]
  }
});

// Load environment variables
dotenv.config({ path: path.join(__dirname, "./.env") });

// Database connection
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

// Store active users and their room assignments
const users = new Map(); // socketId -> { username, roomId }
const rooms = new Map(); // roomId -> Set of socket IDs

// Helper function to get active users in a specific room
const getActiveUsersInRoom = (roomId) => {
  const roomUsers = [];
  const socketIds = rooms.get(roomId) || new Set();
  for (const socketId of socketIds) {
    const userInfo = users.get(socketId);
    if (userInfo) {
      roomUsers.push(userInfo.username);
    }
  }
  return roomUsers;
};

// Helper function to broadcast active users to a specific room
const broadcastActiveUsersToRoom = (roomId) => {
  io.to(roomId).emit('activeUsers', getActiveUsersInRoom(roomId));
};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Handle room join request with authentication
  socket.on("joinRoom", async ({ roomId, username, password }) => {
    try {
      // Verify room credentials
      const [rows] = await pool.execute(
        'SELECT * FROM user WHERE roomId = ?',
        [roomId]
      );

      if (rows.length === 0) {
        socket.emit('joinError', 'Room not found');
        return;
      }

      const roomData = rows[0];
      const passwordMatch = await bcrypt.compare(password, roomData.password);

      if (!passwordMatch) {
        socket.emit('joinError', 'Invalid password');
        return;
      }

      // Leave previous room if any
      const previousUserInfo = users.get(socket.id);
      if (previousUserInfo) {
        const previousRoom = previousUserInfo.roomId;
        socket.leave(previousRoom);
        rooms.get(previousRoom)?.delete(socket.id);
        broadcastActiveUsersToRoom(previousRoom);
      }

      // Join new room
      socket.join(roomId);
      users.set(socket.id, { username, roomId });
      
      // Initialize room Set if it doesn't exist
      if (!rooms.has(roomId)) {
        rooms.set(roomId, new Set());
      }
      rooms.get(roomId).add(socket.id);

      // Notify room about new user
      io.to(roomId).emit("userJoined", {
        user: username,
        message: `${username} has joined the room`,
        timestamp: new Date(),
      });

      // Send join confirmation to user
      socket.emit('joinSuccess', {
        roomId,
        username,
        message: `Successfully joined room ${roomId}`
      });

      // Broadcast updated active users list to room
      broadcastActiveUsersToRoom(roomId);

    } catch (error) {
      console.error('Join room error:', error);
      socket.emit('joinError', 'Server error occurred');
    }
  });

  // Handle chat messages within rooms
  socket.on("message", (message) => {
    const userInfo = users.get(socket.id);
    if (userInfo) {
      io.to(userInfo.roomId).emit("message", {
        user: userInfo.username,
        text: message,
        timestamp: new Date(),
      });
    }
  });

  // Handle typing status within rooms
  socket.on("typing", (isTyping) => {
    const userInfo = users.get(socket.id);
    if (userInfo) {
      socket.to(userInfo.roomId).emit("userTyping", {
        user: userInfo.username,
        isTyping
      });
    }
  });

  // Handle manual disconnection
  socket.on("leaveRoom", () => {
    handleUserDisconnect(socket);
  });

  // Handle socket disconnection
  socket.on("disconnect", () => {
    handleUserDisconnect(socket);
  });
});

// Helper function to handle user disconnection
function handleUserDisconnect(socket) {
  const userInfo = users.get(socket.id);
  if (userInfo) {
    const { username, roomId } = userInfo;
    // Remove user from room
    rooms.get(roomId)?.delete(socket.id);
    // Remove user from users map
    users.delete(socket.id);
    // Notify room about user leaving
    io.to(roomId).emit("userLeft", {
      user: username,
      message: `${username} has left the room`,
      timestamp: new Date(),
    });
    // Broadcast updated active users list to room
    broadcastActiveUsersToRoom(roomId);
  }
}

const PORT = 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});