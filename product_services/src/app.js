import express from "express";
import bodyParser from "body-parser";

import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";

const app = express();
app.use(bodyParser.json());

app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);

export default app;