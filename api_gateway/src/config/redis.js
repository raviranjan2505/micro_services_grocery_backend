import Redis from "ioredis";

const redisClient = new Redis(process.env.REDIS_URL || "redis://127.0.0.1:6379");

redisClient.on("connect", () => {
  console.log("⚡ Redis TCP connection established");
});

redisClient.on("ready", () => {
  console.log("✅ Redis Client ready for commands");
});

redisClient.on("error", (err) => {
  console.error("❌ Redis Error:", err.message);
});

redisClient.on("close", () => {
  console.log("🔌 Redis connection closed");
});

redisClient.on("reconnecting", () => {
  console.log("🔄 Redis reconnecting...");
});

async function shutdown() {
  try {
    console.log("Closing Redis connection...");
    await redisClient.quit();
    console.log("Redis connection closed.");
    process.exit(0);
  } catch (err) {
    console.error("Error during Redis shutdown:", err);
    process.exit(1);
  }
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);


export default redisClient;
