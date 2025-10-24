import dotenv from "dotenv";
import app from "./app.js"; 
import errorHandler from "./middleware/errorHandler.js";
import logger from "./utils/logger.js";
dotenv.config();

app.use(errorHandler);
const PORT = process.env.PORT || 5006;

app.listen(PORT, () => {
  console.log(`Wishlist Service running on http://localhost:${PORT}`);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at", promise, "reason:", reason);
});
