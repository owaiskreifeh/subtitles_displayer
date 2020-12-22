"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

// @link https://developer.mozilla.org/en-US/docs/Web/API/WebVTT_API#Cue_settings
function styleParser(vttStyleText) {
  const stylesChunks = vttStyleText.split(" ");
  const parsed = {};
  stylesChunks.forEach(chunk => {
    const _chunk$split = chunk.split(":"),
          _chunk$split2 = _slicedToArray(_chunk$split, 2),
          attr = _chunk$split2[0],
          value = _chunk$split2[1];

    parsed[attr] = value;
  });
  return parsed;
}

function getLengthValueInfo(lengthValue) {
  return {
    value: parseInt(lengthValue, 10),
    unit: `${lengthValue}`.includes("%") ? "%" : "em"
  };
}
/**
 *
 * General rules for styling
 *
 * line: if(int) line>0 ? top-down, bottom-top
 *       if(%): assert line>0; 0% top, 100% bottom
 * vertical: lr = ltr; rl = rtl
 * position: assert position>0; 0% left; 100% right
 * size: assert size>0; width = size%
 * align: if (vertical) align = vertical-align // if vertical attr appears in the cue settings
 *        else align = text-align
 */


function vttStylesToCSS(vttStyleText, containerHeight, containerWidth) {
  if (!containerHeight) {
    throw "containerHeight should be set";
  }

  const vttStyles = styleParser(vttStyleText);
  const style = {};
  style.whiteSpace = "pre-wrap";
  style.backgroundColor = vttStyles.backgroundColor || "#444";
  style.border = vttStyles.border;
  style.color = vttStyles.color || "white";
  style.direction = vttStyles.direction;
  style.opacity = vttStyles.opacity;
  style.paddingLeft = vttStyles.linePadding;
  style.paddingRight = vttStyles.linePadding;
  style.position = "absolute";
  style.margin = "0 1em";

  if (!vttStyles.align || vttStyles.align === "middle") {
    style.textAlign = "center";
  } else {
    style.textAlign = vttStyles.align;
  } // style.textDecoration = vttStyles.textDecoration.join(' ');
  // style.writingMode = vttStyles.writingMode; // @todo this should be: vertical-rl || vertical-lr
  // reset cue container inset


  style.left = "";
  style.right = "";
  style.bottom = "";
  style.top = ""; // style.position = "absolute";

  if (vttStyles.backgroundImage) {
    style.backgroundImage = `url('${vttStyles.backgroundImage}')`;
    style.backgroundRepeat = "no-repeat";
    style.backgroundSize = "contain";
    style.backgroundPosition = "center";

    if (vttStyles.backgroundColor === "") {
      // In text-based cues, background color can default in CSS.
      // In bitmap-based cues, we default to a transparent background color,
      // so that the bitmap can be the only background.
      style.backgroundColor = "transparent";
    }
  }

  if (vttStyles.size) {
    style.width = `${vttStyles.size}`.includes("%") ? vttStyles.size : `${vttStyles.size}px`;
  } else {
    style.width = `${containerWidth}px`;
  } // @todo check for % and number rules

  /**
   * line: if(int) line>0 ? top-down, bottom-top
   * if(%): assert line>0; 0% top, 100% bottom
   */


  if (vttStyles.line) {
    const lenghtInfo = getLengthValueInfo(vttStyles.line);

    switch (lenghtInfo.unit) {
      case "em":
        if (lenghtInfo.value < 0) {
          style.bottom = `${lenghtInfo.value * -1}em`;
        } else {
          style.top = `${lenghtInfo.value}em`;
        }

        break;

      case "%":
        if (lenghtInfo.value > 90) {
          style.bottom = "0em";
        } else {
          style.top = vttStyles.line;
        }

        break;

      default:
        break;
    }
  } else {
    style.bottom = "0em";
  } // reset any undefined css attrs


  Object.keys(style).forEach(attr => {
    if (!style[attr] || style[attr] == undefined) {
      style[attr] = "";
    }
  });
  return style;
}

var _default = vttStylesToCSS;
exports["default"] = _default;