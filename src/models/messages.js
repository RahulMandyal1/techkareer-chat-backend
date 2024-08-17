import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";
import { users } from "./users";

export const messages = pgTable("messages", {
  messageId: serial("message_id").primaryKey(),
  content: text("content").notNull(),
  senderId: integer("sender_id")
    .references(() => users.userId)
    .notNull(),
  receiverId: integer("receiver_id")
    .references(() => users.userId)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
