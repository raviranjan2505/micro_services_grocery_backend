
import prisma from "../prisma/client.js";
import redis from "../config/redis.js";
import { fetchProduct } from "./productService.js";

const ORDER_CACHE_PREFIX = "order:";

async function cacheOrder(order) {
  await redis.setEx(`${ORDER_CACHE_PREFIX}${order.id}`, 300, JSON.stringify(order));
}

export async function createOrder(userId, cartItems, token) {
  if (!cartItems || !cartItems.length) throw new Error("Cart is empty");

  let totalAmount = 0;
  const itemsToCreate = [];

  for (const it of cartItems) {
    const product = await fetchProduct(Number(it.productId), token);
    const qty = Number(it.quantity || 1);
    totalAmount += product.price * qty;

    itemsToCreate.push({
      productId: String(it.productId),
      name: product.name,
      image: product.image,
      price: product.price,
      quantity: qty,
    });
  }

  const order = await prisma.order.create({
    data: {
      userId,
      totalAmount,
      items: { create: itemsToCreate },
    },
    include: { items: true },
  });

  await cacheOrder(order);
  return order;
}

export async function getOrderById(orderId, requestingUser) {
  const cached = await redis.get(`${ORDER_CACHE_PREFIX}${orderId}`);
  if (cached) {
    const parsed = JSON.parse(cached);
    if (requestingUser.role !== "ADMIN" && parsed.userId !== requestingUser.userId) {
      throw new Error("Forbidden");
    }
    return parsed;
  }

  const order = await prisma.order.findUnique({ where: { id: Number(orderId) }, include: { items: true } });
  if (!order) throw new Error("Order not found");
  if (requestingUser.role !== "ADMIN" && order.userId !== requestingUser.userId) {
    throw new Error("Forbidden");
  }

  await cacheOrder(order);
  return order;
}

export async function listOrders(requestingUser, page = 1, pageSize = 20) {
  const skip = (page - 1) * pageSize;
  const where = requestingUser.role === "ADMIN" ? {} : { userId: Number(requestingUser.userId) };

  const [items, total] = await Promise.all([
    prisma.order.findMany({ where, skip, take: pageSize, orderBy: { id: "desc" }, include: { items: true } }),
    prisma.order.count({ where }),
  ]);

  return { items, page, pageSize, total, totalPages: Math.ceil(total / pageSize) };
}

export async function updateOrderStatus(orderId, status, requestingUser) {
  if (requestingUser.role !== "ADMIN") throw new Error("Forbidden");

  const updated = await prisma.order.update({ where: { id: Number(orderId) }, data: { status } });
  await redis.del(`${ORDER_CACHE_PREFIX}${orderId}`);
  await cacheOrder(updated);
  return updated;
}
