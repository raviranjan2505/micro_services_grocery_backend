import prisma from "../prisma/client.js";
import redisClient from "../config/redis.js";
import cloudinary from "../config/cloudinary.js";
import crypto from "crypto";

const HOME_PRODUCTS_CACHE_KEY = "products:home";

// ------------------ Generate Hash ------------------
function getFileHash(buffer) {
  return crypto.createHash("md5").update(buffer).digest("hex");
}

// ------------------ Upload Single Image (with dedup) ------------------
async function uploadImageWithDedup(file, folder = "products") {
  if (!file) return null;

  // 1. Hash file
  const hash = getFileHash(file.buffer);

  // 2. Check if already exists in DB
  const existing = await prisma.productImage.findFirst({
    where: { url: { contains: hash } }, // or store hash in DB if needed
  });

  if (existing) {
    return { url: existing.url, publicId: existing.publicId, hash };
  }

  // 3. Upload to Cloudinary with hash as public_id
  const uploaded = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: hash,
        unique_filename: false,
        overwrite: false,
      },
      (err, res) => {
        if (err) reject(err);
        else resolve({ url: res.secure_url, publicId: res.public_id });
      }
    );
    stream.end(file.buffer);
  });

  return { ...uploaded, hash };
}

// ------------------ Upload Multiple Images ------------------
async function uploadImages(files, folder = "products") {
  if (!files?.length) return [];
  const uploaded = [];

  for (const file of files) {
    const result = await uploadImageWithDedup(file, folder);
    if (result) uploaded.push(result.url); // only return url for DB
  }

  // Remove duplicates in case same image passed twice in one request
  return [...new Set(uploaded)];
}

// ------------------ GET Home Products ------------------
export async function getAllProducts() {
  const cached = await redisClient.get(HOME_PRODUCTS_CACHE_KEY);
  if (cached) return JSON.parse(cached);

  const products = await prisma.product.findMany({
    take: 10,
    orderBy: { id: "desc" },
    include: {
      brand: true,
      category: true,
      attributes: { include: { attribute: true } },
      variants: true,
      images: true,
    },
  });

  await redisClient.setEx(HOME_PRODUCTS_CACHE_KEY, 300, JSON.stringify(products));
  return products;
}

// ------------------ Get Products by Category ------------------
export async function getProductsByCategorySlug(slug, page = 1, pageSize = 10) {
  const cacheKey = `products:category:${slug}:page:${page}`;
  const cached = await redisClient.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) throw new Error("Category not found");


  const skip = (page - 1) * pageSize;

  const whereClause = {
    OR: [
      { categoryId: category.id },
      { subCategoryId: category.id },
      { subCategoryId2: category.id },
    ],
  };

  const [items, totalCount] = await Promise.all([
    prisma.product.findMany({
      where: whereClause,
      skip,
      take: pageSize,
      include: {
        brand: true,
        category: true,
        attributes: { include: { attribute: true } },
        variants: true,
        images: true,
      },
    }),
    prisma.product.count({ where: whereClause }),
  ]);

  const data = {
    items,
    pageNumber: page,
    pageSize,
    totalCount,
    totalPages: Math.ceil(totalCount / pageSize),
  };

  await redisClient.setEx(cacheKey, 120, JSON.stringify(data));
  return data;
}

// ------------------ Create Product ------------------
export async function createProduct(data, files) {
  // Brand
  let brandId = null;
  if (data.brandName) {
    const brand = await prisma.brand.upsert({
      where: { name: data.brandName },
      update: {},
      create: { name: data.brandName, logo: data.brandLogo || null },
    });
    brandId = brand.id;
  }

  // Attributes
  const attributesToCreate = [];
  if (data.attributes?.length) {
    for (const attr of data.attributes) {
      const attribute = await prisma.attribute.upsert({
        where: { name: attr.name },
        update: {},
        create: { name: attr.name },
      });
      attributesToCreate.push({ attributeId: attribute.id, value: attr.value });
    }
  }

  // Variants
  const variantsToCreate =
    data.variants?.map((v) => ({
      sku: v.sku,
      price: v.price,
      stock: v.stock,
      attributes: v.attributes || {},
    })) || [];

  // Images with dedup
  const uploadedFiles = await uploadImages(files);
  const imagesToCreate = uploadedFiles.map((url, i) => ({
    url,
    isDefault: i === 0,
  }));

  const product = await prisma.product.create({
    data: {
      productCode: data.productCode,
      productName: data.productName,
      shortDescription: data.shortDescription || null,
      fullDescription: data.fullDescription || null,
      gstPercentage: data.gstPercentage || 0,
      categoryId: data.categoryId,
      subCategoryId: data.subCategoryId || null,
      subCategoryId2: data.subCategoryId2 || null,
      brandId,
      mrp: data.mrp,
      dp: data.dp,
      stockQuantity: data.stockQuantity,
      productSlug: data.productSlug,
      defaultImage: uploadedFiles[0] || null,
      attributes: { create: attributesToCreate },
      variants: { create: variantsToCreate },
      images: { create: imagesToCreate },
    },
    include: {
      brand: true,
      attributes: { include: { attribute: true } },
      variants: true,
      images: true,
    },
  });

  await redisClient.del(HOME_PRODUCTS_CACHE_KEY);
  return product;
}

