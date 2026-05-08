const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const { saveAddress } = require("../controllers/addressController");

router.post("/", auth, saveAddress);

module.exports = router;

const { becomeSeller } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

router.put("/become-seller", authMiddleware, becomeSeller);