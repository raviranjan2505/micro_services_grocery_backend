import multer from "multer";
import path from "path";

const storage = multer.memoryStorage();

function fileFilter(req, file, cb) {
  const allowedExt = [".jpg", ".jpeg", ".png", ".webp"];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedExt.includes(ext)) {
    cb(null, true);
  } else {
    cb(
      new Error("Only image files are allowed (jpg, jpeg, png, webp)"),
      false
    );
  }
}

// Allow multiple uploads
export const upload = multer({ storage, fileFilter });