// ------------------ Update Product ------------------
export async function updateProduct(productId, data, files) {
  const existingProduct = await prisma.product.findUnique({ where: { id: productId } });
  if (!existingProduct) throw new Error("Product not found");

  let brandId = existingProduct.brandId;
  if (data.brandName) {
    const brand = await prisma.brand.upsert({
      where: { name: data.brandName },
      update: {},
      create: { name: data.brandName, logo: data.brandLogo || null },
    });
    brandId = brand.id;
  }

  const nested = {};

  // Attributes
  if (data.attributes?.length) {
    await prisma.productAttribute.deleteMany({ where: { productId } });
    const attrs = [];
    for (const attr of data.attributes) {
      const attribute = await prisma.attribute.upsert({
        where: { name: attr.name },
        update: {},
        create: { name: attr.name },
      });
      attrs.push({ attributeId: attribute.id, value: attr.value });
    }
    nested.attributes = { create: attrs };
  }

  // Variants
  if (data.variants?.length) {
    await prisma.productVariant.deleteMany({ where: { productId } });
    nested.variants = {
      create: data.variants.map((v) => ({
        sku: v.sku,
        price: v.price,
        stock: v.stock,
        attributes: v.attributes || {},
      })),
    };
  }

  // Images with dedup
  if (files?.length) {
    await prisma.productImage.deleteMany({ where: { productId } });
    const uploadedFiles = await uploadImages(files);
    nested.images = {
      create: uploadedFiles.map((url, i) => ({ url, isDefault: i === 0 })),
    };
    if (uploadedFiles[0]) data.defaultImage = uploadedFiles[0];
  }

  const updatedProduct = await prisma.product.update({
    where: { id: productId },
    data: { ...data, brandId, ...nested },
    include: {
      brand: true,
      attributes: { include: { attribute: true } },
      variants: true,
      images: true,
    },
  });

  await redisClient.del(HOME_PRODUCTS_CACHE_KEY);
  return updatedProduct;
}

// ------------------ Delete Product ------------------
export async function deleteProduct(productId) {
  const existingProduct = await prisma.product.findUnique({ where: { id: productId } });
  if (!existingProduct) throw new Error("Product not found");

  await prisma.productAttribute.deleteMany({ where: { productId } });
  await prisma.productVariant.deleteMany({ where: { productId } });
  await prisma.productImage.deleteMany({ where: { productId } });

  const deletedProduct = await prisma.product.delete({ where: { id: productId } });
  await redisClient.del(HOME_PRODUCTS_CACHE_KEY);
  return deletedProduct;
}


export async function getProductsByAllParentCategories() {

  const parentCategories = await prisma.category.findMany({
    where: { parentId: null, active: true },
    select: { id: true, name: true, slug: true, image: true }
  });

  if (!parentCategories.length) return [];

  const products = await prisma.product.findMany({
    where: {
      OR: [
        { categoryId: { in: parentCategories.map(c => c.id) } },
        { subCategoryId: { in: parentCategories.map(c => c.id) } },
        { subCategoryId2: { in: parentCategories.map(c => c.id) } }
      ]
    },
    include: {
      brand: true,
      category: true,
      attributes: { include: { attribute: true } },
      variants: true,
      images: true
    }
  });

  // 3. Group products by their parent category
  const grouped = parentCategories.map(parent => ({
    ...parent,
    products: products.filter(
      p =>
        p.categoryId === parent.id ||
        p.subCategoryId === parent.id ||
        p.subCategoryId2 === parent.id
    )
  }));

  return grouped;
}


// ------------------ Get Product Details ------------------
// export async function getProductBySlug(productSlug) {
//   const product = await prisma.product.findUnique({
//     where: { productSlug },
//     include: {
//       brand: true,
//       category: true,
//       attributes: { include: { attribute: true } },
//       variants: true,
//       images: true,
//       discounts: true
//     }
//   });

