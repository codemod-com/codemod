function withFunction() {
  function require(name) {
    return name;
  }
  const Grid = require("library");
  return Grid;
}

function withParameter(require) {
  const Grid = require("library");
  return Grid;
}

function withVariable() {
  const require = (name) => name;
  const Grid = require("library");
  return Grid;
}
