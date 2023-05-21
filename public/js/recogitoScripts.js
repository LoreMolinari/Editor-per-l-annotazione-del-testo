var dmp = new diff_match_patch();

function listAnnotations() {
  let annotations = r.getAnnotations();
  console.log("listAnnotations", annotations);
  // inviando questo JSON array al server si potrebberò salvare le annotazioni
}

//Cancello le Annotazioni che hanno parti del testo modificate dall'Editor di testo Firepad
function deleteAnnotation(ann) {
  r.removeAnnotation(ann);
  console.log("annotazione rimossa con successo: ", ann);
  listAnnotations();
}

function goToFirepad() {
  localStorage.removeItem("diff");
  location.href = "/exit/recogito";
}

function loadDiff() {
  var str;
  var dmp = new diff_match_patch();

  try {
    output(
      syntaxHighlight(
        JSON.stringify(JSON.parse(localStorage.getItem("diff")), null, 2) +
          "\n" +
          JSON.stringify(
            dmp.patch_make(JSON.parse(localStorage.getItem("diff"))),
            null,
            2
          )
      )
    );
    output(dmp.diff_prettyHtml(JSON.parse(localStorage.getItem("diff"))));
  } catch {
    alert("Nessuna differenza trovata nei file\n");
  }

  function syntaxHighlight(json) {
    json = json
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    return json.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      function (match) {
        var cls = "number";
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            return match;
          } else {
            cls = "string";
          }
        } else if (/true|false/.test(match)) {
          cls = "boolean";
        } else if (/null/.test(match)) {
          cls = "null";
        }
        return '<span class="' + cls + '">' + match + "</span>";
      }
    );
  }

  function output(inp) {
    document.body.appendChild(document.createElement("pre")).innerHTML = inp;
  }
}

function fixAnnotations(diff, annotations, text) {
  annotations.forEach((item, index) => {
    var differenza =
      item.target.selector[1].end - item.target.selector[1].start;

    if (
      item.target.selector[0].exact !==
      text.substr(item.target.selector[1].start, differenza)
    ) {
      console.log("si");

      deleteAnnotation(item);
    }
  });
}

function saveAnnotations() {
  fetch("/annotations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      annotations: r.getAnnotations(),
    }),
  });
}

function download() {
  window.location.href = "/download";
}
