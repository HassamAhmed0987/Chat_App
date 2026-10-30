import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "./src/models/user.js";
import Message from "./src/models/message.js";

export const configureSocket = (io) => {
  // Socket authentication
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error("Authentication required"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.userId).select(
        "_id name email"
      );

      if (!user) {
        return next(new Error("User not found"));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    const senderId = socket.user._id.toString();

    // Har user ka private room
    socket.join(`user:${senderId}`);

    console.log(`${socket.user.name} connected: ${socket.id}`);

    // Real-time message send karna
    socket.on("send_message", async (payload, callback) => {
      try {
        const respond = (result) => {
          if (typeof callback === "function") {
            callback(result);
          }
        };

        const { receiverId, text } = payload || {};

        if (
          !receiverId ||
          !mongoose.Types.ObjectId.isValid(receiverId)
        ) {
          return respond({
            success: false,
            message: "Valid receiver ID is required",
          });
        }

        const cleanText =
          typeof text === "string" ? text.trim() : "";

        if (!cleanText || cleanText.length > 2000) {
          return respond({
            success: false,
            message: "Message must contain 1–2000 characters",
          });
        }

        if (receiverId === senderId) {
          return respond({
            success: false,
            message: "You cannot message yourself",
          });
        }

        const receiver = await User.findById(receiverId).select("_id");

        if (!receiver) {
          return respond({
            success: false,
            message: "Receiver not found",
          });
        }

        // Message pehle database mein save hoga
        const message = await Message.create({
          sender: socket.user._id,
          receiver: receiver._id,
          text: cleanText,
        });

        const savedMessage = message.toObject();

        // Receiver ke connected devices ko message bhejo
        io.to(`user:${receiverId}`).emit(
          "receive_message",
          savedMessage
        );

        // Sender ko confirmation
        socket.emit("message_sent", savedMessage);

        respond({
          success: true,
          message: "Message sent successfully",
          data: savedMessage,
        });
      } catch (error) {
        console.error("Socket message error:", error.message);

        if (typeof callback === "function") {
          callback({
            success: false,
            message: "Failed to send message",
          });
        }
      }
    });

    socket.on("disconnect", () => {
      console.log(`${socket.user.name} disconnected`);
    });
  });
};
