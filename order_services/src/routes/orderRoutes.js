
import { Router } from "express";
import * as orderController from "../controllers/orderController.js";
import authenticateRequest from "../middleware/authMiddleware.js";

const router = Router();

router.post("/", authenticateRequest(["USER", "ADMIN"]), orderController.createOrder);
router.get("/:id", authenticateRequest(["USER", "ADMIN"]), orderController.getOrder);
router.get("/", authenticateRequest(["USER", "ADMIN"]), orderController.listOrders);
router.put("/:id/status", authenticateRequest(["ADMIN"]), orderController.updateStatus);

export default router;