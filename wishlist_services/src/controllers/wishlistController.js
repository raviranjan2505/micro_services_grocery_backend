import * as wishlistService from "../services/wishlistService.js";

export async function addToWishlist(req, res) {
  try {
    const { productId } = req.body;
    const userId = Number(req.user.userId);
    const item = await wishlistService.addToWishlist(userId, Number(productId));
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

export async function getWishlist(req, res) {
  try {
    const userId = Number(req.user.userId);
    const wishlist = await wishlistService.getUserWishlist(userId);
    res.status(200).json({ success: true, data: wishlist });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

export async function removeFromWishlist(req, res) {
  try {
    const { productId } = req.params;
    const userId = Number(req.user.userId);
    await wishlistService.removeFromWishlist(userId, Number(productId));
    res.status(200).json({ success: true, message: "Removed successfully" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}
