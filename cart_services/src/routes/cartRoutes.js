import { Router } from "express";
import * as cartController from "../controllers/cartController.js";
import authenticateRequest from "../middleware/authMiddleware.js";

const router = Router();

// Only USER or ADMIN can access these routes
router.get("/", authenticateRequest(["USER", "ADMIN"]), cartController.getCart);
router.post("/add", authenticateRequest(["USER", "ADMIN"]), cartController.addToCart);
router.post("/remove", authenticateRequest(["USER", "ADMIN"]), cartController.removeFromCart);
router.post("/increase", authenticateRequest(["USER", "ADMIN"]), cartController.increaseQuantity);
router.post("/decrease", authenticateRequest(["USER", "ADMIN"]), cartController.decreaseQuantity);
router.post("/clear", authenticateRequest(["USER", "ADMIN"]), cartController.clearCart);

export default router;
