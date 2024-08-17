// src/controllers/authController.js

import { db } from "../db.js";
import { users } from "../models/users.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { dotenv } from "dotenv";

// Load environment variables
const JWT_SECRET = process.env.JWT_SECRET;

// Function to authenticate the user
export const authenticateUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Fetch the user from the database
    const user = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .single();

    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Compare the provided password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: "1h" } // Token expiration time
    );

    // Send the response
    res.status(200).json({
      message: "Authentication successful",
      token,
    });
  } catch (error) {
    console.error("Error authenticating user:", error);
    res.status(500).json({ message: "Authentication failed" });
  }
};
