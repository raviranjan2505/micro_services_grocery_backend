

import * as orderService from "../services/orderService.js";

export async function createOrder(req, res) {
  try {
    const userId = Number(req.user.userId);
     const token = req.headers.authorization;
    const cartItems = req.body.cartItems;
    const order = await orderService.createOrder(userId, cartItems, token);
    res.status(201).json({ success: true, data: order });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

export async function getOrder(req, res) {
  try {
    const orderId = Number(req.params.id);
    const order = await orderService.getOrderById(orderId, req.user);
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(err.message === "Forbidden" ? 403 : 404).json({ success: false, message: err.message });
  }
}

export async function listOrders(req, res) {
  try {
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 20;
    const data = await orderService.listOrders(req.user, page, pageSize);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function updateStatus(req, res) {
  try {
    const orderId = Number(req.params.id);
    const { status } = req.body;
    const updated = await orderService.updateOrderStatus(orderId, status, req.user);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(err.message === "Forbidden" ? 403 : 400).json({ success: false, message: err.message });
  }
}
