
/**
 * @enum {string}
 * @export
 */
const _positionAlign = {
    'LEFT': 'line-left',
    'RIGHT': 'line-right',
    'CENTER': 'center',
    'AUTO': 'auto',
  };
  
  
  /**
   * @enum {string}
   * @export
   */
  const _textAlign = {
    'LEFT': 'left',
    'RIGHT': 'right',
    'CENTER': 'center',
    'START': 'start',
    'END': 'end',
  };
  
  
  /**
   * Vertical alignments of the cues within their extents.
   * 'BEFORE' means displaying at the top of the captions container box, 'CENTER'
   *  means in the middle, 'AFTER' means at the bottom.
   * @enum {string}
   * @export
   */
  const _displayAlign = {
    'BEFORE': 'before',
    'CENTER': 'center',
    'AFTER': 'after',
  };
  
  
  /**
   * @enum {string}
   * @export
   */
  const _direction = {
    'HORIZONTAL_LEFT_TO_RIGHT': 'ltr',
    'HORIZONTAL_RIGHT_TO_LEFT': 'rtl',
  };
  
  
  /**
   * @enum {string}
   * @export
   */
  const _writingMode = {
    'HORIZONTAL_TOP_TO_BOTTOM': 'horizontal-tb',
    'VERTICAL_LEFT_TO_RIGHT': 'vertical-lr',
    'VERTICAL_RIGHT_TO_LEFT': 'vertical-rl',
  };
  
  
  /**
   * @enum {number}
   * @export
   */
  const _lineInterpretation = {
    'LINE_NUMBER': 0,
    'PERCENTAGE': 1,
  };
  
  
  /**
   * @enum {string}
   * @export
   */
  const _lineAlign = {
    'CENTER': 'center',
    'START': 'start',
    'END': 'end',
  };
  
  
  /**
   * In CSS font weight can be a number, where 400 is normal and 700 is bold.
   * Use these values for the enum for consistency.
   * @enum {number}
   * @export
   */
  const _fontWeight = {
    'NORMAL': 400,
    'BOLD': 700,
  };
  
  
  /**
   * @enum {string}
   * @export
   */
  const _fontStyle = {
    'NORMAL': 'normal',
    'ITALIC': 'italic',
    'OBLIQUE': 'oblique',
  };
  
  
  /**
   * @enum {string}
   * @export
   */
  const _textDecoration = {
    'UNDERLINE': 'underline',
    'LINE_THROUGH': 'lineThrough',
    'OVERLINE': 'overline',
  };
  


function styleParser(vttStyleText) {
    const stylesChunks = vttStyleText.split(" ");
    const parsed = {};
    stylesChunks.forEach(chunk => {
        const [attr, value] = chunk.split(":");
        parsed[attr] = value;
    })
    return parsed;
}

export function vttStylesToCSS(vttStyleText, containerHeight) {

    if(!containerHeight){
        throw ("containerHeight should be set")
    }

    const vttStyles = styleParser(vttStyleText);
    const style = {};

    style.whiteSpace = 'pre-wrap';

    style.backgroundColor = vttStyles.backgroundColor || "#444";
    style.border = vttStyles.border;
    style.color = vttStyles.color || "white";
    style.direction = vttStyles.direction;
    style.opacity = vttStyles.opacity;
    style.paddingLeft = vttStyles.linePadding
    style.paddingRight = vttStyles.linePadding
    style.textAlign = vttStyles.align || "center";
    style.position = 'absolute';

    // style.textDecoration = vttStyles.textDecoration.join(' ');
    style.writingMode = vttStyles.writingMode;

    style.left = ''
    style.right = ''
    style.bottom = ''
    style.top = ''
    if (vttStyles.backgroundImage) {
      style.backgroundImage = 'url(\'' + vttStyles.backgroundImage + '\')';
      style.backgroundRepeat = 'no-repeat';
      style.backgroundSize = 'contain';
      style.backgroundPosition = 'center';

      if (vttStyles.backgroundColor == '') {
        // In text-based cues, background color can default in CSS.
        // In bitmap-based cues, we default to a transparent background color,
        // so that the bitmap can be the only background.
        style.backgroundColor = 'transparent';
      }
    }

    if (vttStyles.line) {
        style.top = containerHeight / 50 - (vttStyles.line * 50 % containerHeight)  + "px"


    }

    Object.keys(style).map(attr => {
        if (!style[attr] || style[attr] == undefined){
            style[attr] = ''
        }
    })
      return style;
}



  function getLengthValueInfo (lengthValue) {
    const matches = new RegExp(/(\d*\.?\d+)([a-z]+|%+)/).exec(lengthValue);
    
    if (!matches) {
      return getLengthValueInfo(lengthValue + "%")
    }
    
    return {
      value: Number(matches[1]),
      unit: matches[2],
    };
  }

  function getAbsoluteLengthInPixels(value, containerHeight){
      return (value * containerHeight) + 'px';
  }

  function convertLengthValue (lengthValue, containerHeight) {
    const lengthValueInfo =
        getLengthValueInfo(lengthValue);

        console.log({lengthValueInfo})
    if (!lengthValueInfo) {
      return lengthValue;
    }

    const {unit, value} = lengthValueInfo;

    switch (unit) {
      case '%':
        return getAbsoluteLengthInPixels(
            ( value) / 100, 1);
      case 'c':
        return getAbsoluteLengthInPixels(
            value, containerHeight);
      default:
        return lengthValue;
    }
  }