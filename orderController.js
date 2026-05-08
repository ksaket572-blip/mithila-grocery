const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
 const User = require("../models/User");// ✅ add this

// ➤ PLACE ORDER
exports.placeOrder = async (req, res) => {
  try {
    const {  productId, quantity, shippingAddress, paymentMethod } = req.body;
    // 🔴 VALIDATION
    if (!productId || !quantity) {
      return res.status(400).json({ msg: "Product and quantity required" });
    }

    // ❌ Payment Method check
    if (!paymentMethod) {
     return res.status(400).json({ msg: "Payment method is required" });
    }
    if (!shippingAddress) {
      return res.status(400).json({ msg: "Address required" });
    }

    const cart = await Cart.findOne({ user: req.user.id })
      .populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ msg: "Cart empty" });
    }

    // remove invalid products
    cart.items = cart.items.filter(item => item.product);

    let total = 0;

    cart.items.forEach(item => {
      total += item.product.price * item.quantity;
    });

    // 🔥 👉 YAHAN PASTE KARO (IMPORTANT)
    for (let item of cart.items) {
  // ❌ Quantity check
  if (!item.quantity || item.quantity <= 0) {
    return res.status(400).json({
      msg: "Invalid quantity in cart"
    });
  }

  // ❌ Stock check
  if (item.product.stock < item.quantity) {
    return res.status(400).json({
      msg: `${item.product.name} is out of stock`
    });
  }
}

    let paymentStatus, orderStatus;

    if (paymentMethod === "ONLINE") {
      paymentStatus = "Pending";   // ✅ पहले pending
      orderStatus = "Pending";     // ✅ confirm बाद में
     } else {
       paymentStatus = "Pending";
       orderStatus = "Confirmed";   // COD direct confirm
     }

    const order = new Order({
      user: req.user.id,
      items: cart.items.map(item => ({
        product: item.product._id,
        quantity: item.quantity
      })),
      totalAmount: total,
      shippingAddress,
      paymentMethod,
      paymentStatus,
      status: orderStatus
    });

    await order.save();

    // clear cart
    cart.items = [];
    await cart.save();

    res.json({ msg: "Order placed successfully", order });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ➤ GET USER ORDERS
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate("items.product")
      .sort({ createdAt: -1 });

    res.json(orders);

  } catch (err) {
    console.log("GET ORDERS ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

//Direct Order

exports.directOrder = async (req, res) => {
  try {
    const { productId, quantity, shippingAddress, paymentMethod } = req.body;

    // 🔴 VALIDATION
    if (!productId || !quantity) {
      return res.status(400).json({ msg: "Product and quantity required" });
    }

    if (!paymentMethod) {
      return res.status(400).json({ msg: "Payment method is required" });
    }

    if (
      !shippingAddress ||
      !shippingAddress.address ||
      !shippingAddress.city ||
      !shippingAddress.postalCode ||
      !shippingAddress.country ||
      !shippingAddress.phone
    ) {
      return res.status(400).json({ msg: "Complete shipping address required" });
    }

    // 🔍 PRODUCT FIND
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }

    // ❌ STOCK CHECK
    if (product.stock < quantity) {
      return res.status(400).json({
        msg: `${product.name} is out of stock`
      });
    }

    // 💰 TOTAL
    const total = product.price * quantity;

    // 🧠 SAME LOGIC AS CART ORDER
    let paymentStatus = "Pending";
    let orderStatus = "Pending";

    if (paymentMethod === "ONLINE") {
      paymentStatus = "Paid";
      orderStatus = "Confirmed";
    }

    if (paymentMethod === "COD") {
      paymentStatus = "Pending";
      orderStatus = "Confirmed";
    }

    // 📦 CREATE ORDER
    const order = new Order({
      user: req.user.id,
      items: [
        {
          product: product._id,
          quantity
        }
      ],
      totalAmount: total,
      shippingAddress,
      paymentMethod,
      paymentStatus,
      status: orderStatus
    });

    await order.save();

    res.json({
      msg: "Direct order placed successfully",
      order
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatus = ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"];

    if (!validStatus.includes(status)) {
      return res.status(400).json({ msg: "Invalid status" });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ msg: "Order not found" });
    }

    order.status = status;
    if (status === "Confirmed") order.confirmedAt = Date.now();
    await order.save();

    res.json({
      msg: "Order status updated",
      order
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.shipOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) return res.status(404).json({ msg: "Order not found" });

    if (order.status !== "Confirmed") {
      return res.status(400).json({ msg: "Order not ready for shipping" });
    }

    order.status = "Shipped";
    order.shippedAt = Date.now();
    await order.save();

    res.json({ msg: "Order shipped", order });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deliverOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) return res.status(404).json({ msg: "Order not found" });

    if (order.status !== "Shipped") {
      return res.status(400).json({ msg: "Order not shipped yet" });
    }

    order.status = "Delivered";
    order.deliveredAt = Date.now();
    await order.save();

    res.json({ msg: "Order delivered", order });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) return res.status(404).json({ msg: "Order not found" });

    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Not your order" });
    }

    if (order.status === "Delivered") {
      return res.status(400).json({ msg: "Cannot cancel delivered order" });
    }

    order.status = "Cancelled";
    order.cancelledAt = Date.now();
    await order.save();

    res.json({ msg: "Order cancelled", order });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



const PDFDocument = require("pdfkit");
const nodemailer = require("nodemailer");

const sendInvoiceEmail = async (userEmail, pdfBuffer) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: "Invoice 🧾",
    text: "Your invoice is attached",
    attachments: [
      {
        filename: "invoice.pdf",
        content: pdfBuffer,
      },
    ],
  });
};

exports.generateInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("items.product")
      .populate("user");

    if (!order) {
      return res.status(404).json({ msg: "Order not found" });
    }

    const doc = new PDFDocument();

    const buffers = [];

    doc.on("data", buffers.push.bind(buffers));

    doc.on("end", async () => {
      const pdfData = Buffer.concat(buffers);

      // 📧 EMAIL SEND
      await sendInvoiceEmail(order.user.email, pdfData);

      // 📥 SEND TO FRONTEND
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "inline; filename=invoice.pdf");

      res.send(pdfData);
    });

    // 🧾 PDF CONTENT
    doc.fontSize(20).text("INVOICE", { align: "center" });

    doc.text(`Order ID: ${order._id}`);
    doc.text(`Customer: ${order.user.email}`);
    doc.text(`Total: ₹${order.totalAmount}`);

    doc.moveDown();

    order.items.forEach((item) => {
      doc.text(
        `${item.product.name} - ${item.quantity} x ₹${item.product.price}`
      );
    });

    doc.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};