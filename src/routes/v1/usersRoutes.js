import express from "express";
import { getUserList } from "../../controllers/usersControlller.js";
import { authMiddleware } from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/list", authMiddleware, async (req, res) => {
  try {
    console.log(req.user, "user data");
    const userList = await getUserList(req.user.userId);
    res.json({ success: true, users: userList });
  } catch (error) {
    console.error("Error fetching user list:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;
