// src/controllers/chatController.js

import { db } from "../db.js";
import { chats } from "../models/chats.js";
import { messages } from "../models/messages.js";
import { chatMessages } from "../models/chatMessages.js";
import { users } from "../models/users.js";

// Initiate a chat between two users and send the first message
export const initiateChat = async (req, res) => {
  const { user1Id, user2Id, messageContent } = req.body;

  try {
    // Create a new chat
    const chatResult = await db.insert(chats).values({}).returning();

    const chatId = chatResult[0].id;

    // Insert the first message into the messages table
    const messageResult = await db
      .insert(messages)
      .values({
        content: messageContent,
        senderId: user1Id,
        receiverId: user2Id,
      })
      .returning();

    const messageId = messageResult[0].messageId;

    // Link the message with the chat
    await db
      .insert(chatMessages)
      .values({
        chatId,
        messageId,
      })
      .returning();

    res.status(201).json({ chatId, message: messageResult[0] });
  } catch (error) {
    console.error("Error initiating chat and sending message:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// src/controllers/chatController.js

// Get messages for a specific chat
export const getMessages = async (req, res) => {
  const { chatId } = req.params;

  try {
    // Retrieve message IDs associated with the chat
    const chatMessagesList = await db
      .select(chatMessages)
      .where(chatMessages.chatId.equals(chatId))
      .execute();

    // Fetch messages based on the retrieved IDs
    const messageIds = chatMessagesList.map((entry) => entry.messageId);
    const messagesList = await db
      .select(messages)
      .where(messages.messageId.in(messageIds))
      .orderBy(messages.createdAt.asc())
      .execute();

    res.status(200).json(messagesList);
  } catch (error) {
    console.error("Error getting messages:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// src/controllers/chatController.js

// Send a message in a specific chat
export const sendMessage = async (req, res) => {
  const { chatId } = req.params;
  const { userId, content } = req.body;

  try {
    // Insert the new message into the messages table
    const newMessage = await db
      .insert(messages)
      .values({
        content,
        senderId: userId,
        receiverId: userId, // This should be the receiver's ID, which might be different
      })
      .returning();

    const newMessageId = newMessage[0].messageId;

    // Link the new message with the chat
    await db
      .insert(chatMessages)
      .values({
        chatId,
        messageId: newMessageId,
      })
      .returning();

    // Update the last message for the chat
    await db
      .update(chats)
      .set({ lastMessage: content })
      .where(chats.id.equals(chatId))
      .execute();

    res.status(201).json(newMessage[0]);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
