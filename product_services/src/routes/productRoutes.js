import { Router } from "express";
import * as productController from "../controllers/productController.js";
import { upload } from "../config/multer.js";

const router = Router();

router.get("/search", productController.searchProducts);
router.get("/allproducts", productController.getAllProducts);
router.get("/category-sliders", productController.getProductsByAllParentCategories);
router.post("/", upload.array("images", 10), productController.createProduct);
router.put("/:id", upload.array("images", 10), productController.updateProduct);
router.delete("/:id", productController.deleteProduct);
router.get("/category/:slug", productController.getProductsByCategory);
router.get("/:slug", productController.getProductBySlug);


export default router;
