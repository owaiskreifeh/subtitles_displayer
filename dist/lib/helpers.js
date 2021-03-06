"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isArrayEqual = isArrayEqual;
exports.el = exports.$ = void 0;
const $ = document.querySelector.bind(document);
exports.$ = $;
const el = document.createElement.bind(document);
exports.el = el;

function isArrayEqual(arr1, arr2, objProp = null) {
  // if the other array is a falsy value, return
  if (!arr2) return false; // compare lengths - can save a lot of time

  if (arr1.length !== arr2.length) return false;

  for (let i = 0, l = arr1.length; i < l; i++) {
    // Check if we have nested arrays
    if (arr1[i] instanceof Array && arr2[i] instanceof Array) {
      // recurse into the nested arrays
      if (!arr1[i].equals(arr2[i])) return false;
    } else if (arr1[i] !== arr2[i]) {
      // @todo deep compare objects values
      // Warning - two different object instances will never be equal: {x:20} != {x:20}
      if (objProp && typeof arr1[i] === "object" && typeof arr2[i] === "object") {
        // debugger;
        return arr1[i][objProp] === arr2[i][objProp];
      }

      return false;
    }
  }

  return true;
}