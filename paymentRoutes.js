const express = require("express");
const router = express.Router();

const {
  createPayment,
  verifyPayment,
  paymentFailed
} = require("../controllers/paymentController");

const auth = require("../middleware/authMiddleware");

// 🔥 ROUTES
router.post("/create", auth, createPayment);
router.post("/verify", auth, verifyPayment);
router.post("/failed", auth, paymentFailed);

module.exports = router;