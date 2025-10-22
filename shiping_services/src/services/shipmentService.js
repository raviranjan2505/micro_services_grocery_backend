import prisma from "../prisma/client.js";

// Valid statuses
const validStatuses = ["Pending", "Shipped", "In Transit", "Out for Delivery", "Delivered", "Returned"];

// Create a new shipment
export async function createShipment({ orderId, userId, courier }) {
    const shipment = await prisma.shipment.create({
        data: {
            orderId,
            userId,
            courier,
            status: "Pending",
            trackingNumber: `SHIP-${Math.floor(Math.random() * 1000000)}`
        }
    });
    return shipment;
}

// Get shipment by ID
export async function getShipmentById(shipmentId) {
    return await prisma.shipment.findUnique({
        where: { id: shipmentId }
    });
}

// Update shipment status
export async function updateShipmentStatus(shipmentId, status) {
    if (!validStatuses.includes(status)) throw new Error("Invalid status");
    return await prisma.shipment.update({
        where: { id: shipmentId },
        data: { status }
    });
}

// Update shipment via webhook (tracking number)
export async function updateShipmentStatusByTracking(trackingNumber, status) {
    if (!validStatuses.includes(status)) throw new Error("Invalid status");
    return await prisma.shipment.update({
        where: { trackingNumber },
        data: { status }
    });
}
