const mongoose = require("mongoose");
const geoCoder = require("../utils/geocoder");

const StoreSchema = new mongoose.Schema({
  storeId: {
    type: String,
    required: ["true", "Please add a store ID"],
    unique: true,
    trim: true,
    maxlength: [10, "store id must be less than 10 chars"]
  },
  address: {
    type: String,
    required: [true, "Please add Address"]
  },
  location: {
    type: {
      type: String,
      enum: ["Point"]
    },
    coordinates: {
      type: [Number],
      index: "2dsphere"
    },
    formattedAddress: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

StoreSchema.pre("save", async function(next) {
  const loc = await geoCoder.geocode(this.address);
  this.location = {
    type: "Point",
    coordinates: [loc[0].longitude, loc[0].latitude],
    formattedAddress: loc[0].formattedAddress
  };
  this.address = undefined;
  next();
});

module.exports = mongoose.model("Store", StoreSchema);
