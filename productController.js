const Product = require("../models/Product");

// ➤ ADD PRODUCT (Seller)
exports.addProduct = async (req, res) => {
  try {
    const { name, price, description, category, stock } = req.body;
        // 🔥 DEBUG (यहीं डालना है)
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);
    console.log("USER:", req.user);
    const userId = req.user.id || req.user._id;//new fix
    const product = new Product({
      name,
      price,
      description,
      //image,
      category,
      stock,
      image: req.file?.filename || "",
      user: req.user.id //FINAL FIX
    });

    await product.save();

    res.json({
      msg: "Product added successfully",
      product
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

// ➤ GET ALL PRODUCTS
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(products);

  } catch (err) {
    console.log("ERROR:", err); // 👈 IMPORTANT
    res.status(500).json({ error: err.message });
  }
};

// ➤ GET SINGLE PRODUCT
exports.getSingleProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("user", "name email");

    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }

    res.json(product);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET seller products
exports.getSellerProducts = async (req, res) => {
  try {
    const products = await Product.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//delete
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id   // 🔥 important (seller security)
    });

    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }

    res.json({ msg: "Product deleted successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//update
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user.id   // 🔥 important
      },
      req.body,
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }

    res.json(product);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


