import express from "express";
import * as wishlistController from "../controllers/wishlistController.js";
import authenticateRequest from "../middleware/authMiddleware.js";
const router = express.Router();

router.post("/", authenticateRequest(), wishlistController.addToWishlist);
router.get("/", authenticateRequest(), wishlistController.getWishlist);
router.delete("/:productId", authenticateRequest(), wishlistController.removeFromWishlist);

export default router;