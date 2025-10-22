import * as shipmentService from "../services/shipmentService.js";

// Create shipment
export async function createShipment(req, res) {
    try {
        const { orderId, courier } = req.body;
        const userId = Number(req.user.userId); // From API Gateway JWT
        const shipment = await shipmentService.createShipment({ orderId, userId, courier });
        res.status(201).json({ success: true, data: shipment });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
}

// Get shipment
export async function getShipment(req, res) {
    try {
        const shipment = await shipmentService.getShipmentById(Number(req.params.id));
        res.json({ success: true, data: shipment });
    } catch (err) {
        res.status(404).json({ success: false, message: err.message });
    }
}

// Update shipment status (admin)
export async function updateShipmentStatus(req, res) {
    try {
        const { status } = req.body;
        const shipment = await shipmentService.updateShipmentStatus(Number(req.params.id), status);
        res.json({ success: true, data: shipment });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
}

// Webhook for courier updates
export async function webhookUpdate(req, res) {
    try {
        const { trackingNumber, status } = req.body;
        const shipment = await shipmentService.updateShipmentStatusByTracking(trackingNumber, status);
        res.json({ success: true, data: shipment });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
}
