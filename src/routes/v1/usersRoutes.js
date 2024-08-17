// src/routes/v1/userRoutes.js
import express from "express";
import { addUser, login } from "../../controllers/usersController.js";

const router = express.Router();


router.post("/register", addUser);
router.post("/login", login);



router.get("/", (req, res) => {
  res.status(200).json({
    message: "this is the user pagge dude you did it after a very long time",
  });
});

export default router;
