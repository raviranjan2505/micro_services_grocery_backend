import axios from "axios";

export async function fetchProduct(productId) {
  try {
    const { data } = await axios.get(`${process.env.PRODUCT_SERVICE_URL}/api/products/productId/${productId}`);
    if (!data.success) throw new Error("Product not found in Product Service");
    return data.data;
  } catch (err) {
    throw new Error("Product validation failed: " + err.message);
  }
}
