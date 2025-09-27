
import express from "express";
import bodyParser from "body-parser";
import helmet from "helmet";
import cors from "cors";
import { RateLimiterRedis } from "rate-limiter-flexible";
import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import redisClient from "./config/redis.js";
import logger from "./utils/logger.js";
import router from "./routes/authRoutes.js";

const app = express();

app.use(bodyParser.json());
app.use(helmet());
app.use(cors());
app.use(express.json())

app.use((req, res, next)=> {
    logger.info(`Received ${req.method} request to ${req.url}`);
    logger.info(`Request body, ${req.body}`);
    next();
});

const rateLimiter = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix:"middleware",
    points:10,
    duration:1,

});

app.use(async (req, res, next) => {
  try {
    await rateLimiter.consume(req.ip);
    next();
  } catch (rejRes) {
    res.status(429).json({
      success: false,
      message: "Too many requests",
      retryAfter: rejRes.msBeforeNext / 1000, 
    });
  }
});

const sensitiveEndpointsLimiter = rateLimit ({
    windowMs: 15 * 60 * 1000,
    max: 50,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logger.warn(`Sensitive endpoint rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({ success: false, message: "Too many requests"});
    },
    store: new RedisStore({
        sendCommand: (...args) => redisClient.call(...args),
    })
})





app.use("/api/auth/register", sensitiveEndpointsLimiter);
app.use("/api/auth", router);

export default app;