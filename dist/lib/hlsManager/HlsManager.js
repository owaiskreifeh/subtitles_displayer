"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _m3u8Parser = require("m3u8-parser");

var _log = _interopRequireDefault(require("../log"));

var _networking = require("../networking");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class HlsManager {
  constructor() {
    var _this = this;

    _defineProperty(this, "_manifestBaseUrl", "");

    _defineProperty(this, "_tracks", []);

    _defineProperty(this, "loadManifest", /*#__PURE__*/function () {
      var _ref = _asyncToGenerator(function* (url) {
        _log.default.info("Loading M3U8 Manifest", url);

        _this._manifestBaseUrl = _this._getBaseUrl(url);
        const manifestText = yield (0, _networking.request)("GET", url);

        const manifestObj = _this._parse(manifestText);

        const tracks = manifestObj.mediaGroups.SUBTITLES.subtitles;

        _this._populateTracks(tracks);

        return _this._tracks;
      });

      return function (_x) {
        return _ref.apply(this, arguments);
      };
    }());

    _defineProperty(this, "loadTrack", /*#__PURE__*/function () {
      var _ref2 = _asyncToGenerator(function* (language) {
        const trackManifestIndex = _this._tracks.findIndex(m => m.language == language);

        if (_this._tracks[trackManifestIndex].loaded) {
          _log.default.info("Loading Text Track for ", language, " Already loaded, skipping");

          return;
        }

        _log.default.info("Loading Text Track for ", language);

        const trackManefestText = yield (0, _networking.request)("GET", _this._manifestBaseUrl + "/" + _this._tracks[trackManifestIndex].uri);

        const trackManifestObject = _this._parse(trackManefestText);

        _this._tracks[trackManifestIndex].segments = trackManifestObject.segments;
        _this._tracks[trackManifestIndex].loaded = true;
        _this._tracks[trackManifestIndex].targetDuration = trackManifestObject.targetDuration;
        return _this._tracks[trackManifestIndex];
      });

      return function (_x2) {
        return _ref2.apply(this, arguments);
      };
    }());

    _defineProperty(this, "getSegment", (language, index) => {
      const trackManifestIndex = this._tracks.findIndex(m => m.language == language);

      if (index < this._tracks[trackManifestIndex].segments.length) {
        const url = this._manifestBaseUrl + '/' + this._getBaseUrl(this._tracks[trackManifestIndex].uri) + '/' + this._tracks[trackManifestIndex].segments[index].uri;

        return _objectSpread({
          url,
          index
        }, this._tracks[trackManifestIndex].segments[index]);
      }

      return {
        url: "",
        index
      };
    });

    _defineProperty(this, "getSegmentForDuration", (language, durationInSeconds) => {
      const trackManifest = this._tracks.find(m => m.language == language);

      const segemntIndex = parseInt(durationInSeconds / trackManifest.targetDuration);
      return _objectSpread({
        url: this.getSegment(language, segemntIndex).url,
        index: segemntIndex
      }, trackManifest.segments[segemntIndex]);
    });

    _defineProperty(this, "getTracks", () => {
      return this._tracks;
    });

    _defineProperty(this, "getTrack", language => {
      return this._tracks.find(m => m.language == language);
    });

    _defineProperty(this, "_populateTracks", tracks => {
      let __tracks = [];
      Object.keys(tracks).forEach(trackLabel => {
        __tracks.push(_objectSpread(_objectSpread({}, tracks[trackLabel]), {}, {
          label: trackLabel,
          cues: [],
          segments: [],
          segmented: true,
          loaded: false
        }));
      });
      this._tracks = __tracks;
    });

    _defineProperty(this, "_parse", m3u8Text => {
      const parser = new _m3u8Parser.Parser();
      parser.push(m3u8Text);
      parser.end();
      return parser.manifest;
    });

    _defineProperty(this, "_getBaseUrl", url => {
      const urlSegments = url.split("/");

      if (urlSegments[0] !== "https") {
        _log.default.warn(`Unsafe use of ${urlSegments[0]}`);
      }

      urlSegments.pop();
      return urlSegments.join("/");
    });
  }

}

exports.default = HlsManager;