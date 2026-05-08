const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
      },
      quantity: Number
    }
  ],

  

  totalAmount: {
    type: Number,
    required: true
  },
  
  shippingAddress: {
      address: String,
      city: String,
      postalCode: String,
      country: String,
      phone: String
    },

    paymentMethod: {
      type: String,
      enum: ["COD", "ONLINE"],
      default: "COD"
    },


    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid"],
      default: "Pending"
    },


  
  status: {
  type: String,
  enum: ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"],
  default: "Confirmed"
  }

}, { timestamps: true });

module.exports = mongoose.models.Order || mongoose.model("Order", orderSchema);
