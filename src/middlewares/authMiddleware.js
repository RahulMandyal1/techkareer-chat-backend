import jwt from "jsonwebtoken";
import { config } from "../config.js";

export const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ success: false, message: "Token expired", logout: true });
    }
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};
