import { and, asc, desc, eq, ne, or, sql } from "drizzle-orm";
import { db } from "../db.js";
import { users, messages } from "../models/schema.js";

// Function to get all users except the current user
export const getAllUsersExceptCurrentOne = async (userId) => {
  try {
    const result = await db
      .select({
        userId: users.userId,
        username: users.username,
        profileUrl: users.profileUrl,
      })
      .from(users)
      .where(ne(users.userId, userId));

    return result;
  } catch (error) {
    console.error("Error in getAllUsersExceptCurrentOne:", error);
    throw error;
  }
};

// Function to get the last message between two users
export const getLastMessageBetweenUsers = async (userId1, userId2) => {
  try {
    const lastMessage = await db
      .select()
      .from(messages)
      .where(
        or(
          and(eq(messages.fromUserId, userId1), eq(messages.toUserId, userId2)),
          and(eq(messages.fromUserId, userId2), eq(messages.toUserId, userId1))
        )
      )
      .orderBy(desc(messages.createdAt))
      .limit(1);

    return lastMessage[0] || null;
  } catch (error) {
    console.error("Error in getLastMessageBetweenUsers:", error);
    throw error;
  }
};

// Function to get user info with last message
export const getUserWithLastMessage = async (currentUserId, otherUser) => {
  try {
    const lastMessage = await getLastMessageBetweenUsers(
      currentUserId,
      otherUser.userId
    );

    return {
      ...otherUser,
      lastMessage,
    };
  } catch (error) {
    console.error("Error in getUserWithLastMessage:", error);
    throw error;
  }
};

// Function to get paginated messages between two users
export const getPaginatedMessagesBetweenUsers = async (
  userId1,
  userId2,
  page = null,
  pageSize = 30
) => {
  try {
    // Get the total number of messages between the users
    const totalMessagesResult = await db
      .select({ count: sql`count(*)`.mapWith(Number) })
      .from(messages)
      .where(
        or(
          and(eq(messages.fromUserId, userId1), eq(messages.toUserId, userId2)),
          and(eq(messages.fromUserId, userId2), eq(messages.toUserId, userId1))
        )
      );

    const totalMessages = totalMessagesResult[0]?.count || 0;
    const totalPages = Math.max(1, Math.ceil(totalMessages / pageSize));

    // If no page is provided, default to the last page (most recent messages)
    const currentPage =
      page === null ? totalPages : Math.min(Math.max(1, page), totalPages);

    // Calculate the offset to fetch messages for the current page
    const offset = (totalPages - currentPage) * pageSize;

    // Fetch the messages for the current page in ascending order
    const paginatedMessages = await db
      .select()
      .from(messages)
      .where(
        or(
          and(eq(messages.fromUserId, userId1), eq(messages.toUserId, userId2)),
          and(eq(messages.fromUserId, userId2), eq(messages.toUserId, userId1))
        )
      )
      .orderBy(asc(messages.createdAt)) // Order by ascending date
      .limit(pageSize)
      .offset(offset);

    return {
      messages: paginatedMessages,
      currentPage,
      totalPages,
    };
  } catch (error) {
    console.error("Error in getPaginatedMessagesBetweenUsers:", error);
    throw error;
  }
};

// Main function to get user list with last messages
export const getUserList = async (userId) => {
  try {
    const userList = await getAllUsersExceptCurrentOne(userId);

    const userListWithLastMessage = await Promise.all(
      //  concurrent operations
      userList.map(async (user) => {
        // const lastMessage = await getLastMessageBetweenUsers(
        //   userId,
        //   user.userId
        // );

        const lastMessage = await getPaginatedMessagesBetweenUsers(
          userId,
          user.userId
        );

        return {
          ...user,
          messages: lastMessage,
          lastMessage: null,
        };
      })
    );

    return userListWithLastMessage;
  } catch (error) {
    console.error("Error fetching user list:", error);
    throw error;
  }
};
