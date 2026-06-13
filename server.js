const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const { isDemoMode } = require("./config/demo");

dotenv.config({ path: "./config/config.env" });

connectDB();

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/status", (req, res) =>
  res.json({ demoMode: isDemoMode(), message: "Place Locater API" })
);

app.use("/api/v1/stores", require("./routes/stores"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  if (isDemoMode()) {
    console.log("DEMO_MODE: serving mock store locations");
  }
});
