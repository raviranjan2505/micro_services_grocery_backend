import * as cartService from "../services/cartService.js";

export async function getCart(req, res) {
  const userId =  Number(req.user.userId);
  const role = req.user.role;

  const targetUserId = role === "ADMIN" && req.query.userId ? req.query.userId : userId;

  try {
    const cart = await cartService.getCart(targetUserId);
    res.json({ success: true, data: cart });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

export async function addToCart(req, res) {
  const { productId, quantity } = req.body;
  const userId = Number(req.user.userId);

  try {
    const cart = await cartService.addToCart(userId, productId, quantity);
    res.json({ success: true, data: cart });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

export async function removeFromCart(req, res) {
  const { productId } = req.body;
  const userId =  Number(req.user.userId);

  try {
    const cart = await cartService.removeFromCart(userId, productId);
    res.json({ success: true, data: cart });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

export async function increaseQuantity(req, res) {
  const { productId, amount } = req.body;
  const userId =  Number(req.user.userId);

  try {
    const cart = await cartService.increaseQuantity(userId, productId, amount);
    res.json({ success: true, data: cart });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}


export async function decreaseQuantity(req, res) {
  const { productId, amount } = req.body;
  const userId =  Number(req.user.userId);

  try {
    const cart = await cartService.decreaseQuantity(userId, productId, amount);
    res.json({ success: true, data: cart });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

export async function clearCart(req, res) {
  const userId =  Number(req.user.userId);

  try {
    const cart = await cartService.clearCart(userId);
    res.json({ success: true, data: cart });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}
