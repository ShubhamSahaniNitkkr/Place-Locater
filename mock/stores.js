const stores = [
  {
    _id: "mock-1",
    storeId: "cafe-01",
    location: {
      type: "Point",
      coordinates: [77.209, 28.6139],
      formattedAddress: "Connaught Place, New Delhi, India"
    },
    createdAt: new Date()
  },
  {
    _id: "mock-2",
    storeId: "shop-02",
    location: {
      type: "Point",
      coordinates: [77.1025, 28.7041],
      formattedAddress: "Karol Bagh, New Delhi, India"
    },
    createdAt: new Date()
  },
  {
    _id: "mock-3",
    storeId: "park-03",
    location: {
      type: "Point",
      coordinates: [77.241, 28.5355],
      formattedAddress: "Nehru Place, New Delhi, India"
    },
    createdAt: new Date()
  }
];

function getAll() {
  return stores;
}

function create(data) {
  if (stores.some(s => s.storeId === data.storeId)) {
    const error = new Error("Store Already Exist.");
    error.code = 11000;
    throw error;
  }
  const store = {
    _id: `mock-${stores.length + 1}`,
    storeId: data.storeId,
    location: {
      type: "Point",
      coordinates: [77.31, 28.58],
      formattedAddress: data.address || "Demo Address"
    },
    createdAt: new Date()
  };
  stores.push(store);
  return store;
}

module.exports = { getAll, create };
