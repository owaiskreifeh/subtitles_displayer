import { request } from "./lib/networking";
import VttParser from "./lib/vttParser/parser";
import HlsManager from './lib/hlsManager/HlsManager';
import Logger from "./lib/log";
import { $, el, isArrayEqual } from "./lib/helpers";

const CUE_CONT_CLASS = "__displayer_cues_container";
export default class SubtitlesDisplayer {
  static hlsManager = new HlsManager();
  
  constructor(videoContainer, videoElement = null, debug = false) {
    this._videoElement = videoElement;
    this._videoContainer = videoContainer;

    this._textTracks = [];
    this._currenTextTrack = {};

    this._isVisible = false;
    this._lastRenderedCues = [];

    this._cuesContainer = this._getCuesContainer(); // init container

    this._cueStyles = {};

    Logger.debug = debug;

    this._hlsManager = null;
    this._isSegmented = false;
    this._currentLoadingUrls = [];
    this._loadedUrls = [];
    this._throttolRequests = false;
    if (videoElement) {
      this._registerListener();
    }
  }

  addTrack = async (url, language) => {
    if (!url || typeof url !== "string") {
      throw `url should be of type strig, else found ${typeof url}`;
    }
    if (!language || typeof language !== "string") {
      throw `language should be of type string, else found ${typeof language}`;
    }

    const vttObject = this._parseRemoteVtt(url)
    this._textTracks.push({
      language,
      cues: vttObject.cues
    });
    return this._textTracks;
  };

  addM3U8Manifest = manifestUrl => {
    this._hlsManager = new HlsManager();
    this._isSegmented = true;
    return this._hlsManager.loadManifest(manifestUrl)
    .then(tracks => {
      tracks.forEach(track => {
        this._textTracks.push(track);
      })
    })
  }

  selectTrackLanguage = async language => {
    const track = this._textTracks.find(
      t => t.language.toLowerCase() === language.toLowerCase()
    );
    if (!track) {
      throw `No track for selected language ${language}`;
    }
    if (this._isSegmented) {
      await this._hlsManager.loadTrack(language)
      .then((track) => {
        this._textTracks.forEach((t, i) => {
          if (track.language == t.language){
            this._textTracks[i] = track
          }
        })
        console.log(this._textTracks)
      })
    }
    this._currenTextTrack = track;
  };

  setTextVisiblity = visbile => {
    this._isVisible = visbile;
    if (!visbile) {
      this._clearRenderedCues();
    }
  };

  setCueStyles = styles => {
    this._cueStyles = styles;
  };

  appendCues = (language, cues) => {
    this._textTracks.forEach((t, i) => {
      if (language == t.language){
        t.cues.push(...cues)
      }
    })
  }

  // call manually when no videoElement
  // time => currentTime
  async updateSubtitles(duration) {
    if (!this._isVisible) return;

    if (!this._currenTextTrack.cues) {
      Logger.warn("No selected track");
      return;
    }
    const { cues, language } = this._currenTextTrack;
    if (!cues) {
      Logger.warn("No cues in the track");
      return;
    }

    const currentCues = [];
    for (let index = 0; index < cues.length; index++) {
      const c = cues[index];
      if (duration >= c.start && duration <= c.end){
        currentCues.push(c);
      }
    }

    if (currentCues.length < 1 && this._isSegmented && !this._throttolRequests) {
      this._throttolRequests = true;
      setTimeout(() => {
        const segment = this._hlsManager.getSegmentForDuration(language, duration);
        this._loadSegemnt(language, segment.url);

        // preload next segment
        const nextUrl = this._hlsManager.getSegment(language, segment.index+1);
        if (nextUrl.url) {
          this._loadSegemnt(language, nextUrl.url);
        }
        this._throttolRequests = false;
      }, 3000);
    }

    if (!isArrayEqual(currentCues, this._lastRenderedCues, "index")) {
      this._renderCues(currentCues); // @todo deep compare cues
    }
  }


  _loadSegemnt = async (language, url) => {
    console.log("_loadSegemnt", url)
    if (this._currentLoadingUrls.includes(url) && this._loadedUrls.includes(url)){
      return null;
    }
    this._currentLoadingUrls.push(url)
    const lastIndex = this._currentLoadingUrls.length - 1;
    const cues = (await this._parseRemoteVtt(url)).cues;
    this.appendCues(language, cues)
    this._loadedUrls.push(this._currentLoadingUrls.splice(lastIndex, 1)[0])
  }

  _parseRemoteVtt = async url => {
    const vttText = await request("GET", url);
    return VttParser.parse(
      vttText,
      { meta: true },
      this._videoContainer.clientHeight
    );

  }

  _registerListener = () => {
    // start listen to video timeupdate if videoElement
    this._videoElement.addEventListener("timeupdate", ev => {
      this.updateSubtitles(this._videoElement.currentTime);
    });
  };

  _renderCues = cues => {
    this._clearRenderedCues();
    cues.forEach((c, i) => {
      const text = c.text.trim();
      const textLines = text.split("\n");
      const cueText = el("p"); // @todo convert to <span>, nest inside <p>
      cueText.style.width = `${this._videoContainer.clientWidth}px`;

      textLines.forEach((line, i) => {
        const lineSpan = el("span");
        cueText.appendChild(lineSpan);

        lineSpan.textContent = line;
        if (i !== textLines.length - 1) {
          const breakLine = el("br");
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
  };

  _getCuesContainer = () => {
    let container = $(`.${CUE_CONT_CLASS}`);
    if (!container) {
      container = el("div");
      container.className = CUE_CONT_CLASS;

      container.style.position = "absolute";
      container.style.width = this._videoContainer.style.width;
      container.style.height = this._videoContainer.style.height;
      container.style.top = 0;
      container.style.left = 0;
      container.style.border = "2px dashed green";

      this._videoContainer.appendChild(container);
    }

    return container;
  };

  _clearRenderedCues = () => {
    while (this._cuesContainer.firstChild) {
      this._cuesContainer.removeChild(this._cuesContainer.lastChild);
    }
  };

  _applyStyles = (element, styles) => {
    Object.keys(styles).forEach(attr => {
      element.style[attr] = styles[attr];
    });
  };
}
