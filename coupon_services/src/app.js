import express from "express";
import bodyParser from "body-parser";
import couponRoutes from "../src/routes/couponRoutes.js"

const app = express();
app.use(bodyParser.json());

app.use("/api/coupons", couponRoutes);

export default app;