import prisma from "../prisma/client.js";
import bcrypt from "bcryptjs";
import { generateTokens } from "../utils/generateToken.js";
import { validateRegistration, validateLogin } from "../utils/validation.js";

export async function registerUser(data) {
  const { error } = validateRegistration(data);
  if (error) throw new Error(error.details[0].message);

  const { email, password, username } = data;

  const existingUser = await prisma.user.findFirst({
    where: { OR: [{ email }, { profilePicUrl: username }] },
  });
  if (existingUser) throw new Error("User already exists");
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      profilePicUrl: username,
    },
  });

  const { accessToken, refreshToken } = await generateTokens(user);
  return { accessToken, refreshToken, user };
}

export async function loginUser(data) {
  const { error } = validateLogin(data);
  if (error) throw new Error(error.details[0].message);

  const { email, password } = data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("Invalid credentials");

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) throw new Error("Invalid password");

  const { accessToken, refreshToken } = await generateTokens(user);

  return { accessToken, refreshToken, userId: user.id, Role: user.role };
}

export async function refreshTokenUser(refreshToken) {
  if (!refreshToken) throw new Error("Refresh token missing");

  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
  });

  if (!storedToken || storedToken.expiresAt < new Date()) {
    throw new Error("Invalid or expired refresh token");
  }

  const user = await prisma.user.findUnique({ where: { id: storedToken.userId } });
  if (!user) throw new Error("User not found");

  const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
    await generateTokens(user);

  await prisma.refreshToken.delete({ where: { id: storedToken.id } });

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
}


export async function logoutUser(refreshToken) {
  if (!refreshToken) throw new Error("Refresh token missing");

  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
  });
  if (!storedToken) throw new Error("Invalid refresh token");

  await prisma.refreshToken.delete({ where: { token: refreshToken } });

  return true;
}