//   if (!product) throw new Error("Product not found");

//   return product;
// }


// ------------------ Get Product Details + Related ------------------
// export async function getProductBySlug(productSlug) {
//   const product = await prisma.product.findUnique({
//     where: { productSlug },
//     include: {
//       brand: true,
//       category: true,
//       attributes: { include: { attribute: true } },
//       variants: true,
//       images: true,
//       discounts: true,
//     },
//   });

//   if (!product) throw new Error("Product not found");

//   // ✅ fetch related products (same category, exclude current product)
//   const relatedProducts = await prisma.product.findMany({
//     where: {
//       categoryId: product.categoryId,
//       NOT: { id: product.id },
//     },
//     take: 6, // limit to 6 for slider
//     include: {
//       brand: true,
//       images: { where: { isDefault: true } }, // only default image
//     },
//   });

//   return { ...product, relatedProducts };
// }


// ------------------ Get Product Details + Related ------------------
export async function getProductBySlug(productSlug) {
  const product = await prisma.product.findUnique({
    where: { productSlug },
    include: {
      brand: true,
      category: true,
      attributes: { include: { attribute: true } },
      variants: true,
      images: true,
      discounts: true,
    },
  });

  if (!product) throw new Error("Product not found");

  // ✅ related products logic
  let relatedProducts = [];

  if (product.subCategoryId2) {
    // prefer subCategoryId2
    relatedProducts = await prisma.product.findMany({
      where: {
        subCategoryId2: product.subCategoryId2,
        NOT: { id: product.id },
      },
      take: 6,
      include: {
        brand: true,
        images: { where: { isDefault: true } },
      },
    });
  } else if (product.subCategoryId) {
    // fallback to subCategoryId
    relatedProducts = await prisma.product.findMany({
      where: {
        subCategoryId: product.subCategoryId,
        NOT: { id: product.id },
      },
      take: 6,
      include: {
        brand: true,
        images: { where: { isDefault: true } },
      },
    });
  } else {
    // fallback to category
    relatedProducts = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        NOT: { id: product.id },
      },
      take: 6,
      include: {
        brand: true,
        images: { where: { isDefault: true } },
      },
    });
  }

  return { ...product, relatedProducts };
}




const SEARCH_CACHE_KEY = "products:search:";

export async function searchProducts(query, page = 1, pageSize = 10) {
  if (!query || query.trim() === "") {
    return {
      items: [],
      totalCount: 0,
      totalPages: 0,
      suggestions: []
    };
  }

  const cleanQuery = query.trim().toLowerCase();
  const cacheKey = `${SEARCH_CACHE_KEY}${cleanQuery}:page:${page}:size:${pageSize}`;

  // 1️⃣ Check Redis cache
  const cached = await redisClient.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const skip = (page - 1) * pageSize;

  // 2️⃣ Search products and total count
  const [items, totalCount] = await Promise.all([
    prisma.product.findMany({
      where: {
        OR: [
          { productName: { contains: query, mode: "insensitive" } },
          { shortDescription: { contains: query, mode: "insensitive" } },
          { brand: { name: { contains: query, mode: "insensitive" } } },
        ],
      },
      skip,
      take: pageSize,
      orderBy: { id: "desc" },
      include: {
        brand: true,
        category: true,
        attributes: { include: { attribute: true } },
        variants: true,
        images: true,
      },
    }),
    prisma.product.count({
      where: {
        OR: [
          { productName: { contains: query, mode: "insensitive" } },
          { shortDescription: { contains: query, mode: "insensitive" } },
          { brand: { name: { contains: query, mode: "insensitive" } } },
        ],
      },
    }),
  ]);

  // 3️⃣ Suggestions (top 5)
  const suggestions = await prisma.product.findMany({
    where: {
      OR: [
        { productName: { contains: query, mode: "insensitive" } },
        { shortDescription: { contains: query, mode: "insensitive" } },
        { brand: { name: { contains: query, mode: "insensitive" } } },
      ],
    },
    take: 5,
    orderBy: { id: "desc" },
    select: {
      id: true,
      productName: true,
      productSlug: true,
      defaultImage: true,
      brand: { select: { id: true, name: true } },
    },
  });

  const data = {
    items,
    pageNumber: page,
    pageSize,
    totalCount,
    totalPages: Math.ceil(totalCount / pageSize),
    suggestions,
  };

  // 4️⃣ Store in Redis for 5 minutes
  await redisClient.setEx(cacheKey, 300, JSON.stringify(data));

  return data;
}