const mongoose = require("mongoose");
const { enableDemoMode } = require("./demo");

const connectDB = async () => {
  if (process.env.DEMO_MODE === "true") {
    enableDemoMode();
    console.log("DEMO_MODE enabled — using mock store data");
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true
    });
    console.log(`MongoDB Connected ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB unavailable, falling back to DEMO_MODE");
    enableDemoMode();
  }
};

module.exports = connectDB;
