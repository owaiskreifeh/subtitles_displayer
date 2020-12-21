import urlJoin from "url-join";

// Keep any extern-lib out
// do not use Axios
// this package should be clean and self isolated as possible
export function request(method, url) {
  // eslint-disable-next-line func-names
  return new Promise(function(resolve, reject) {
    // 1. Create a new XMLHttpRequest object
    const xhr = new XMLHttpRequest();

    // 2. Configure it: GET-request for the URL /article/.../load
    xhr.open(method, url);

    // 3. Send the request over the network
    xhr.send();

    // 4. This will be called after the response is received
    xhr.onload = function() {
      if (xhr.status !== 200) {
        // analyze HTTP status of the response
        reject({
          status: xhr.status,
          response: xhr.response
        });
      } else {
        // show the result
        resolve(xhr.response);
      }
    };

    xhr.onerror = function() {
      reject("Network error");
    };
  });
}

export function resolveUrl(...args) {
  return urlJoin(...args).replace(/([^:]\/)\/+/g, "$1")
}
