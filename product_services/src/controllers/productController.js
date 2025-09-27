import * as productService from "../services/productService.js";

// ----------------- Helper -----------------
function parseProductData(req) {
  if (!req.body.productData) {
    throw new Error("Missing 'productData' field in request body");
  }

  let data;
  try {
    data = JSON.parse(req.body.productData); // Parse JSON string sent in 'productData'
  } catch (err) {
    throw new Error("Invalid JSON format in 'productData'");
  }

  return data;
}


// GET /api/products/homeproducts
export async function getAllProducts(req, res) {
  try {
    const products = await productService.getAllProducts();
    res.status(200).json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// GET /api/products/category/:slug
export async function getProductsByCategory(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const data = await productService.getProductsByCategorySlug(req.params.slug, page, pageSize);
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(404).json({ success: false, error: err.message });
  }
}

// POST /api/products
export async function createProduct(req, res) {
  try {
    const data = parseProductData(req);
    const files = req.files || []; // Support multiple file uploads
    const product = await productService.createProduct(data, files);
    res.status(201).json({ success: true, message: "Product created", data: product });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}

// PUT /api/products/:id
export async function updateProduct(req, res) {
  try {
    const id = parseInt(req.params.id);
    const data = parseProductData(req);
    const files = req.files || [];
    const product = await productService.updateProduct(id, data, files);
    res.status(200).json({ success: true, message: "Product updated", data: product });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}

// DELETE /api/products/:id
export async function deleteProduct(req, res) {
  try {
    const id = parseInt(req.params.id);
    const product = await productService.deleteProduct(id);
    res.status(200).json({ success: true, message: "Product deleted", data: product });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}


// GET /api/products/category-sliders
export async function getProductsByAllParentCategories(req, res) {
  try {
    const data = await productService.getProductsByAllParentCategories();
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// GET /api/products/:slug
// export async function getProductBySlug(req, res) {
//   try {
//     const product = await productService.getProductBySlug(req.params.slug);
//     res.status(200).json({ success: true, data: product });
//   } catch (err) {
//     res.status(404).json({ success: false, error: err.message });
//   }
// }


export async function getProductBySlug(req, res) {
  try {
    const product = await productService.getProductBySlug(req.params.slug);
    res.status(200).json({ success: true, data: product });
  } catch (err) {
    res.status(404).json({ success: false, error: err.message });
  }
}



export async function searchProducts(req, res) {
  try {
    const query = req.query.q || "";
    console.log(query)
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;

    const data = await productService.searchProducts(query, page, pageSize);

    res.status(200).json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message, });
  }
}

