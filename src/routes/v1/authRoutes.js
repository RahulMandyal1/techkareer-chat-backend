// src/routes/v1/userRoutes.js
import express from "express";
import { addUser, login } from "../../controllers/authController.js";

const router = express.Router();

router.post("/register", addUser);
router.post("/login", login);

export default router;
