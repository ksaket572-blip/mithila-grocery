const express = require("express");
const router = express.Router();

const {
  addProduct,
  getProducts,
  getSingleProduct,
  getSellerProducts,
  deleteProduct,
  updateProduct
} = require("../controllers/productController");

// ✅ NEW AUTH
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// ✅ upload
const upload = require("../middleware/upload");

// ===============================
// 🔥 ADD PRODUCT (SELLER ONLY)
// ===============================
router.post(
  "/add",
  authMiddleware,
  roleMiddleware("seller"),
  upload.single("image"),
  addProduct
);

// ===============================
// 🔥 SELLER PRODUCTS
// ===============================
router.get(
  "/my-products",
  authMiddleware,
  roleMiddleware("seller"),
  getSellerProducts
);

// ===============================
// 🔥 UPDATE PRODUCT
// ===============================
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("seller"),
  updateProduct
);

// ===============================
// 🔥 DELETE PRODUCT
// ===============================
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("seller"),
  deleteProduct
);

// ===============================
// 🌍 PUBLIC ROUTES
// ===============================
router.get("/", getProducts);
router.get("/:id", getSingleProduct);

module.exports = router;