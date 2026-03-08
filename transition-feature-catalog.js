(function (root) {
  "use strict";

  if (typeof module !== "undefined" && module.exports) {
    const { catalog } = require("@ctp/card-transition-contract");
    module.exports = catalog;
    root.TRANSITION_FEATURE_CATALOG = catalog;
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
