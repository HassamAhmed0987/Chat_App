import express from "express";
import { getMe, getAllUsers } from "../controllers/userController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/me", authenticate, getMe);
router.get("/", authenticate, getAllUsers);

export default router;