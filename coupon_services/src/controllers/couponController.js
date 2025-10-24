import * as couponService from '../services/couponService.js';

// Create coupon
export async function createCoupon(req, res) {
  try {
    const coupon = await couponService.createCoupon(req.body);
    res.status(201).json({ success: true, data: coupon });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

// Validate coupon
export async function validateCoupon(req, res) {
  try {
    const { code, userId, orderTotal } = req.body;
    const result = await couponService.validateCoupon(code, userId, orderTotal);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}
// Get all coupons
export async function getAllCoupons(req, res) {
  try {
    const coupons = await couponService.getAllCoupons();
    res.json({ success: true, data: coupons });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}




// Get coupon by code
export async function getCouponByCode(req, res) {
  try {
    const code = req.params.code;
    const coupon = await couponService.getCouponByCode(code);
    if (!coupon) return res.status(404).json({ success: false, message: "Coupon not found" });
    res.json({ success: true, data: coupon });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

// Update coupon
export async function updateCoupon(req, res) {
  try {
    const id = Number(req.params.id);
    const updatedCoupon = await couponService.updateCoupon(id, req.body);
    if (!updatedCoupon) return res.status(404).json({ success: false, message: "Coupon not found" });
    res.json({ success: true, data: updatedCoupon });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

// Delete coupon
export async function deleteCoupon(req, res) {
  try {
    const id = Number(req.params.id);
    await couponService.deleteCoupon(id);
    res.json({ success: true, message: "Coupon deleted successfully" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}
