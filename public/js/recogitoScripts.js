var dmp = new diff_match_patch();

// Funzione per ottenere la lista delle annotazioni
function listAnnotations() {
  let annotations = r.getAnnotations();
  console.log("listAnnotations", annotations);
  // Invia questo array JSON al server per salvare le annotazioni
}

// Rimuove un'annotazione
function deleteAnnotation(ann) {
  r.removeAnnotation(ann);
  console.log("annotazione rimossa con successo: ", ann);
  listAnnotations(); // Aggiorna la lista delle annotazioni dopo la rimozione
}

// Funzione per andare a Firepad
function goToFirepad() {
  localStorage.removeItem("diff");
  location.href = "/exit/recogito";
}

// Carica le differenze
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

  // Evidenzia la sintassi JSON nel codice HTML
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

  // Stampa il risultato nel documento HTML
  function output(inp) {
    document.body.appendChild(document.createElement("pre")).innerHTML = inp;
  }
}

// Corregge le annotazioni in base alle differenze tra il testo e il suo contenuto annotato
function fixAnnotations(diff, annotations, text) {
  annotations.forEach((item, index) => {
    var differenza =
      item.target.selector[1].end - item.target.selector[1].start;

    if (
      item.target.selector[0].exact !==
      text.substr(item.target.selector[1].start, differenza)
    ) {
      deleteAnnotation(item); // Rimuove l'annotazione se il testo è stato modificato
    }
  });
}

// Salva le annotazioni sul server
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

// Esegue il download
function download() {
  window.location.href = "/download";
}
