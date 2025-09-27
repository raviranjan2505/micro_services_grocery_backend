import * as authService from "../services/authService.js";

// ------------------ Register ------------------
export async function register(req, res) {
  try {
    const { accessToken, refreshToken, user } = await authService.registerUser(req.body);
    res.status(201).json({
      success: true,
      message: "User registered successfully!",
      accessToken,
      refreshToken,
      userId: user.id,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

// ------------------ Login ------------------
export async function login(req, res) {
  try {
    const { accessToken, refreshToken, userId, Role } = await authService.loginUser(req.body);
    res.json({
      success: true,
      accessToken,
      refreshToken,
      userId,
      Role,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

// ------------------ Refresh Token ------------------
export async function refresh(req, res) {
  try {
    const { refreshToken } = req.body;
    const tokens = await authService.refreshTokenUser(refreshToken);
    res.json({ success: true, ...tokens });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

// ------------------ Logout ------------------
export async function logout(req, res) {
  try {
    const { refreshToken } = req.body;
    await authService.logoutUser(refreshToken);
    res.json({ success: true, message: "Logged out successfully!" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}
