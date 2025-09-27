
// import logger from "../utils/logger.js";

// const authenticateRequest = (req, res, next) => {
//   const userId = req.headers["x-user-id"];

//   if (!userId) {
//     logger.warn(`Access attempted without user ID`);
//     return res.status(401).json({
//       success: false,
//       message: "Authencation required! Please login to continue",
//     });
//   }

//   req.user = { userId };
//   next();
// };

// export default authenticateRequest;


import logger from "../utils/logger.js";

const authenticateRequest = (roles = []) => {
  return (req, res, next) => {
    const userId = req.headers["x-user-id"];
    const role = req.headers["x-user-role"]; 

    if (!userId) {
      logger.warn(`Access attempted without user ID`);
      return res.status(401).json({
        success: false,
        message: "Authentication required! Please login to continue",
      });
    }

    if (roles.length > 0 && !roles.includes(role)) {
      logger.warn(`User ${userId} with role ${role} attempted unauthorized access`);
      return res.status(403).json({
        success: false,
        message: "Forbidden: You don't have permission to perform this action",
      });
    }

    req.user = { userId, role };
    next();
  };
};

export default authenticateRequest;