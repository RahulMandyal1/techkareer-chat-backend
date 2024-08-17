import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";
import { users } from "./users.js";

export const messages = pgTable("messages", {
  messageId: serial("message_id").primaryKey(),
  content: text("content").notNull(),
  fromUserId: integer("from_user_id")
    .references(() => users.userId)
    .notNull(),
  toUserId: integer("to_user_id")
    .references(() => users.userId)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
