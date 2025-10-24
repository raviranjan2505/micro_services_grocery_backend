import express from 'express';
import {
  createCoupon,
  validateCoupon,
  getCouponByCode,
  updateCoupon,
  deleteCoupon,
  getAllCoupons
} from '../controllers/couponController.js';

const router = express.Router();

router.post('/', createCoupon);             // Create
router.post('/validate', validateCoupon);   // Validate
router.get('/', getAllCoupons);             // Get all coupons
router.get('/:code', getCouponByCode);      // Get by code
router.put('/:id', updateCoupon);           // Update
router.delete('/:id', deleteCoupon);        // Delete

export default router;
