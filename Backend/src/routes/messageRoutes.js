import express from "express";
import {
    getConversation,
    sendMessage
} from "../controllers/messageController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/:userId", authenticate, getConversation);
router.post("/", authenticate, sendMessage);

export default router;
