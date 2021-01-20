"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.request = request;
exports.resolveUrl = resolveUrl;

var _urlJoin = _interopRequireDefault(require("url-join"));

var _log = _interopRequireDefault(require("./log"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

// Keep any extern-lib out
// do not use Axios
// this package should be clean and self isolated as possible
function request(method, url) {
  _log["default"].v_info("NETWORK: fetching ", url); // eslint-disable-next-line func-names


  return new Promise(function (resolve, reject) {
    if (XMLHttpRequest === undefined) {
      reject(new Error("XMLHttpRequest is not defined"));
    } // 1. Create a new XMLHttpRequest object


    const xhr = new XMLHttpRequest(); // 2. Configure it: GET-request for the URL /article/.../load

    xhr.open(method, url); // 3. Send the request over the network

    xhr.send(); // 4. This will be called after the response is received

    xhr.onload = () => {
      if (xhr.status !== 200) {
        _log["default"].v_info("NETWORK: fetching ", url, " [FAILED] ", xhr.status); // analyze HTTP status of the response


        reject({
          status: xhr.status,
          response: xhr.response
        });
      } else {
        _log["default"].v_info("NETWORK: fetching ", url, " [SUCCESS] "); // show the result


        resolve(xhr.response);
      }
    };

    xhr.onerror = () => {
      reject(new Error("Network error"));
    };
  });
}

function resolveUrl(...args) {
  return (0, _urlJoin["default"])(...args).replace(/([^:]\/)\/+/g, "$1");
}