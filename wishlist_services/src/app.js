import express from "express";
import bodyParser from "body-parser";
import wishlistRoutes from "../src/routes/wishlistRoutes.js"

const app = express();
app.use(bodyParser.json());

app.use("/api/wishlist", wishlistRoutes);

export default app;