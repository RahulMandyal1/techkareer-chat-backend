import { pgTable, serial, primaryKey } from "drizzle-orm/pg-core";
import { chats } from "./chats";
import { messages } from "./messages";

export const chatMessages = pgTable(
  "chat_messages",
  {
    chatId: serial("chatId")
      .references(() => chats.chatId)
      .notNull(), // Foreign key reference to the chat
    messageId: serial("messageId")
      .references(() => messages.messageId)
      .notNull(), // Foreign key reference to the message
  },
  (table) => ({
    primaryKey: primaryKey([table.chatId, table.messageId]), // Composite primary key
  })
);
