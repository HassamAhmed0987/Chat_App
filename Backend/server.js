import express from "express";
import http from "node:http";
import cors from "cors";
import dotenv from "dotenv";
import { Server } from "socket.io";

import connectDB from "./src/config/db.js";
import authRoutes from "./src/routes/authRoutes.js";
import messageRoutes from "./src/routes/messageRoutes.js";
import UserRoutes from "./src/routes/userRoutes.js";

import { configureSocket } from "./socket.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(cors({
    origin: process.env.CLIENT_URL
}));

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Chat backend is running"
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", UserRoutes);

// Socket.IO server
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL,
        methods: ["GET", "POST"]
    }
});

// Configure socket events
configureSocket(io);

const startServer = async () => {
    try {
        await connectDB();

        const PORT = process.env.PORT || 3001;

        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Server startup failed:", error.message);
        process.exit(1);
    }
};

startServer();
