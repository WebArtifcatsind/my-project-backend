//D:\office\webartifacts\web-backend\routes\authRoutes.js
import express from "express";
import {
  testRoute,
  registerUser,
  loginUser,
  forgotPassword,  // ✅ this must be exported
  verifyOTP,
  resetPassword,
} from "../controllers/authController.js";

const router = express.Router();

router.get("/test", testRoute);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);  // ✅ this must exist
router.post("/verify-otp", verifyOTP);
router.post("/reset-password", resetPassword);

export default router;



