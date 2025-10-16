
import prisma from "../prisma/client.js";
import { fetchProduct } from "./productService.js";
import { fetchUserCart } from "./cartService.js";
import redisClient from "../config/redis.js";

const CHECKOUT_CACHE_PREFIX = "checkout_";

export async function previewCheckout(userId, token) {
  console.log(token)
  const cartItems = await fetchUserCart(token);
  if (!cartItems.length) throw new Error("Your cart is empty");

  let totalAmount = 0;
  const validatedItems = [];

  for (const item of cartItems) {
    const product = await fetchProduct(item.productId);
    if (!product) throw new Error(`Product not found: ${item.productId}`);

    totalAmount += product.dp * item.quantity;

    validatedItems.push({
      productId: item.productId,
      quantity: item.quantity,
      price: product.dp,
      name: product.name,
      image: product.images?.[0]?.url || null, 
    });
  }

  const checkoutData = { items: validatedItems, totalAmount };

  await redisClient.setEx(
    CHECKOUT_CACHE_PREFIX + userId,
    600,
    JSON.stringify(checkoutData)
  );

  return checkoutData;
}

export async function placeOrder(userId) {
  const cachedData = await redisClient.get(CHECKOUT_CACHE_PREFIX + userId);
  if (!cachedData)
    throw new Error("No checkout data available. Please preview checkout first.");

  const checkoutData = JSON.parse(cachedData);
  if (!checkoutData.items.length) throw new Error("Your cart is empty.");

  const orderItems = checkoutData.items.map(item => ({
    productId: item.productId,
    quantity: item.quantity,
    price: item.price,
  }));

  const order = await prisma.order.create({
    data: {
      userId,
      totalAmount: checkoutData.totalAmount,
      items: {
        create: orderItems,
      },
    },
    include: { items: true },
  });

  await redisClient.del(CHECKOUT_CACHE_PREFIX + userId);

  return order;
}
