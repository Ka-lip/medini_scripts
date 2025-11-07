// $EXPERIMENTAL$
load("./.lib/ui.js");

function getMatches(filterFunc) {
  if (!filterFunc) {
    return finder.findByType(Metamodel.compare.Match).toArray();
  } else {
    return finder
      .findByType(Metamodel.compare.Match)
      .toArray()
      .filter(filterFunc);
  }
}

function getIds(matches) {
  var ids = matches
    .map((i) => (i.left || i.right).mediniIdentifier)
    .filter((i) => i != undefined);
  return ids;
}

function getHeatTemps(n) {
  var temps;
  var interval;
  if (n <= 1) {
    temps = [100];
  } else {
    interval = Math.round(100 / (n - 1));
    temps = Array(n);
    for (var i = 0; i < n; i++) {
      temps[i] = i * interval;
    }
  }
  return temps;
}

function getHeatMapScript(ids) {
  var scriptLines = [
    "var target = " + JSON.stringify(ids) + ";",
    "var temp = [" + getHeatTemps(ids.length) + "];",
    "",
    "for (var i = 0; i < target.length; i++){",
    "  if (self.mediniIdentifier == target[i]) {temp[i];}",
    "}",
  ];
  return scriptLines.join("\n");
}

function main() {
  var script = getHeatMapScript(
    getIds(getMatches((i) => i.differences.size() > 0))
  );
  copyToClipboard(script);
  alert("The script for heatmap is copied to the clipboard. Open the heatmap and paste the script.")
}

main();
