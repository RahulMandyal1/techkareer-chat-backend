// src/routes/chatRoutes.js

import express from "express";
import {
  getMessages,
  initiateChat,
  sendMessage,
} from "../../controllers/chatsController.js";

const router = express.Router();

// Route to initiate a chat between two users
router.post("/initiate", initiateChat);

// Route to get messages for a specific chat
router.get("/:chatId", getMessages);

// Route to send a message in a specific chat
router.post("/:chatId/send", sendMessage);

export default router;
