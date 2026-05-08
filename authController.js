const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register
exports.register = async (req, res) => {    
  try {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    //security 
        let finalRole = "user";
    if (role === "seller") {
      finalRole = "seller";
    }

    const newUser = new User({
    name,
    email,
    password: hashedPassword,
    role: finalRole,//role: role || "user",   // 👈 default buyer // ✅ FIXED
  });

    await newUser.save();

    return res.json({ msg: "User registered successfully" });

  } catch (err) {
    console.log(err); // 👈 IMPORTANT
    return res.status(500).json({ error: err.message });
  }
};

// Login

console.log("NEW LOGIN CODE RUNNING");

exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // 1. Check user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    // 2. Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid password" });
    }


    // 3. Create JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },  // 🔥 ADD role { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 4. Send response
    return res.json({
      msg: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role   // ✅ FIXED
      },
    });

  } catch (err) {  
    return res.status(500).json({ error: err.message });
  }
};

exports.becomeSeller = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    user.role = "seller";
    await user.save();

    res.json({ message: "You are now a seller", user });
  } catch (error) {
    res.status(500).json({ message: "Error becoming seller" });
  }
};