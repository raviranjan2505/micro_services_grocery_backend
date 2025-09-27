import dotenv from "dotenv";
import app from "./app.js"; 
import errorHandler from "./middleware/errorHandler.js";
import logger from "./utils/logger.js";

dotenv.config();

app.use(errorHandler);
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  logger.info(
    `Identity service is running on port ${process.env.IDENTITY_SERVICE_URL}`
  );
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at", promise, "reason:", reason);
});
