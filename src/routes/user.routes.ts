import { Router } from "express";
import { getUsers, login, signup, updatePassword, verifyOtp, uploadImage, getImage} from "../controllers/user.controller";

const router = Router();

router.get("/", getUsers);
router.post("/signup", signup);
router.post("/login", login);
router.post("/verify-otp", verifyOtp)
router.post("/update-password", updatePassword);
router.post("/upload-image", uploadImage)
router.get("get-image/:id", getImage);

export default router;
