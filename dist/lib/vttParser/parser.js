"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _styleParser = require("./styleParser");

/**
 * See spec: https://www.w3.org/TR/webvtt1/#file-structure
 */
function ParserError(message, error) {
  this.message = message;
  this.error = error;
}

ParserError.prototype = Object.create(Error.prototype);
const TIMESTAMP_REGEXP = /([0-9]{1,2})?:?([0-9]{2}):([0-9]{2}\.[0-9]{2,3})/;

function parse(input, options, containerHeight) {
  if (!options) {
    options = {};
  }

  const _options = options,
        _options$meta = _options.meta,
        meta = _options$meta === void 0 ? false : _options$meta,
        _options$strict = _options.strict,
        strict = _options$strict === void 0 ? true : _options$strict;

  if (typeof input !== "string") {
    throw new ParserError("Input must be a string");
  }

  input = input.trim();
  input = input.replace(/\r\n/g, "\n");
  input = input.replace(/\r/g, "\n");
  const parts = input.split("\n\n");
  const header = parts.shift();

  if (!header.startsWith("WEBVTT")) {
    throw new ParserError('Must start with "WEBVTT"');
  }

  const headerParts = header.split("\n");
  const headerComments = headerParts[0].replace("WEBVTT", "");

  if (headerComments.length > 0 && headerComments[0] !== " " && headerComments[0] !== "\t") {
    throw new ParserError("Header comment must start with space or tab");
  } // nothing of interests, return early


  if (parts.length === 0 && headerParts.length === 1) {
    return {
      valid: true,
      strict,
      cues: [],
      errors: []
    };
  }

  if (!meta && headerParts.length > 1 && headerParts[1] !== "") {
    throw new ParserError("Missing blank line after signature");
  }

  const _parseCues = parseCues(parts, strict, containerHeight),
        cues = _parseCues.cues,
        errors = _parseCues.errors;

  if (strict && errors.length > 0) {
    throw errors[0];
  }

  const headerMeta = meta ? parseMeta(headerParts) : null;
  const result = {
    valid: errors.length === 0,
    strict,
    cues,
    errors
  };

  if (meta) {
    result.meta = headerMeta;
  }

  return result;
}

function parseMeta(headerParts) {
  const meta = {};
  headerParts.slice(1).forEach(header => {
    const splitIdx = header.indexOf(":");
    const key = header.slice(0, splitIdx).trim();
    const value = header.slice(splitIdx + 1).trim();
    meta[key] = value;
  });
  return Object.keys(meta).length > 0 ? meta : null;
}

function parseCues(cues, strict, containerHeight) {
  const errors = [];
  const parsedCues = cues.map((cue, i) => {
    try {
      return parseCue(cue, i, strict, containerHeight);
    } catch (e) {
      errors.push(e);
      return null;
    }
  }).filter(Boolean);
  return {
    cues: parsedCues,
    errors
  };
}
/**
 * Parse a single cue block.
 *
 * @param {array} cue Array of content for the cue
 * @param {number} i Index of cue in array
 *
 * @returns {object} cue Cue object with start, end, text and styles.
 *                       Null if it's a note
 * @link https://developer.mozilla.org/en-US/docs/Web/API/WebVTT_API#Cue_payload_text_tags
 */


function parseCue(cue, i, strict, containerHeight) {
  let identifier = "";
  let start = 0;
  let end = 0.01;
  let text = "";
  let styles = ""; // split and remove empty lines
  // @TODO check for vtt xml tages ex: <c.className>text</c>

  const lines = cue.split("\n").filter(Boolean);

  if (lines.length > 0 && lines[0].trim().startsWith("NOTE")) {
    return null;
  }

  if (lines.length === 1 && !lines[0].includes("-->")) {
    throw new ParserError(`Cue identifier cannot be standalone (cue #${i})`);
  }

  if (lines.length > 1 && !(lines[0].includes("-->") || lines[1].includes("-->"))) {
    const msg = `Cue identifier needs to be followed by timestamp (cue #${i})`;
    throw new ParserError(msg);
  }

  if (lines.length > 1 && lines[1].includes("-->")) {
    identifier = lines.shift();
  }

  const times = typeof lines[0] === "string" && lines[0].split(" --> ");

  if (times.length !== 2 || !validTimestamp(times[0]) || !validTimestamp(times[1])) {
    throw new ParserError(`Invalid cue timestamp (cue #${i})`);
  }

  start = parseTimestamp(times[0]);
  end = parseTimestamp(times[1]);

  if (strict) {
    if (start > end) {
      throw new ParserError(`Start timestamp greater than end (cue #${i})`);
    }

    if (end <= start) {
      throw new ParserError(`End must be greater than start (cue #${i})`);
    }
  }

  if (!strict && end < start) {
    throw new ParserError(`End must be greater or equal to start when not strict (cue #${i})`);
  } // TODO better style validation


  styles = times[1].replace(TIMESTAMP_REGEXP, "").trim();
  const cssStyles = (0, _styleParser.vttStylesToCSS)(styles, containerHeight);
  lines.shift();
  text = lines.join("\n");

  if (!text) {
    return false;
  }

  return {
    identifier,
    start,
    end,
    text,
    styles,
    cssStyles,
    index: i
  };
}

function validTimestamp(timestamp) {
  return TIMESTAMP_REGEXP.test(timestamp);
}

function parseTimestamp(timestamp) {
  const matches = timestamp.match(TIMESTAMP_REGEXP);
  let secs = parseFloat(matches[1] || 0) * 60 * 60; // hours

  secs += parseFloat(matches[2]) * 60; // mins

  secs += parseFloat(matches[3]); // secs += parseFloat(matches[4]);

  return secs;
}

var _default = {
  ParserError,
  parse
};
exports.default = _default;