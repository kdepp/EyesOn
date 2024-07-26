function insertIntoTarget(element, options) {
  var parent = options.target || document.head || document.body || document;
  parent.appendChild(element);
}

module.exports = insertIntoTarget;
