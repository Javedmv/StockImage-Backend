import { Router } from "express";
import { upload } from "../lib/multer";
import { deleteImage, editImages, editTitle, getImage, handleUpload, reorderImages } from "../controllers/image.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

// All image routes are protected
router.use(protect);

router.post("/upload", upload.array("images", 10), handleUpload);
router.get("/", getImage);
router.put("/:id/title", editTitle);
router.delete("/:id", deleteImage);
router.post("/reorder", reorderImages);
router.put("/:id", upload.single("image"), editImages);

export default router;