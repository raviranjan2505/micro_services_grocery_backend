import * as categoryService from "../services/categoryService.js";

export async function getAllCategories(req, res) {
  try {
    const categories = await categoryService.getAllCategories();
    res.json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getCategoryById(req, res) {
  try {
    const category = await categoryService.getCategoryById(Number(req.params.id));
    res.json({ success: true, data: category });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}

export async function createCategory(req, res) {
  try {
    const data = JSON.parse(req.body.categoryData); 
    const files = req.files;
    const category = await categoryService.createCategory(data, files);
    res.status(201).json({ success: true, data: category });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message, });
  }
}



export async function updateCategory(req, res) {
  try {
    const bodyData = JSON.parse(req.body.data);

    const updated = await categoryService.updateCategory(
      Number(req.params.id),
      bodyData,
      req.files
    );

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}

export async function deleteCategory(req, res) {
  try {
    await categoryService.deleteCategory(Number(req.params.id));
    res.json({ success: true, message: "Category deleted successfully" });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}
