import express from "express";
import { getMessages } from "../controllers/messagesController.js";

const router = express.Router();

router.get("/:chatId", getMessages);

export const getMessages = async (req, res) => {
  const { userId, chatWithId, page, limit = 10, firstTime = false } = req.query;

  try {
    let messagesResult, totalMessages;

    if (firstTime || !page) {
      // If firstTime flag is true or page is not provided, fetch the most recent messages and calculate the total pages
      totalMessages = await db
        .select({ count: sql`count(*)` })
        .from(messages)
        .where(
          eq(messages.senderId, userId)
            .and(eq(messages.receiverId, chatWithId))
            .or(
              eq(messages.senderId, chatWithId).and(
                eq(messages.receiverId, userId)
              )
            )
        )
        .single();

      const totalPages = Math.ceil(totalMessages.count / limit);
      messagesResult = await db
        .select()
        .from(messages)
        .where(
          eq(messages.senderId, userId)
            .and(eq(messages.receiverId, chatWithId))
            .or(
              eq(messages.senderId, chatWithId).and(
                eq(messages.receiverId, userId)
              )
            )
        )
        .orderBy(messages.createdAt.desc())
        .limit(limit);

      res.status(200).json({
        message: "Messages retrieved successfully",
        messages: messagesResult,
        page: totalPages, // Send the last page number
        hasMore: totalMessages.count > limit,
      });
    } else {
      // Handle pagination normally if firstTime flag is not set and page is provided
      const offset = (page - 1) * limit;
      messagesResult = await db
        .select()
        .from(messages)
        .where(
          eq(messages.senderId, userId)
            .and(eq(messages.receiverId, chatWithId))
            .or(
              eq(messages.senderId, chatWithId).and(
                eq(messages.receiverId, userId)
              )
            )
        )
        .orderBy(messages.createdAt.desc())
        .limit(limit)
        .offset(offset);

      res.status(200).json({
        message: "Messages retrieved successfully",
        messages: messagesResult,
        page,
        hasMore: messagesResult.length === limit,
      });
    }
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Failed to retrieve messages" });
  }
};

export { router };
