import express from "express";
import bodyParser from "body-parser";
import checkoutRoutes from "../src/routes/checkoutRoutes.js"

const app = express();
app.use(bodyParser.json());

app.use("/api/checkout", checkoutRoutes);

export default app;