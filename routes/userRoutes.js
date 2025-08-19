//D:\office\webartifacts\web-backend\routes\userRoutes.js

import express from "express";
import {
  getAllUsers,
  deleteUser,
  getStaffOnly 
} from "../controllers/userController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Admin-only routes (protected)
router.get("/users", verifyToken, getAllUsers);
router.delete("/users/:id", verifyToken, deleteUser);
// ✅ Get all staff (for Admin dropdown)
router.get("/users/staff", verifyToken, getStaffOnly);

export default router;









