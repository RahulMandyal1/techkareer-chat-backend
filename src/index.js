import express from "express";
import http from "http";
import { Server as SocketIO } from "socket.io";
import { config } from "./config.js";
import { checkConnection } from "./db.js";
import userRoutes from "./routes/v1/usersRoutes.js";
import cors from "cors";

// import { router as messageRoutes } from "./routes/messages.js";
// import { setupSocket } from "./socket.js";

const app = express();
const server = http.createServer(app);

// Configure CORS to allow all origins
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to the Chat App!");
});

// API versioning
app.use("/api/v1/auth", userRoutes);

const startServer = async () => {
  await checkConnection(); // Ensure the database is connected before starting the server

  server.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`);
  });
};

startServer(); // Start the server
