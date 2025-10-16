import { Router } from "express";
import * as checkoutController from "../controllers/checkoutController.js";
import authenticateRequest from "../middleware/authMiddleware.js";

const router = Router();

router.get("/previewOrder", authenticateRequest(["USER", "ADMIN"]), checkoutController. previewCheckout);
router.post("/placeOrder", authenticateRequest(["USER", "ADMIN"]), checkoutController.placeOrder);

export default router;
