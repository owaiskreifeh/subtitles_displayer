
# usage 
```javascript
import Dis from '../project/src/index';

const display = new Dis(
  document.getElementById("video-container"),
  document.getElementById("video"),
  true, // debug on
);
display.addM3U8Manifest(url)
.then( async tracks => {
  console.log({tracks})
  display.selectTrackLanguage("ara");
  display.setTextVisiblity(true)
  display.setCueStyles({
    backgroundColor: "#0000",
    color: "red",
    fontSize: "2em"
  })
})
```