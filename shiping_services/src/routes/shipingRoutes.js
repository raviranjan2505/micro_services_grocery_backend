import express from "express";
import * as shipmentController from "../controllers/shipmentController.js";
import authenticateRequest from "../middleware/authMiddleware.js";


const router = express.Router();

router.post("/", authenticateRequest(), shipmentController.createShipment); // Create shipment
router.get("/:id", authenticateRequest(), shipmentController.getShipment); // Get shipment
router.patch("/:id/status", authenticateRequest(["ADMIN"]), shipmentController.updateShipmentStatus); // Admin updates status
router.post("/webhook", shipmentController.webhookUpdate); // Courier webhook updates status

export default router;
