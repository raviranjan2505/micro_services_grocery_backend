
import { fetchProduct } from "./productService.js";
import { fetchUserCart } from "./cartService.js";
import redisClient from "../config/redis.js";
import axios from "axios";

const CHECKOUT_CACHE_PREFIX = "checkout_";

export async function previewCheckout(userId, token) {
  console.log(token)
  const cartItems = await fetchUserCart(token);
  if (!cartItems.length) throw new Error("Your cart is empty");
  console.log(cartItems)
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

// export async function placeOrder(userId) {
//   const cachedData = await redisClient.get(CHECKOUT_CACHE_PREFIX + userId);
//   if (!cachedData)
//     throw new Error("No checkout data available. Please preview checkout first.");

//   const checkoutData = JSON.parse(cachedData);
//   if (!checkoutData.items.length) throw new Error("Your cart is empty.");

//   const orderItems = checkoutData.items.map(item => ({
//     productId: item.productId,
//     quantity: item.quantity,
//     price: item.price,
//   }));

//   const order = await prisma.order.create({
//     data: {
//       userId,
//       totalAmount: checkoutData.totalAmount,
//       items: {
//         create: orderItems,
//       },
//     },
//     include: { items: true },
//   });

//   await redisClient.del(CHECKOUT_CACHE_PREFIX + userId);

//   return order;
// }


export async function placeOrder(userId, token) {
  // Get cached checkout data
  const cachedData = await redisClient.get(CHECKOUT_CACHE_PREFIX + userId);
  console.log(cachedData, "this is cashed data for order")
  if (!cachedData)
    throw new Error("No checkout data available. Please preview checkout first.");

  const checkoutData = JSON.parse(cachedData);
  if (!checkoutData.items.length) throw new Error("Your cart is empty.");

  // Call Order Service
  const orderServiceUrl = process.env.API_GATEWAY_URL;
  console.log(orderServiceUrl, "orderService Url")

 const response = await axios.post(
  `${orderServiceUrl}/v1/order`,
  { cartItems: checkoutData.items },
  {
    headers: {
      Authorization: token,
      "x-user-id": userId,
      "x-user-role": "USER",
    },
  }
);

  // Clear cached checkout data
  await redisClient.del(CHECKOUT_CACHE_PREFIX + userId);

  return response.data.data; // return order object from Order Service
}
