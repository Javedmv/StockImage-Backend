import { Router } from "express";
import { getUsers, login, signup, updatePassword, verifyOtp, logout} from "../controllers/user.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/verify-otp", verifyOtp);
router.post("/logout", logout);

// Protected routes
router.get("/me", protect, getUsers);
router.post("/update-password", protect, updatePassword);

export default router;
