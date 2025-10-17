// services/productService.js
import axios from "axios";

export async function fetchProduct(productId, token) {
  try {
    const { data } = await axios.get(
      `${process.env.PRODUCT_SERVICE_URL}/api/products/productId/${productId}`,
      {
        headers: { Authorization: token },
      }
    );

    if (!data.success || !data.data) {
      throw new Error(`Product ${productId} not found`);
    }

    const product = data.data;
    const price = product.dp ?? product.price ?? product.mrp;

    if (price == null) {
      throw new Error("Product price missing");
    }

    return {
      id: product.id ?? productId,
      name: product.name ?? product.productName ?? "Unnamed Product",
      image: product.defaultImage ?? product.images?.[0]?.url ?? null,
      price: Number(price),
    };
  } catch (err) {
    throw new Error("Product validation failed: " + err.message);
  }
}
