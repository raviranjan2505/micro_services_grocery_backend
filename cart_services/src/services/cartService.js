// src/services/cartService.js
import prisma from "../prisma/client.js";
import redisClient from "../config/redis.js";
import { fetchProduct } from "./productService.js";

const CART_CACHE_PREFIX = "cart:";

// -------------------- Redis helpers --------------------
async function getCachedCart(userId) {
  const cached = await redisClient.get(CART_CACHE_PREFIX + userId);
  return cached ? JSON.parse(cached) : null;
}

async function setCachedCart(userId, cart) {
  await redisClient.setEx(CART_CACHE_PREFIX + userId, 300, JSON.stringify(cart));
}

async function invalidateCache(userId) {
  await redisClient.del(CART_CACHE_PREFIX + userId);
}

// -------------------- Get Cart --------------------
export async function getCart(userId) {
  const cached = await getCachedCart(userId);
  if (cached) return cached;

  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: true },
  });

  if (!cart) {
    cart = await prisma.cart.create({ data: { userId } });
  }

  await setCachedCart(userId, cart);
  return cart;
}

// -------------------- Add to Cart --------------------
export async function addToCart(userId, productId, quantity = 1) {
  // Validate product exists
  const product = await fetchProduct(productId);

  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: true },
  });

  if (!cart) {
    cart = await prisma.cart.create({ data: { userId } });
  }

  const existingItem = cart.items.find((i) => i.product === productId);

  if (existingItem) {
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: existingItem.quantity + quantity },
    });
  } else {
    await prisma.cartItem.create({
      data: { cartId: cart.id, product: productId, quantity },
    });
  }

  invalidateCache(userId);
  return getCart(userId);
}

// -------------------- Remove Item --------------------
export async function removeFromCart(userId, productId) {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: true },
  });
  if (!cart) throw new Error("Cart not found");

  const item = cart.items.find((i) => i.product === productId);
  if (!item) throw new Error("Item not found in cart");

  await prisma.cartItem.delete({ where: { id: item.id } });
  invalidateCache(userId);
  return getCart(userId);
}

// -------------------- Increase Quantity --------------------
export async function increaseQuantity(userId, productId, amount = 1) {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: true },
  });
  if (!cart) throw new Error("Cart not found");

  const item = cart.items.find((i) => i.product === productId);
  if (!item) throw new Error("Item not found in cart");

  await prisma.cartItem.update({
    where: { id: item.id },
    data: { quantity: item.quantity + amount },
  });

  invalidateCache(userId);
  return getCart(userId);
}

// -------------------- Decrease Quantity --------------------
export async function decreaseQuantity(userId, productId, amount = 1) {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: true },
  });
  if (!cart) throw new Error("Cart not found");

  const item = cart.items.find((i) => i.product === productId);
  if (!item) throw new Error("Item not found in cart");

  const newQty = item.quantity - amount;
  if (newQty <= 0) {
    await prisma.cartItem.delete({ where: { id: item.id } });
  } else {
    await prisma.cartItem.update({ where: { id: item.id }, data: { quantity: newQty } });
  }

  invalidateCache(userId);
  return getCart(userId);
}

// -------------------- Clear Cart --------------------
export async function clearCart(userId) {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: true },
  });
  if (!cart) throw new Error("Cart not found");

  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  invalidateCache(userId);
  return getCart(userId);
}
