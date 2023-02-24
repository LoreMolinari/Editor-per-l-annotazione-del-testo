const express = require("express");
const app = express();

const fs = require("fs");
require("dotenv").config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// uso EJS
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/load", (req, res) => {
  let annotations = fs.readFileSync("./example.json", "utf-8");

  res.json(JSON.parse(annotations));
});

app.listen(process.env.PORT);
