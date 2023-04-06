const express = require("express");
const app = express();

require('colors');
const Diff = require('diff');

const fs = require("fs");
const path = require("path");

const data = require("./example.json");
require("dotenv").config();

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
  res.redirect("/recogito"); 
})

// da fare semaforo per accedere o a firepad o recogito
app.get("/recogito", (req, res) => {
  if (lock.firepad !== 0)
    return res
      .status(400)
      .json({ lock: true, message: "Qualcuno sta modificando il testo" });
  lock.recogito++;
  res.render("index");
});

app.get("/firepad", (req, res) => {
  if (lock.recogito !== 0)
    return res
      .status(400)
      .json({ lock: true, message: "Qualcuno sta annotando" });
  lock.firepad++;
  res.render("firepad");
});

app.get("/data", (req, res) => {
  res.status(200).json(lock);
});

app.get("/exit/:platform", (req, res) => {
  let platforms = ["recogito", "firepad"];
  const { platform } = req.params;

  console.log(lock);
  platforms.splice(platforms.indexOf(platform), 1);

  lock[platform]--;
  console.log(lock);

  res.redirect("/" + platforms);
});

app.get("/text", (req, res) => {
  res.send(data.text);
});

app.get("/diff", (req, res) => {
  res.json({'diff': data.diff});
});

app.get("/annotations", (req, res) => {
  res.json(data.annotation);
});

app.post("/text", (req, res) => {
  const { text } = req.body;
  
  data.text = text;
  saveChanges();
  res.status(200).send();
});

app.post("/annotations", (req, res) => {
  const { annotation } = req.body;

  data.annotation = annotation;
  saveChanges();
});

app.post("/diff", (req, res) => {
  const { diff } = req.body;

  data.diff = diff;

  saveChanges();
});

const saveChanges = () => {
  fs.writeFileSync(
    path.join(__dirname, "example.json"),
    JSON.stringify(data, null, 2)
  );
};

app.listen(process.env.PORT);
