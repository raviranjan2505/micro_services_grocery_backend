import { createClient } from "redis";

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://127.0.0.1:6379",
});

redisClient.on("error", (err) => console.error("Redis Error:", err));
redisClient.on("connect", () => console.log("Redis Connected"));

await redisClient.connect();

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
