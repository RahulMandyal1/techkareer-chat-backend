import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";
import { users } from "./users";

export const messages = pgTable("messages", {
  messageId: serial("message_id").primaryKey(),
  content: text("content").notNull(),
  from: integer("from_user_id")
    .references(() => users.userId)
    .notNull(),
  to: integer("to_user_id")
    .references(() => users.userId)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});