import express from "express";
import bodyParser from "body-parser";
import orderRoutes from "../src/routes/orderRoutes.js"

const app = express();
app.use(bodyParser.json());

app.use("/api/order", orderRoutes);

export default app;