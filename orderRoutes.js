const express = require("express");
const router = express.Router();

const {
  placeOrder,
  getMyOrders,
  directOrder,
  updateOrderStatus,
  shipOrder,
  deliverOrder,
  cancelOrder,
  generateInvoice   // 👈 ADD THIS
} = require("../controllers/orderController");

const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

// Place Order
router.post("/", auth, placeOrder);

// Direct Order
router.post("/direct", auth, directOrder);

// Get Orders
router.get("/", auth, getMyOrders);

// Seller
router.put("/:orderId/ship", auth, role("seller", "admin"), shipOrder);

// Delivery
router.put("/:orderId/deliver", auth, role("delivery", "admin"), deliverOrder);

// User
router.put("/:orderId/cancel", auth, role("user", "admin"), cancelOrder);

// Admin
router.put("/:orderId/status", auth, role("admin"), updateOrderStatus);

router.get("/:id/invoice", generateInvoice);


module.exports = router;

