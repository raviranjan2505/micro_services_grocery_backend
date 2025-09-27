import { Router } from "express";
import * as categoryController from "../controllers/categoryController.js";
import { upload } from "../config/multer.js";
import authenticateRequest from "../middleware/authMiddleware.js";

const router = Router();

router.get("/" , categoryController.getAllCategories);
router.get("/:id", categoryController.getCategoryById);
router.post("/",authenticateRequest(["ADMIN", "SELLER"]), upload.any(), categoryController.createCategory);
router.put("/:id",authenticateRequest(["ADMIN", "SELLER"]), upload.any(), categoryController.updateCategory);
router.delete("/:id",authenticateRequest(["ADMIN", "SELLER"]), categoryController.deleteCategory);

export default router;
