const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    description: String,
    image: String,
    category: String,
    stock: {
      type: Number,
      default: 1
    },

    // 🔥 IMPORTANT CHANGE
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);