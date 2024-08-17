import { pgTable, int, timestamp } from "drizzle-orm/pg-core";

export const chats = pgTable("chats", {
  chatId: int("chatId").primaryKey(), // Changed to int
  createdAt: timestamp("created_at").defaultNow(), // Creation timestamp
});
