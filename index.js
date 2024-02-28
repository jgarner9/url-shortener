require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const mongoose = require("mongoose");
const dns = require("dns");

// Basic Configuration
const port = process.env.PORT || 3000;

//anonymous function for async connect
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("connection successful!");
  })
  .catch((err) => console.log("Error encountered: " + err));

//schemas
const urlSchema = new mongoose.Schema({
  original_url: String,
  short_url: String,
});

//models
const urlModel = new mongoose.model("short_url", urlSchema);

//logic functions
const checkForShorturl = async (query) => {
  const doc = await urlModel.findOne(query);
  console.log(doc);
  return doc ? true : false;
};

const validateUrl = (url) => {
  const regex = /^https?:\/\//;
  if (regex.test(url) === false) return false;
  return true
};

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

//post route to add url to db
app.post("/api/shorturl", async (req, res) => {
  //variables
  const url = { original_url: req.body.url };
  const shorturlDocument = new urlModel(url);
  //logic to validate the url
  if (!validateUrl(url.original_url)) {
    res.json({ error: "invalid url" })
  }
  //logic to see if document exists already
  else if (await checkForShorturl(url)) {
    //return existing document
    const document = await urlModel.findOne(url, "original_url short_url");
    res.json({ ...url, short_url: document.short_url });
  } else {
    //create new document
    shorturlDocument.short_url = (await urlModel.countDocuments({})) + 1;
    await shorturlDocument.save();
    res.json({ ...url, short_url: shorturlDocument.short_url });
  }
});

//get route to redirect
app.get("/api/shorturl/:shorturl", async (req, res) => {
  const document = await urlModel.findOne({ short_url: req.params.shorturl });
  res.redirect(document.original_url);
});
//server port listening function
app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
