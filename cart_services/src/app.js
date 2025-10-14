import express from "express";
import bodyParser from "body-parser";
import cartRoutes from "../src/routes/cartRoutes.js"

const app = express();
app.use(bodyParser.json());

app.use("/api/cart", cartRoutes);

export default app;