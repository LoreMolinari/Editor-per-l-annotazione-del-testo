const express = require("express");
const app = express();

require('colors');
const Diff = require('diff');

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

app.get("/firepad", (req, res) => {
  res.render("firepad");
});

app.get("/diff", (req, res) => {
  res.render("diff");
});

app.get("/load", (req, res) => {
  let annotations = fs.readFileSync("./example.json", "utf-8");

  res.json(JSON.parse(annotations));
});


/*app.post('/diff', function(request, response){
  var recogito = request.body.documents.documentRecogito;
  var firepad = request.body.documents.documentFirepad;

  //console.log(recogito);
  //console.log(firepad);

  const diff = Diff.diffChars(recogito, firepad);

  diff.forEach((part) => {
    // green for additions, red for deletions
    // grey for common parts
    const color = part.added ? 'green' :
      part.removed ? 'red' : 'grey';
      //process.stderr.write(part.value[color]);
  });

  response.json(diff);
});*/

app.listen(process.env.PORT);
