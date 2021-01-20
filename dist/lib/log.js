"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const TAG = "SubtitlesDisplayer: ";
const V_TAG = "verbose: SubtitlesDisplayer: ";

class Logger {}

exports["default"] = Logger;

_defineProperty(Logger, "debug", false);

_defineProperty(Logger, "verbose", false);

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

_defineProperty(Logger, "v_info", (...args) => {
  if (Logger.verbose) {
    console.log(V_TAG, ...args);
  }
});

_defineProperty(Logger, "v_warn", (...args) => {
  if (Logger.verbose) {
    console.warn(V_TAG, ...args);
  }
});

_defineProperty(Logger, "v_error", (...args) => {
  if (Logger.verbose) {
    console.error(V_TAG, ...args);
  }
});