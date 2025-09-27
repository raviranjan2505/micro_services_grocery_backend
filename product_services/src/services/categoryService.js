import prisma from "../prisma/client.js";
import redisClient from "../config/redis.js";
import cloudinary from "../config/cloudinary.js";
import crypto from "crypto";

const CATEGORY_CACHE_KEY = "categories:all";

async function uploadImage(file, folder = "categories") {
  if (!file) return null;

  // Calculate hash
  const hash = crypto.createHash("md5").update(file.buffer).digest("hex");

  // Upload to Cloudinary using hash as public_id
  const uploaded = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, public_id: hash, overwrite: true }, // overwrite ensures no duplicates
      (err, res) => {
        if (err) reject(err);
        else resolve({ url: res.secure_url, publicId: res.public_id });
      }
    );
    stream.end(file.buffer);
  });

  return { ...uploaded, hash };
}


// ------------------ Recursive formatter for nested categories ------------------
async function formatNestedCategories(category, filesMap) {
  const { subcategories, imageKey, ...rest } = category;
  const formatted = { ...rest };

  // Upload image if provided
  if (imageKey && filesMap[imageKey]?.length) {
    const file = filesMap[imageKey][0];
    const uploaded = await uploadImage(file, "categories");
    formatted.image = uploaded.url;
    formatted.imagePublicId = uploaded.publicId;
    formatted.imageHash = uploaded.hash; // store hash for deduplication
  }

  // Recursively handle subcategories
  if (subcategories?.length) {
    formatted.subcategories = {
      create: await Promise.all(
        subcategories.map((sub) => formatNestedCategories(sub, filesMap))
      ),
    };
  }

  return formatted;
}

// ------------------ Get All Categories ------------------
export async function getAllCategories() {
  const cached = await redisClient.get(CATEGORY_CACHE_KEY);
  if (cached) return JSON.parse(cached);

  const categories = await prisma.category.findMany({
    where: { parentId: null },
    include: {
      subcategories: {
        include: {
          subcategories: { include: { subcategories: true } },
        },
      },
    },
    orderBy: { id: "asc" },
  });

  await redisClient.setEx(CATEGORY_CACHE_KEY, 300, JSON.stringify(categories));
  return categories;
}

// ------------------ Get Category by ID ------------------
export async function getCategoryById(id) {
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      subcategories: {
        include: {
          subcategories: { include: { subcategories: true } },
        },
      },
    },
  });

  if (!category) throw new Error(`Category with id ${id} not found`);
  return category;
}

// ------------------ Create Category ------------------
export async function createCategory(data, files = []) {
  const filesMap = files.reduce((map, file) => {
    map[file.fieldname] = map[file.fieldname] || [];
    map[file.fieldname].push(file);
    return map;
  }, {});

  const formattedData = await formatNestedCategories(data, filesMap);

  const category = await prisma.category.create({
    data: formattedData,
    include: {
      subcategories: { include: { subcategories: { include: { subcategories: true } } } },
    },
  });

  await redisClient.del(CATEGORY_CACHE_KEY);
  return category;
}

// ------------------ Update Category ------------------
export async function updateCategory(id, data, files = []) {
  const filesMap = files.reduce((map, file) => {
    map[file.fieldname] = map[file.fieldname] || [];
    map[file.fieldname].push(file);
    return map;
  }, {});

  const formattedData = await formatNestedCategories(data, filesMap);

  const updated = await prisma.category.update({
    where: { id },
    data: formattedData,
    include: {
      subcategories: { include: { subcategories: { include: { subcategories: true } } } },
    },
  });

  await redisClient.del(CATEGORY_CACHE_KEY);
  return updated;
}

// ------------------ Delete Category ------------------
export async function deleteCategory(id) {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) throw new Error("Category not found");

  const hasProducts = await prisma.product.findFirst({
    where: { categoryId: id },
  });
  if (hasProducts) throw new Error("Cannot delete category with products");

  if (category.imagePublicId) {
    await cloudinary.uploader.destroy(category.imagePublicId);
  }

  await prisma.category.delete({ where: { id } });
  await redisClient.del(CATEGORY_CACHE_KEY);
}
