import jwt from "jsonwebtoken";
import crypto from "crypto";
import prisma from "../prisma/client.js";

export async function generateTokens(user) {
  // Access Token
  const accessToken = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "60m" }
  );

  // Refresh Token
  const refreshToken = crypto.randomBytes(40).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt,
    },
  });

  return { accessToken, refreshToken };
}
