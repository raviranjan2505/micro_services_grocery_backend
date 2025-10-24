import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import logger from "./utils/logger.js";
import proxy from "express-http-proxy";
import validateToken from "./middleware/authMiddleware.js";

import redisClient from "./config/redis.js";
dotenv.config();
const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

const ratelimitOptions = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    handler:(req, res) => {
        logger.warn(`Sensitive endpoint rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({success:false, message:"Too many requests"});
    },
    store: new RedisStore({
        sendCommand: (...args) => redisClient.call(...args),
    }),
});
app.use(ratelimitOptions)

app.use((req, res, next) => {
  logger.info(`Received ${req.method} request to ${req.url}`);
  logger.info(`Request body, ${req.body}`);
  next();
});

const proxyOptions = {
  proxyReqPathResolver: (req) => {
    return req.originalUrl.replace(/^\/v1/, "/api");
  },
  proxyErrorHandler: (err, res, next) => {
    logger.error(`Proxy error: ${err.message}`);
    res.status(500).json({
      message: `Internal server error`,
      error: err.message,
    });
  },
};

//setting up proxy for our identity service
app.use(
  "/v1/auth",
  proxy(process.env.IDENTITY_SERVICE_URL, {
    ...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      proxyReqOpts.headers["Content-Type"] = "application/json";
      return proxyReqOpts;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
      logger.info(
        `Response received from Identity service: ${proxyRes.statusCode}`
      );
      return proxyResData;
    },
  })
);

app.use(
  "/v1/categories",
  (req, res, next) => {
    if (req.method !== "GET") {
      return validateToken(req, res, next); 
    }
    next();
  },
  proxy(process.env.PRODUCT_SERVICE_URL, {
    ...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      proxyReqOpts.headers["Content-Type"] = "application/json";

      if (srcReq.method !== "GET") {
         proxyReqOpts.headers["x-user-id"] = srcReq.user.userId;
         proxyReqOpts.headers["x-user-role"] = srcReq.user.role;
      }

      return proxyReqOpts;
    },
  })
);


app.use(
  "/v1/products",
  validateToken,
  proxy(process.env.PRODUCT_SERVICE_URL, {
    ...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      proxyReqOpts.headers["Content-Type"] = "application/json";
      proxyReqOpts.headers["x-user-id"] = srcReq.user.userId;

      return proxyReqOpts;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
      logger.info(
        `Response received from Post service: ${proxyRes.statusCode}`
      );

      return proxyResData;
    },
  })
);

app.use(
  "/v1/cart",
  validateToken,
  proxy(process.env.CART_SERVICE_URL, {
    ...proxyOptions,
   proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
  proxyReqOpts.headers["Content-Type"] = "application/json";
  proxyReqOpts.headers["x-user-id"] = srcReq.user.userId;
  proxyReqOpts.headers["x-user-role"] = srcReq.user.role;

  // 👇 forward Authorization header to the Cart Service (optional)
  proxyReqOpts.headers["authorization"] = srcReq.headers["authorization"];

  return proxyReqOpts;
},
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
      logger.info(
        `Response received from Post service: ${proxyRes.statusCode}`
      );

      return proxyResData;
    },
  })
);


app.use(
  "/v1/checkout",
  validateToken,
  proxy(process.env.CHECKOUT_SERVICE_URL, {
    ...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      proxyReqOpts.headers["Content-Type"] = "application/json";
      proxyReqOpts.headers["x-user-id"] = srcReq.user.userId;
      proxyReqOpts.headers["x-user-role"] = srcReq.user.role;

      // 👇 Forward the same JWT token for validation in Checkout service
      const authHeader = srcReq.headers["authorization"];
      if (authHeader) {
        proxyReqOpts.headers["authorization"] = authHeader;
      }

      return proxyReqOpts;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
      logger.info(
        `Response received from Checkout service: ${proxyRes.statusCode}`
      );
      return proxyResData;
    },
  })
);


app.use(
  "/v1/order",
  validateToken,
  proxy(process.env.ORDER_SERVICE_URL, {
    ...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      proxyReqOpts.headers["Content-Type"] = "application/json";
      proxyReqOpts.headers["x-user-id"] = srcReq.user.userId;
      proxyReqOpts.headers["x-user-role"] = srcReq.user.role;

      // 👇 Forward the same JWT token for validation in Checkout service
      const authHeader = srcReq.headers["authorization"];
      if (authHeader) {
        proxyReqOpts.headers["authorization"] = authHeader;
      }

      return proxyReqOpts;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
      logger.info(
        `Response received from Checkout service: ${proxyRes.statusCode}`
      );
      return proxyResData;
    },
  })
);


// 🚚 Shipping Service Proxy
app.use(
  "/v1/shipping",
  validateToken,
  proxy(process.env.SHIPPING_SERVICE_URL, {
    ...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      // Common headers
      proxyReqOpts.headers["Content-Type"] = "application/json";
      proxyReqOpts.headers["x-user-id"] = srcReq.user.userId;
      proxyReqOpts.headers["x-user-role"] = srcReq.user.role;

      // Forward Authorization token
      const authHeader = srcReq.headers["authorization"];
      if (authHeader) {
        proxyReqOpts.headers["authorization"] = authHeader;
      }

      return proxyReqOpts;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
      logger.info(
        `Response received from Shipping service: ${proxyRes.statusCode}`
      );
      return proxyResData;
    },
  })
);


app.use(
  "/v1/wishlist",
  validateToken,
  proxy(process.env.WISHLIST_SERVICE_URL, {
    ...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      proxyReqOpts.headers["x-user-id"] = srcReq.user.userId;
      proxyReqOpts.headers["x-user-role"] = srcReq.user.role;
      proxyReqOpts.headers["authorization"] = srcReq.headers["authorization"];
      return proxyReqOpts;
    },
  })
);

app.use(
  "/v1/coupons",
  validateToken,
  proxy(process.env.COUPON_SERVICE_URL, {
    ...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      proxyReqOpts.headers["x-user-id"] = srcReq.user.userId;
      proxyReqOpts.headers["x-user-role"] = srcReq.user.role;
      proxyReqOpts.headers["authorization"] = srcReq.headers["authorization"];
      return proxyReqOpts;
    },
  })
);

export default app;


