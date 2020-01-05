const Store = require("../models/Store");

//@desc Get All Stores
//@route GET /api/v1/stores
//@acess Public

exports.getStores = async (req, res, next) => {
  try {
    const stores = await Store.find();
    return res.status(200).json({
      success: true,
      count: stores.length,
      data: stores
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went Wrong." });
  }
};

//@desc Create new Store
//@route POST /api/v1/stores
//@acess Public

exports.addStore = async (req, res, next) => {
  try {
    const store = await Store.create(req.body);
    return res.status(200).json({
      success: true,
      data: store
    });
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      return res.status(400).json({ error: "Store Already Exist." });
    }
    res.status(500).json({ error: "Something went Wrong." });
  }
};
