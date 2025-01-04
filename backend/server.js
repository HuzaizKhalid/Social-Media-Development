const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./config/db");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

dotenv.config();
connectDB();

const app = express();

// Enhanced session management
const activeUsers = new Map(); // Store active user sessions
const userSockets = new Map(); // Map user IDs to their socket connections

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  },
});

// Enhanced Socket.IO middleware for authentication
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication required"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;

    // Store user's socket connection
    if (!userSockets.has(decoded.id)) {
      userSockets.set(decoded.id, new Set());
    }
    userSockets.get(decoded.id).add(socket.id);

    // Track active user
    activeUsers.set(decoded.id, {
      userId: decoded.id,
      socketId: socket.id,
      lastActive: Date.now(),
    });

    next();
  } catch (err) {
    next(new Error("Authentication failed"));
  }
});

// Import routes
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
const profileRoutes = require("./routes/profileRoutes");
const messageRoutes = require("./routes/messageRoutes");

app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/messages", messageRoutes);

// Enhanced Socket connection handling
io.on("connection", (socket) => {
  console.log("User connected:", socket.userId);

  // Join user to their personal room
  socket.join(socket.userId);

  // Notify others about user's online status
  io.emit("userStatus", {
    userId: socket.userId,
    status: "online",
  });

  socket.on("join", (userId) => {
    if (socket.userId) {
      // Verify authenticated user
      socket.join(userId);
      console.log(`User ${socket.userId} joined room: ${userId}`);
    }
  });

  // Enhanced message handling with proper room management
  socket.on("sendMessage", async (data) => {
    try {
      const { receiver, content } = data;
      const sender = socket.userId; // Use authenticated user ID

      const Message = require("./models/messageModel");
      const newMessage = await Message.create({
        sender,
        receiver,
        content,
        timestamp: new Date(),
      });

      const populatedMessage = await Message.findById(newMessage._id)
        .populate("sender", "name email")
        .populate("receiver", "name email");

      // Send to specific rooms only
      socket.to(receiver).emit("newMessage", populatedMessage);
      socket.emit("newMessage", populatedMessage); // Send to sender

      // Store message in database
      await newMessage.save();
    } catch (error) {
      console.error("Error sending message:", error);
      socket.emit("messageError", { error: "Failed to send message" });
    }
  });

  // Enhanced typing indicator management
  socket.on("typing", ({ receiverId }) => {
    if (socket.userId) {
      socket.to(receiverId).emit("userTyping", { userId: socket.userId });
    }
  });

  socket.on("stopTyping", ({ receiverId }) => {
    if (socket.userId) {
      socket
        .to(receiverId)
        .emit("userStoppedTyping", { userId: socket.userId });
    }
  });

  // Enhanced disconnect handling
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.userId);

    if (socket.userId) {
      // Remove socket from user's socket set
      const userSocketSet = userSockets.get(socket.userId);
      if (userSocketSet) {
        userSocketSet.delete(socket.id);
        if (userSocketSet.size === 0) {
          userSockets.delete(socket.userId);
          activeUsers.delete(socket.userId);

          // Notify others about user's offline status
          io.emit("userStatus", {
            userId: socket.userId,
            status: "offline",
          });
        }
      }
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || "Something went wrong!" });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
