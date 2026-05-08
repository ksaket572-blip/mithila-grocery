exports.saveAddress = async (req, res) => {
  const { address, city, postalCode, country, phone } = req.body;

  const user = await User.findById(req.user.id);

  user.shippingAddress = {
    address,
    city,
    postalCode,
    country,
    phone
  };

  await user.save();

  res.json({
    msg: "Address saved",
    address: user.shippingAddress
  });
};