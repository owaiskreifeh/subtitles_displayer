

// @link https://developer.mozilla.org/en-US/docs/Web/API/WebVTT_API#Cue_settings
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
    style.textAlign = vttStyles.align || "center"; // @todo check if vertical

    // style.textDecoration = vttStyles.textDecoration.join(' ');
    style.writingMode = vttStyles.writingMode; // @todo this should be: vertical-rl || vertical-lr

    // reset cue container inset
    style.left = ''
    style.right = ''
    style.bottom = ''
    style.top = ''
    style.position = 'absolute'

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

    // @todo check for % and number rules
    /**
     * line: if(int) line>0 ? top-down, bottom-top
     * if(%): assert line>0; 0% top, 100% bottom
     */
    if (vttStyles.line) {
        const lenghtInfo = getLengthValueInfo(vttStyles.line);
        switch(lenghtInfo.unit){
          case "line": 
            if (lenghtInfo.value < 0) {
              style.bottom = lenghtInfo.value * -1 + "em"
            }else{
              style.top = lenghtInfo.value + "em"
            }
            break;
          case "%":
              style.top = lenghtInfo.value / 100 * containerHeight + "em" ;
            break;
        }
    }else{
      style.bottom = "1em"
    }

    // reset any undefined css attrs
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
      return {
        value: Number(lengthValue),
        unit: "line",
  
      };
    }

    return {
      value: Number(matches[1]),
      unit: matches[2],
    };
  }

  function getAbsoluteLengthInPixels(value, containerHeight){
    return (containerHeight * value / 50 /** cell/line height */) + 'px';
  }

  function convertLengthValue (lengthValue, containerHeight) {
    const lengthValueInfo =
        getLengthValueInfo(lengthValue);

    if (!lengthValueInfo) {
      return lengthValue;
    }

    const {unit, value} = lengthValueInfo;

    switch (unit) {
      case '%':
        return getAbsoluteLengthInPixels(
            ( value) / 100, containerHeight);
      case 'c':
        return getAbsoluteLengthInPixels(
            value, containerHeight);
      default:
        return lengthValue;
    }
  }