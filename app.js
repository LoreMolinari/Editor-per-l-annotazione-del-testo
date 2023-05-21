const express = require("express");
const app = express();
const { PDFDocument } = require("pdfjs-dist/legacy/build/pdf");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

require("colors");
const moment = require("moment");
const mime = require("mime-types");
const createError = require("http-errors");

const fs = require("fs");
const path = require("path");

const INFO_FILE_PATH = path.join(__dirname, "info.json");
const TAG_FILE_PATH = path.join(__dirname, "Tag.json");

let { fileName } = require(INFO_FILE_PATH);
require("ejs");

let data = require(`./version/${fileName}.json`);
require("dotenv").config();

let tag = require(TAG_FILE_PATH);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

var lock = {
  recogito: 0,
  firepad: 0,
};

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.redirect("/recogito");
});

const lockMiddleware = (req, res, next) => {
  const { platform } = req.params;
  
  if ((platform === "recogito" && lock.firepad !== 0) || (platform === "firepad" && lock.recogito !== 0)) {
    return res
      .status(400)
      .json({ lock: true, message: `Qualcuno sta utilizzando ${platform === "recogito" ? "il recogito" : "il firepad"}` });
  }
  
  next();
};

app.get("/recogito", lockMiddleware, (req, res) => {
  lock.recogito++;
  res.render("index");
});

app.get("/firepad", lockMiddleware, (req, res) => {
  lock.firepad++;
  res.render("firepad", {
    apiKey: process.env.APIKEY,
  });
});

app.get("/data", (req, res) => {
  res.status(200).json(lock);
});

app.get("/exit/:platform", (req, res) => {
  const platforms = ["recogito", "firepad"];
  const { platform } = req.params;

  platforms.splice(platforms.indexOf(platform), 1);

  lock[platform]--;
  res.redirect("/" + platforms);
});

app.get("/text", (req, res) => {
  res.send(data.text);
});

app.get("/diff", (req, res) => {
  res.json({ diff: data.diff });
});

app.get("/tag", (req, res) => {
  res.send(tag);
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

app.post("/diff", ({ body: { diff, prevtext } }, res) => {
  data.diff = diff;
  data.prevtext = prevtext;

  saveChanges();
});

const saveChanges = (nameFile = fileName) => {
  if (fileName !== nameFile) {
    const { prevtext, text } = data;

    if (text !== prevtext) {
      const time = moment().format("YYYY-MM-DD[T]HH-mm-ss-");

      nameFile = time + nameFile;
      fileName = nameFile;

      fs.writeFileSync(INFO_FILE_PATH, JSON.stringify({ fileName: nameFile }));
    }
  }
  
  fs.writeFileSync(
    path.join(__dirname, "version", fileName + ".json"),
    JSON.stringify(data, null, 2)
  );
};

app.get("/download", (req, res) => {
  const file = path.join(__dirname, "version", fileName + ".json");
  res.download(file, req.body.filename, function (err) {
    if (err) {
      console.log("Errore nell'invio del file: " + file);
    }
  });
});

app.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).send("Nessun file caricato.");
  }

  if (!req.file.mimetype.startsWith("text/")) {
    return res
      .status(400)
      .send("Formato file non valido. Carica solo file di testo.");
  }

  try {
    const fileContent = await fs.promises.readFile(req.file.path, "utf-8");

    await fs.promises.unlink(req.file.path);

    res.send(
      `File caricato correttamente. Contenuto del file: \n\n${fileContent}`
    );
  } catch (error) {
    console.error("Errore durante la lettura del file:", error);
    return res
      .status(500)
      .send(
        `Si è verificato un errore durante la lettura del file: ${error.message}`
      );
  }
});

app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500);
  res.render("error");
});

app.listen(process.env.PORT);
console.log("Server in ascolto sulla porta: " + process.env.PORT);
