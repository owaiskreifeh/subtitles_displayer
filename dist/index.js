"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _networking = require("./lib/networking");

var _parser = _interopRequireDefault(require("./lib/vttParser/parser"));

var _HlsManager = _interopRequireDefault(require("./lib/hlsManager/HlsManager"));

var _log = _interopRequireDefault(require("./lib/log"));

var _helpers = require("./lib/helpers");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const CUE_CONT_CLASS = "__displayer_cues_container";

class SubtitlesDisplayer {
  constructor(videoContainer, videoElement = null, debug = false) {
    var _this = this;

    _defineProperty(this, "getCurrentTrack", () => {
      return this._currenTextTrack;
    });

    _defineProperty(this, "addTrack", /*#__PURE__*/function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(url, language) {
        var vttObject;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              if (!(!url || typeof url !== "string")) {
                _context.next = 2;
                break;
              }

              throw `url should be of type strig, else found ${typeof url}`;

            case 2:
              if (!(!language || typeof language !== "string")) {
                _context.next = 4;
                break;
              }

              throw `language should be of type string, else found ${typeof language}`;

            case 4:
              vttObject = _this._parseRemoteVtt(url);

              _this._textTracks.push({
                language,
                cues: vttObject.cues
              });

              return _context.abrupt("return", _this._textTracks);

            case 7:
            case "end":
              return _context.stop();
          }
        }, _callee);
      }));

      return function (_x, _x2) {
        return _ref.apply(this, arguments);
      };
    }());

    _defineProperty(this, "addM3U8Manifest", manifestUrl => {
      this._hlsManager = new _HlsManager["default"]();
      this._isSegmented = true;
      return this._hlsManager.loadManifest(manifestUrl).then(tracks => {
        tracks.forEach(track => {
          this._textTracks.push(track);
        });
        return this._textTracks;
      });
    });

    _defineProperty(this, "selectTrackLanguage", /*#__PURE__*/function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(language) {
        var track;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              _log["default"].info("Changing Track Language ", language);

              track = _this._textTracks.find(t => t.language.toLowerCase() === language.toLowerCase());

              if (track) {
                _context2.next = 4;
                break;
              }

              throw `No track for selected language ${language}`;

            case 4:
              if (!_this._isSegmented) {
                _context2.next = 7;
                break;
              }

              _context2.next = 7;
              return _this._hlsManager.loadTrack(language).then(_track => {
                _this._textTracks.forEach((t, i) => {
                  if (_track.language === t.language) {
                    _this._textTracks[i] = _track;
                  }
                });
              });

            case 7:
              _this._currenTextTrack = track;

            case 8:
            case "end":
              return _context2.stop();
          }
        }, _callee2);
      }));

      return function (_x3) {
        return _ref2.apply(this, arguments);
      };
    }());

    _defineProperty(this, "setTextVisiblity", visbile => {
      this._isVisible = visbile;

      if (!visbile) {
        this._clearRenderedCues();
      }
    });

    _defineProperty(this, "setCueStyles", styles => {
      this._cueStyles = styles;
    });

    _defineProperty(this, "setCuesContainerStyle", styles => {
      this._applyStyles(this._cuesContainer, styles);
    });

    _defineProperty(this, "appendCues", (language, cues) => {
      this._textTracks.forEach((t, _i) => {
        if (language === t.language) {
          t.cues.push(...cues);
        }
      });
    });

    _defineProperty(this, "_loadNextSegments", (language, duration) => {
      const segmentIndex = parseInt(duration / this._currenTextTrack.targetDuration, 10 // base
      );

      if (!this._loadedBuffer[language]) {
        this._loadedBuffer[language] = [];
      }

      if (!this._loadedBuffer[language].includes(segmentIndex)) {
        this._loadedBuffer[language].push(segmentIndex);

        const segment = this._hlsManager.getSegment(language, segmentIndex);

        this._loadSegemnt(language, segment.url);
      }

      if (!this._loadedBuffer[language].includes(segmentIndex + 1)) {
        // preload next segment
        const nextSegment = this._hlsManager.getSegment(language, segmentIndex + 1);

        if (nextSegment.url) {
          this._loadedBuffer[language].push(segmentIndex + 1);

          this._loadSegemnt(language, nextSegment.url);
        }
      }
    });

    _defineProperty(this, "_loadSegemnt", /*#__PURE__*/function () {
      var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(language, url) {
        var _yield$_this$_parseRe, cues;

        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) switch (_context3.prev = _context3.next) {
            case 0:
              if (language) {
                _context3.next = 3;
                break;
              }

              _log["default"].error("Can't fetch for empty language");

              return _context3.abrupt("return");

            case 3:
              if (url) {
                _context3.next = 6;
                break;
              }

              _log["default"].error(`Empty Url fro language ${language}`);

              return _context3.abrupt("return");

            case 6:
              _context3.next = 8;
              return _this._parseRemoteVtt(url);

            case 8:
              _yield$_this$_parseRe = _context3.sent;
              cues = _yield$_this$_parseRe.cues;

              _this.appendCues(language, cues);

            case 11:
            case "end":
              return _context3.stop();
          }
        }, _callee3);
      }));

      return function (_x4, _x5) {
        return _ref3.apply(this, arguments);
      };
    }());

    _defineProperty(this, "_parseRemoteVtt", /*#__PURE__*/function () {
      var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(url) {
        var vttText;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) switch (_context4.prev = _context4.next) {
            case 0:
              _context4.next = 2;
              return (0, _networking.request)("GET", url);

            case 2:
              vttText = _context4.sent;
              return _context4.abrupt("return", _parser["default"].parse(vttText, {
                meta: true
              }, _this._videoContainer.clientHeight || _this._defaultSize.height));

            case 4:
            case "end":
              return _context4.stop();
          }
        }, _callee4);
      }));

      return function (_x6) {
        return _ref4.apply(this, arguments);
      };
    }());

    _defineProperty(this, "_registerListener", () => {
      // start listen to video timeupdate if videoElement
      this._videoElement.addEventListener("timeupdate", () => {
        this.updateSubtitles(this._videoElement.currentTime);
      });
    });

    _defineProperty(this, "_renderCues", cues => {
      this._clearRenderedCues();

      cues.forEach(c => {
        const text = c.text.trim();
        const textLines = text.split("\n");
        const cueText = (0, _helpers.el)("p"); // @todo convert to <span>, nest inside <p>

        cueText.style.width = `${this._videoContainer.clientWidth || this._defaultSize.width}px`;
        textLines.forEach((line, i) => {
          const lineSpan = (0, _helpers.el)("span");
          cueText.appendChild(lineSpan);
          lineSpan.textContent = line;

          if (i !== textLines.length - 1) {
            const breakLine = (0, _helpers.el)("br");
            cueText.appendChild(breakLine);
          }
        });
        let cueStyles = this._cueStyles;

        if (cueStyles) {
          cueStyles = Object.assign({}, c.cssStyles, cueStyles);
        }

        this._applyStyles(cueText, cueStyles);

        this._cuesContainer.appendChild(cueText);
      }); // @todo refactor to call broswer apis one time

      this._lastRenderedCues = cues;
    });

    _defineProperty(this, "_getCuesContainer", () => {
      let container = (0, _helpers.$)(`.${CUE_CONT_CLASS}`);

      if (!container) {
        container = (0, _helpers.el)("div");
        container.className = CUE_CONT_CLASS;
        container.style.position = "absolute";
        container.style.width = this._videoContainer.style.width;
        container.style.height = this._videoContainer.style.height;
        container.style.top = 0;
        container.style.left = 0;

        this._videoContainer.appendChild(container);
      }

      return container;
    });

    _defineProperty(this, "_clearRenderedCues", () => {
      while (this._cuesContainer.firstChild) {
        this._cuesContainer.removeChild(this._cuesContainer.lastChild);
      }
    });

    _defineProperty(this, "_applyStyles", (element, styles) => {
      Object.keys(styles).forEach(attr => {
        element.style[attr] = styles[attr];
      });
    });

    this._videoElement = videoElement;
    this._videoContainer = videoContainer;
    this._textTracks = [];
    this._currenTextTrack = {};
    this._isVisible = false;
    this._lastRenderedCues = [];
    this._cuesContainer = this._getCuesContainer(); // init container

    this._cuesContainerStyles = {};
    this._cueStyles = {};
    _log["default"].debug = debug;
    this._hlsManager = null;
    this._isSegmented = false;
    this._loadedBuffer = {};
    this._defaultSize = {
      height: "1920",
      width: "1080"
    };

    if (videoElement) {
      this._registerListener();
    }
  }

  // call manually when no videoElement
  // time => currentTime
  updateSubtitles(duration) {
    if (!this._isVisible) return;

    if (!this._currenTextTrack.cues) {
      _log["default"].warn("No selected track");

      return;
    }

    const _this$_currenTextTrac = this._currenTextTrack,
          cues = _this$_currenTextTrac.cues,
          language = _this$_currenTextTrac.language;

    if (!cues) {
      _log["default"].warn("No cues in the track");

      return;
    }

    if (this._isSegmented) {
      this._loadNextSegments(language, duration);
    }

    const currentCues = [];

    for (let index = 0; index < cues.length; index++) {
      const c = cues[index];

      if (duration >= c.start && duration <= c.end) {
        currentCues.push(c);
      }
    }

    if (!(0, _helpers.isArrayEqual)(currentCues, this._lastRenderedCues, "index")) {
      this._renderCues(currentCues); // @todo deep compare cues

    }
  }

}

exports["default"] = SubtitlesDisplayer;