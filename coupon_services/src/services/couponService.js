import prisma from '../prisma/client.js';

export async function createCoupon(data) {
  return prisma.coupon.create({ data });
}

export async function validateCoupon(code, userId, orderTotal) {
  const coupon = await prisma.coupon.findUnique({
    where: { code },
    include: { couponUsages: true },
  });

  if (!coupon || !coupon.isActive) throw new Error('Invalid or inactive coupon');

  const now = new Date();
  if (coupon.startDate > now || coupon.endDate < now) throw new Error('Coupon not valid at this time');

  if (coupon.maxUsage && coupon.usedCount >= coupon.maxUsage) throw new Error('Coupon usage limit reached');

  let discountAmount = coupon.type === 'percentage' ? (orderTotal * coupon.discount) / 100 : coupon.discount;

  return { discountAmount, finalTotal: orderTotal - discountAmount };
}

export async function getCouponByCode(code) {
  return prisma.coupon.findUnique({ where: { code } });
}

export async function updateCoupon(id, data) {
  return prisma.coupon.update({
    where: { id },
    data,
  });
}

export async function deleteCoupon(id) {
  return prisma.coupon.delete({ where: { id } });
}

export async function getAllCoupons() {
  return prisma.coupon.findMany({
    orderBy: { createdAt: 'desc' },
  });
}