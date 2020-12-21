"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const TAG = "SubtitlesDisplayer: ";

class Logger {}

exports["default"] = Logger;

_defineProperty(Logger, "debug", false);

_defineProperty(Logger, "info", (...args) => {
  if (Logger.debug) {
    console.log(TAG, ...args);
  }
});

_defineProperty(Logger, "warn", (...args) => {
  if (Logger.debug) {
    console.warn(TAG, ...args);
  }
});

_defineProperty(Logger, "error", (...args) => {
  if (Logger.debug) {
    console.error(TAG, ...args);
  }
});