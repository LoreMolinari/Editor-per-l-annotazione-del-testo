const express = require("express");
const app = express();

require("colors");
const moment = require("moment");

const fs = require("fs");
const path = require("path");

let { fileName } = require("./info.json");
require("ejs");

let data = require(`./version/${fileName}.json`);
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
});

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
  res.json({ diff: data.diff });
});

app.get("/diff&annotations", (req, res) => {
  res.json({ diff: data.diff, annotation: data.annotation, text: data.text });
});

app.get("/annotations", (req, res) => {
  res.json(data.annotation);
});

app.post("/text", (req, res) => {
  const { text, version } = req.body;

  data.text = text;

  saveChanges(version);
  res.status(200).send();
});

app.post("/annotations", (req, res) => {
  const { annotations } = req.body;

  data.annotation = annotations;
  saveChanges();
});

app.post("/diff", (req, res) => {
  const { diff, prevtext } = req.body;

  data.diff = diff;
  data.prevtext = prevtext;

  saveChanges();
});

const saveChanges = (nameFile = fileName) => {
  if (fileName !== nameFile) {
    var prevtext = data.prevtext;
    var text = data.text;

    if (text !== prevtext) {
      var time = moment().format("YYYY-MM-DD[T]HH-mm-ss-");

      nameFile = time + nameFile;
      fileName = nameFile;

      fs.writeFileSync("info.json", JSON.stringify({ fileName: nameFile }));
    }
  }
  fs.writeFileSync(
    path.join(__dirname, "version", fileName + ".json"),
    JSON.stringify(data, null, 2)
  );
};

app.listen(process.env.PORT);
