/* eslint-disable camelcase */
const TAG = "SubtitlesDisplayer: ";
const V_TAG = "verbose: SubtitlesDisplayer: ";
export default class Logger {
  static debug = false;

  static verbose = false;

  static info = (...args) => {
    if (Logger.debug) {
      console.log(TAG, ...args);
    }
  };

  static warn = (...args) => {
    if (Logger.debug) {
      console.warn(TAG, ...args);
    }
  };

  static error = (...args) => {
    if (Logger.debug) {
      console.error(TAG, ...args);
    }
  };

  // verbose logs
  static v_info = (...args) => {
    if (Logger.verbose) {
      console.log(V_TAG, ...args);
    }
  };

  static v_warn = (...args) => {
    if (Logger.verbose) {
      console.warn(V_TAG, ...args);
    }
  };

  static v_error = (...args) => {
    if (Logger.verbose) {
      console.error(V_TAG, ...args);
    }
  };
}
