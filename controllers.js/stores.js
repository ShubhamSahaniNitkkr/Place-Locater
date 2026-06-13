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

function buildStorePayload(body) {
  const payload = {
    storeId: body.storeId,
    address: body.address
  };

  const lat = parseFloat(body.latitude);
  const lng = parseFloat(body.longitude);

  if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
    payload.location = {
      type: "Point",
      coordinates: [lng, lat],
      formattedAddress: body.address
    };
  }

  return payload;
}

exports.addStore = async (req, res) => {
  try {
    const storePayload = buildStorePayload(req.body);

    if (isDemoMode()) {
      const store = mockStores.create(storePayload);
      return res.status(200).json({
        success: true,
        data: store,
        demoMode: true
      });
    }

    const store = await Store.create(storePayload);
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
