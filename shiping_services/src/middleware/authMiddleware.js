import logger from "../utils/logger.js";

/**
 * Role-based authentication middleware
 * @param {Array} roles - Allowed roles for this route, e.g. ["USER", "ADMIN"]
 */
const authenticateRequest = (roles = []) => {
  return (req, res, next) => {
    const userId = req.headers["x-user-id"];
    const role = req.headers["x-user-role"];

    if (!userId) {
      logger.warn("Access attempt without user ID");
      return res.status(401).json({
        success: false,
        message: "Authentication required! Please login to continue",
      });
    }

    // Role check
    if (roles.length > 0 && !roles.includes(role)) {
      logger.warn(`User ${userId} with role ${role} attempted unauthorized access`);
      return res.status(403).json({
        success: false,
        message: "Forbidden: You don't have permission to perform this action",
      });
    }

    // Attach user info to request
    req.user = { userId, role };
    next();
  };
};

export default authenticateRequest;