import { db } from "./db.js";
import { messages } from "./models/messages.js";

const activeUsers = [];

export const setupSocket = (io) => {
  io.use((socket, next) => {
    const userId = socket.handshake?.auth?.userId;
    if (!userId) {
      return next(new Error("Invalid user"));
    }
    socket.userId = userId;
    next();
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.userId);

    // Add user to the active users array
    activeUsers.push({ socketId: socket.id, userId: socket.userId });

    console.log(activeUsers.values());

    // Emit the list of active users to the client
    io.emit("active users", Array.from(activeUsers.values()));

    socket.on("private message", async ({ content, toUserId }) => {
      const message = {
        content,
        fromUserId: socket.userId,
        toUserId: toUserId,
      };

      console.log(message);
      try {
        const [createdMessage] = await db
          .insert(messages)
          .values(message)
          .returning();

        // Emit only to the recipient
        const recipient = activeUsers.find((user) => user.userId === toUserId);
        if (recipient) {
          io.to(recipient.socketId).emit("private message", {
            ...createdMessage,
          });
        }
      } catch (error) {
        console.error("Error inserting message:", error);
        // You might want to emit an error event to the client here
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.userId);
      // Remove user from the active users array
      const index = activeUsers.findIndex(
        (user) => user.userId === socket.userId
      );
      if (index !== -1) {
        activeUsers.splice(index, 1);
      }
      // Emit the updated list of active users to the client
      io.emit("active users", activeUsers);
    });
  });
};
