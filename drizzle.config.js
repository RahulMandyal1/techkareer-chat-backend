import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";

config({ path: ".env" });

export default defineConfig({
  schema: "./src/models/schema.js",
  out: "./supabase/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
