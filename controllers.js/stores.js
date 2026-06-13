const Store = require("../models/Store");
const { isDemoMode } = require("../config/demo");
const mockStores = require("../mock/stores");

exports.getStores = async (req, res) => {
  try {
    if (isDemoMode()) {
      const stores = mockStores.getAll();
      return res.status(200).json({
        success: true,
        count: stores.length,
        data: stores,
        demoMode: true
      });
    }

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

exports.addStore = async (req, res) => {
  try {
    if (isDemoMode()) {
      const store = mockStores.create(req.body);
      return res.status(200).json({
        success: true,
        data: store,
        demoMode: true
      });
    }

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
