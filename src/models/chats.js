import { pgTable, serial, timestamp } from "drizzle-orm/pg-core";

export const chats = pgTable("chats", {
  chatId: serial("chat_id").primaryKey(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});