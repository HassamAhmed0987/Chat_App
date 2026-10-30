
import mongoose from "mongoose";
import Message from "../models/message.js";
import User from "../models/user.js";

export const getConversation = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user._id;

        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID"
            });
        }

        if (currentUserId.toString() === userId) {
            return res.status(400).json({
                success: false,
                message: "Cannot start a conversation with yourself"
            });
        }

        const otherUser = await User.findById(userId).select("_id");

        if (!otherUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const messages = await Message.find({
            $or: [
                { sender: currentUserId, receiver: userId },
                { sender: userId, receiver: currentUserId }
            ]
        })
            .sort({ createdAt: 1 })
            .limit(100);

        return res.status(200).json({
            success: true,
            count: messages.length,
            data: messages
        });

    } catch (error) {
        console.error("Get conversation error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


export const sendMessage = async (req, res) => {
    try {
        console.log(req.body);
        
        const { receiverId, text } = req.body;
        const senderId = req.user._id;

        if (!receiverId || !text?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Receiver ID and message text are required"
            });
        }

        if (!mongoose.isValidObjectId(receiverId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid receiver ID"
            });
        }

        if (senderId.toString() === receiverId) {
            return res.status(400).json({
                success: false,
                message: "You cannot send a message to yourself"
            });
        }

        if (text.trim().length > 2000) {
            return res.status(400).json({
                success: false,
                message: "Message cannot exceed 2000 characters"
            });
        }

        const receiver = await User.findById(receiverId).select("_id");

        if (!receiver) {
            return res.status(404).json({
                success: false,
                message: "Receiver not found"
            });
        }

        const message = await Message.create({
            sender: senderId,
            receiver: receiverId,
            text: text.trim()
        });

        return res.status(201).json({
            success: true,
            message: "Message sent successfully",
            data: message
        });

    } catch (error) {
        console.error("Send message error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};
