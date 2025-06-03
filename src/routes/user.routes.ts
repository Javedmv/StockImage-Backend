import { Router } from "express";
import { getUsers, login, signup, updatePassword, verifyOtp, logout} from "../controllers/user.controller";
import { upload } from "../lib/multer";
import { deleteImage, editImages, editTitle, getImage, handleUpload, reorderImages } from "../controllers/image.controller";
 

const router = Router();

router.get("/", getUsers);
router.post("/signup", signup);
router.post("/login", login);
router.post("/verify-otp", verifyOtp);
router.get("/get-user", getUsers);
router.post("/logout", logout);

router.post("/update-password", updatePassword);
router.post("/upload", upload.array("images",10), handleUpload);
router.get("/images", getImage);
router.put("/images/:id", editTitle)
router.delete("/images/:id", deleteImage);
router.post("/images/reorder", reorderImages);
router.put("/edit-images/:id", upload.single("image"), editImages);

export default router;
