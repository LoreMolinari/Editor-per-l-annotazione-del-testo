const express = require("express");
const app = express();

require("colors");
const moment = require("moment");
var createError = require('http-errors');

const fs = require("fs");
const path = require("path");

let { fileName } = require("./info.json");
require("ejs");

let data = require(`./version/${fileName}.json`);
require("dotenv").config();

let tag = require("./Tag.json");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

var lock = {
  recogito: 0,
  firepad: 0,
};
// uso EJS
app.set("view engine", "ejs");

// route / redirect to /recogito
app.get("/", (req, res) => {
  res.render("login");
});

app.get("/recogito", (req, res) => {
  res.render("index");
});

app.get("/data", (req, res) => {
  res.status(200).json(lock);
});

app.post("/text", (req, res) => {
  const nTweet = req.body.tweet;
  
  const tweet = data.tweets[nTweet].content;
  
  if (tweet) {
    res.send(tweet);
  } else {
    res.sendStatus(404);
  }
});



app.get("/tag", (req, res) => {
  res.send(tag);
});

app.post("/annotations", (req, res) => {
  const { annotations, user, tweet, nTweet } = req.body;

  data.user = user;
  data.annotation=annotations;
  data.tweet=tweet;
  data.nTweet=nTweet;

  saveChanges(user, nTweet);
});

const saveChanges = (user, nTweet) => {
  var time = moment().format("YYYY-MM-DD[T]HH-mm-ss-");
  var fileName = time + user + "-T" + nTweet;
  var filePath = path.join(__dirname, "version", fileName + ".json");

  // Controlla se il file esiste già
  if (!fs.existsSync(filePath)) {
    // Crea il file se non esiste
    fs.writeFileSync(filePath, "");
  }

  fs.writeFileSync(
    filePath,
    JSON.stringify(data, null, 2)
  );
};

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

app.listen(process.env.PORT);
console.log("Server in ascolto sulla porta: " + process.env.PORT);
