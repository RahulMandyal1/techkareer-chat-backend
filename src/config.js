import dotenv from "dotenv";

dotenv.config();

export const config = {
  dbPort: process.env.DB_PORT,
  port: process.env.PORT || 3000,
};
