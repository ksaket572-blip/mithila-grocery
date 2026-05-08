const express = require("express");
const router = express.Router();

const {
  addToCart,
  getCart,
  removeFromCart
} = require("../controllers/cartController");

const auth = require("../middleware/authMiddleware");

// ➤ ADD TO CART
router.post("/add", auth, addToCart);

// ➤ GET CART
router.get("/", auth, getCart);

// ➤ REMOVE FROM CART
router.post("/remove", auth, removeFromCart);

module.exports = router;

const { updateQuantity } = require("../controllers/cartController");

// ➤ UPDATE QUANTITY
router.post("/update", auth, updateQuantity);