export const setupSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("joinChat", (chatId) => {
      socket.join(chatId);
      console.log(`User joined chat ${chatId}`);
    });

    socket.on("sendMessage", (message) => {
      const { chatId, content, userId } = message;

      // Save message to the database
      // Assume saveMessage is a function that saves the message to the DB
      saveMessage(chatId, content, userId).then((savedMessage) => {
        io.to(chatId).emit("receiveMessage", savedMessage);
      });
    });

    socket.on("disconnect", () => {
      console.log("A user disconnected");
    });
  });
};

// Mock function to save message to the database
async function saveMessage(chatId, content, userId) {
  const result = await query(
    `
    INSERT INTO messages (chat_id, content, user_id, timestamp)
    VALUES ($1, $2, $3, NOW())
    RETURNING *
  `,
    [chatId, content, userId]
  );

  return result.rows[0];
}
