const Razorpay = require("razorpay");
const crypto = require("crypto");
const Order = require("../models/order");

// 🔑 INIT
let razorpay;

try {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY,
    key_secret: process.env.RAZORPAY_SECRET,
  });

  console.log("✅ Razorpay initialized");

} catch (err) {
  console.error("❌ Razorpay INIT ERROR:", err);
}

// 🟢 1. CREATE RAZORPAY ORDER
exports.createPayment = async (req, res) => {
  try {
    // ✅ SAFE CHECK (same logic, no break)
    if (!razorpay) {
      console.log("❌ Razorpay not initialized");
      return res.status(500).json({ msg: "Razorpay not initialized" });
    }

    // 🔥 DEBUG (add only, logic untouched)
    console.log("👉 BODY:", req.body);
    console.log("👉 KEY:", process.env.RAZORPAY_KEY);
    console.log("👉 SECRET:", process.env.RAZORPAY_SECRET);

    const { amount } = req.body;

    if (!amount || isNaN(amount)) {
      return res.status(400).json({ msg: "Valid amount required" });
    }

    const options = {
      amount: Number(amount) * 100,
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    };

    console.log("👉 OPTIONS:", options);

    const order = await razorpay.orders.create(options);

    console.log("✅ RAZORPAY ORDER:", order);

    res.json(order);

} catch (err) {
  console.error("❌ FULL ERROR:", err);

  res.status(500).json({
    message: err?.error?.description || err.message || "Unknown error",
    full: err
  });
}
};
// 🟢 2. VERIFY PAYMENT
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId // 👉 DB order id
    } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(sign)
      .digest("hex");

    if (expectedSign !== razorpay_signature) {
      return res.status(400).json({ msg: "Payment verification failed" });
    }

    // ✅ UPDATE ORDER IN DB
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ msg: "Order not found" });
    }

    order.paymentStatus = "Paid";
    order.status = "Confirmed";
    order.paidAt = Date.now();

    await order.save();

    res.json({
      msg: "Payment verified successfully",
      order
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// 🟢 3. FAIL / CANCEL HANDLE (OPTIONAL)
exports.paymentFailed = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);

    if (order) {
      order.paymentStatus = "Failed";
      await order.save();
    }

    res.json({ msg: "Payment failed updated" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
