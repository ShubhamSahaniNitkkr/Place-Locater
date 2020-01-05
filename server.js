const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

// load env variable
dotenv.config({ path: "./config/config.env" });

//connet with mongoDB
connectDB();
const app = express();

//middleware body parser (to send json data to API)
app.use(express.json());
app.use(cors());

// set static folder
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/api/v1/stores", require("./routes/stores"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server Running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);
