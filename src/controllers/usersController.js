// src/controllers/userController.js

import { db } from "../db.js";
import { users } from "../models/users.js";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export const addUser = async (req, res) => {
  const { username, password, profileUrl } = req.body;

  console.log(req.body);

  // Check if all required fields are present
  if (!username || !password || !profileUrl) {
    return res.status(400).json({
      success: false,
      message: "Username, password, and profileUrl are all required",
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db
      .insert(users)
      .values({
        username,
        password: hashedPassword,
        profileUrl: profileUrl,
      })
      .returning();

    const newUser = result[0];
    console.log(result , 'result ')

    const token = jwt.sign(
      { userId: newUser?.user_id, username: newUser?.username },
      JWT_SECRET,
      { expiresIn: "15d" }
    );

    console.log(newUser);

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: newUser?.userId,
        username: newUser?.username,
        profileUrl: newUser?.profileUrl,
      },
      token,
      success: true,
    });
  } catch (error) {
    if (error.code === "23505" && error.detail.includes("username")) {
      return res
        .status(400)
        .json({ success: false, message: "Username already exists" });
    }
    console.error("Error in addUser:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.username, username));

    if (result.length === 0) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid username or password" });
    }

    const user = result[0];

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid username or password" });
    }

    const token = jwt.sign(
      { userId: user.user_id, username: user.username },
      JWT_SECRET,
      { expiresIn: "15d" }
    );

    res.status(200).json({
      message: "Login successful",
      user,
      token,
      success: true,
    });
  } catch (error) {
    console.error("Error in login:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
