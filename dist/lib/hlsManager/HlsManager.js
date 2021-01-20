"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _m3u8Parser = require("m3u8-parser");

var _log = _interopRequireDefault(require("../log"));

var _networking = require("../networking");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

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
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(url) {
        var manifestText, manifestObj, tracks;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              _log["default"].info("Loading M3U8 Manifest", url);

              _this._manifestBaseUrl = _this._getBaseUrl(url);
              _context.next = 4;
              return (0, _networking.request)("GET", url);

            case 4:
              manifestText = _context.sent;
              manifestObj = _this._parse(manifestText);

              _log["default"].v_info("Manifest loaded, raw object: ", manifestObj);

              tracks = manifestObj.mediaGroups.SUBTITLES[Object.keys(manifestObj.mediaGroups.SUBTITLES)[0]];

              if (tracks) {
                _this._populateTracks(tracks);
              } else {
                _log["default"].warn("No subtitles tracks found in the manifest");
              }

              return _context.abrupt("return", _this._tracks);

            case 10:
            case "end":
              return _context.stop();
          }
        }, _callee);
      }));

      return function (_x) {
        return _ref.apply(this, arguments);
      };
    }());

    _defineProperty(this, "loadTrack", /*#__PURE__*/function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(language) {
        var trackManifestIndex, trackManefestText, trackManifestObject;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              trackManifestIndex = _this._tracks.findIndex(m => m.language === language);

              if (trackManifestIndex >= 0) {
                _context2.next = 4;
                break;
              }

              _log["default"].error(`Manifest has no tracks for language ${language}`);

              return _context2.abrupt("return", null);

            case 4:
              if (!_this._tracks[trackManifestIndex].loaded) {
                _context2.next = 8;
                break;
              }

              _log["default"].info("Loading Text Track for ", language, " Already loaded, skipping");

              _context2.next = 17;
              break;

            case 8:
              _log["default"].info("Loading Text Track for ", language);

              _context2.next = 11;
              return (0, _networking.request)("GET", (0, _networking.resolveUrl)(_this._manifestBaseUrl, _this._tracks[trackManifestIndex].uri));

            case 11:
              trackManefestText = _context2.sent;
              trackManifestObject = _this._parse(trackManefestText);
              _this._tracks[trackManifestIndex].segments = trackManifestObject.segments;

              if (!trackManifestObject.segments || trackManifestObject.segments.length < 1) {
                _log["default"].warn(`No segments found in track ${language}`);
              }

              _this._tracks[trackManifestIndex].loaded = true;
              _this._tracks[trackManifestIndex].targetDuration = trackManifestObject.targetDuration;

            case 17:
              return _context2.abrupt("return", _this._tracks[trackManifestIndex]);

            case 18:
            case "end":
              return _context2.stop();
          }
        }, _callee2);
      }));

      return function (_x2) {
        return _ref2.apply(this, arguments);
      };
    }());

    _defineProperty(this, "getSegment", (language, index) => {
      if (this._tracks && this._tracks.length > 0) {
        const trackManifestIndex = this._tracks.findIndex(m => m.language === language);

        if (trackManifestIndex >= 0 && index < this._tracks[trackManifestIndex].segments.length) {
          const url = (0, _networking.resolveUrl)(this._manifestBaseUrl, this._getBaseUrl(this._tracks[trackManifestIndex].uri), this._tracks[trackManifestIndex].segments[index].uri);
          return _objectSpread({
            url,
            index
          }, this._tracks[trackManifestIndex].segments[index]);
        } else {
          _log["default"].warn(`No segment with index ${index} found for language ${language}`);
        }
      } else {
        _log["default"].error(`No tracks loaded yet or the manifest has no tracks`);
      }

      return {
        url: "",
        index
      };
    });

    _defineProperty(this, "getSegmentForDuration", (language, durationInSeconds) => {
      const trackManifest = this._tracks.find(m => m.language === language);

      const segemntIndex = parseInt(durationInSeconds / trackManifest.targetDuration, 10);
      return _objectSpread({
        url: this.getSegment(language, segemntIndex).url,
        index: segemntIndex
      }, trackManifest.segments[segemntIndex]);
    });

    _defineProperty(this, "getTracks", () => {
      return this._tracks;
    });

    _defineProperty(this, "getTrack", language => {
      return this._tracks.find(m => m.language === language);
    });

    _defineProperty(this, "_populateTracks", tracks => {
      const __tracks = [];
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

      if (urlSegments[0] === "http:") {
        _log["default"].warn(`Unsafe use of ${urlSegments[0]}`);
      }

      urlSegments.pop(); // remove /manifest.m3u8

      return urlSegments.join("/");
    });
  }

}

exports["default"] = HlsManager;