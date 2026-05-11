require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// SIMPLE CORS
app.use(cors());

// BODY PARSER
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ROUTES
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const addressRoutes = require("./routes/addressRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/address", addressRoutes);

// STATIC UPLOADS
app.use("/uploads", express.static("uploads"));

// TEST ROUTE
app.get("/", (req, res) => {
  res.send("API Running...");
});

// DATABASE CONNECTION (Updated with Timeouts)
mongoose
  .connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000, // Wait 5 seconds before timing out
    socketTimeoutMS: 45000,         // Close connection after 45 seconds of inactivity
  })
  .then(() => {
    console.log("✅ MongoDB Atlas Connected Successfully");
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error Details:");
    console.error("Message:", err.message);
    console.error("Reason:", err.reason ? err.reason.type : "Unknown");
  });

// SERVER
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
