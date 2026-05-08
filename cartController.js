const Cart = require("../models/Cart");

// ➤ ADD TO CART
exports.addToCart = async (req, res) => {
  const { productId, quantity } = req.body;

  let cart = await Cart.findOne({ user: req.user.id });

  if (!cart) {
    cart = new Cart({ user: req.user.id, items: [] });
  }

  const itemIndex = cart.items.findIndex(
    item => item.product.toString() === productId
  );

  if (itemIndex > -1) {
    // ✅ UPDATE quantity
    cart.items[itemIndex].quantity += quantity;
  } else {
    // ✅ ADD new item
    cart.items.push({
      product: productId,
      quantity: quantity || 1
    });
  }


  // 🔥 👉 YAHAN PASTE KARO (IMPORTANT)
  cart.items = cart.items.filter(
    (item, index, self) =>
      index === self.findIndex(i =>
        (i.product._id ? i.product._id.toString() : i.product.toString()) ===
        (item.product._id ? item.product._id.toString() : item.product.toString())
      )
  );


  await cart.save();

  res.json({
    msg: "Added to cart",
    cart
  });
};

// ➤ GET CART

exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id })
      .populate("items.product");

    if (!cart) {
      return res.json({ cart: null, total: 0 });
    }

    let total = 0;

    cart.items.forEach(item => {
      if (item.product && item.product.price) {
        total += item.product.price * item.quantity;
      }
    });

    res.json({ cart, total });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};


// ➤ REMOVE FROM CART
exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.body;

    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({ msg: "Cart not found" });
    }

    cart.items = cart.items.filter(
      item => (item.product._id || item.product).toString() !== productId
    );

    await cart.save();

    res.json({ msg: "Removed from cart", cart });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ➤ UPDATE QUANTITY
exports.updateQuantity = async (req, res) => {
  try {
    const { productId, action } = req.body;

    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({ msg: "Cart not found" });
    }

    const item = cart.items.find(
      item => (item.product._id || item.product).toString() === productId
    );

    if (!item) {
      return res.status(404).json({ msg: "Item not found" });
    }

    if (action === "inc") {
      item.quantity += 1;
    } else if (action === "dec") {
      item.quantity -= 1;

      if (item.quantity <= 0) {
        cart.items = cart.items.filter(
          i => (i.product._id || i.product).toString() !== productId
        );
      }
      if (item.quantity < 1) item.quantity = 1;
    }

    await cart.save();

    res.json({ msg: "Quantity updated", cart });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};