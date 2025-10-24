import prisma from "../prisma/client.js";

export async function addToWishlist(userId, productId) {
  const existing = await prisma.wishlist.findFirst({
    where: { userId, productId },
  });
  if (existing) throw new Error("Product already in wishlist");

  return prisma.wishlist.create({
    data: { userId, productId },
  });
}

export async function getUserWishlist(userId) {
  return prisma.wishlist.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function removeFromWishlist(userId, productId) {
  return prisma.wishlist.deleteMany({
    where: { userId, productId },
  });
}
