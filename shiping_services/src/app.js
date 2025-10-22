import express from "express";
import bodyParser from "body-parser";
import shipingRoutes from "../src/routes/shipingRoutes.js"

const app = express();
app.use(bodyParser.json());

app.use("/api/shipping", shipingRoutes);

export default app;