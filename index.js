require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const mongoose = require("mongoose");
const dns = require("dns");

// Basic Configuration
const port = process.env.PORT || 3000;

//anonymous function for async connect
(async () => {
  mongoose.connect(process.env.MONGO_URI)
})

//schemas
const urlSchema = new mongoose.Schema({
  original_url: String,
  short_url: String,
});

//models
const UrlModel = new mongoose.model("short_url", urlSchema);

//middleware for CORS, JSON body parsing
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//page serving middleware
app.use("/public", express.static(`${process.cwd()}/public`));

//routes
//page serving root route
app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

//server port listening function
app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
