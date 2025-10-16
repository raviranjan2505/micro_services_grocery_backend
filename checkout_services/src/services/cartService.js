import axios from "axios";
export async function fetchUserCart(token) {
  const { data } = await axios.get(`${process.env.CART_SERVICE_URL}/v1/cart/`, {
    headers: { Authorization: token },
  });

  if (!data.success) return [];
  return data.data?.items || [];
}