import { request } from "./lib/networking";
import VttParser from "./lib/vttParser/parser";
import HlsManager from "./lib/hlsManager/HlsManager";
import Logger from "./lib/log";
import { $, el, isArrayEqual } from "./lib/helpers";

const CUE_CONT_CLASS = "__displayer_cues_container";
export default class SubtitlesDisplayer {
  constructor(videoContainer, videoElement = null, debug = false) {
    this._videoElement = videoElement;
    this._videoContainer = videoContainer;

    this._textTracks = [];
    this._currenTextTrack = {};

    this._isVisible = false;
    this._lastRenderedCues = [];

    this._cuesContainer = this._getCuesContainer(); // init container
    this._cuesContainerStyles = {};
    this._cueStyles = {};

    Logger.debug = debug;

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

  getCurrentTrack = () => {
    return this._currenTextTrack;
  };

  addTrack = async (url, language) => {
    if (!url || typeof url !== "string") {
      throw `url should be of type strig, else found ${typeof url}`;
    }
    if (!language || typeof language !== "string") {
      throw `language should be of type string, else found ${typeof language}`;
    }

    const vttObject = this._parseRemoteVtt(url);
    this._textTracks.push({
      language,
      cues: vttObject.cues
    });
    return this._textTracks;
  };

  addM3U8Manifest = manifestUrl => {
    this._hlsManager = new HlsManager();
    this._isSegmented = true;
    return this._hlsManager.loadManifest(manifestUrl).then(tracks => {
      tracks.forEach(track => {
        this._textTracks.push(track);
      });
      return this._textTracks;
    });
  };

  selectTrackLanguage = async language => {
    Logger.info("Changing Track Language ", language);

    const track = this._textTracks.find(
      t => t.language.toLowerCase() === language.toLowerCase()
    );
    if (!track) {
      throw `No track for selected language ${language}`;
    }
    if (this._isSegmented) {
      await this._hlsManager.loadTrack(language).then(_track => {
        this._textTracks.forEach((t, i) => {
          if (_track.language === t.language) {
            this._textTracks[i] = _track;
          }
        });
      });
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

  setCuesContainerStyle = styles => {
    this._applyStyles(this._cuesContainer, styles);
  };

  appendCues = (language, cues) => {
    this._textTracks.forEach((t, _i) => {
      if (language === t.language) {
        t.cues.push(...cues);
      }
    });
  };

  // call manually when no videoElement
  // time => currentTime
  updateSubtitles(duration) {
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

    if (!isArrayEqual(currentCues, this._lastRenderedCues, "index")) {
      this._renderCues(currentCues); // @todo deep compare cues
    }
  }

  _loadNextSegments = (language, duration) => {
    const segmentIndex = parseInt(
      duration / this._currenTextTrack.targetDuration,
      10 // base
    );

    if (!this._loadedBuffer[language]){
      this._loadedBuffer[language] = [];
    }

    if (!this._loadedBuffer[language].includes(segmentIndex)) {
      this._loadedBuffer[language].push(segmentIndex);
      const segment = this._hlsManager.getSegment(language, segmentIndex);
      this._loadSegemnt(language, segment.url);
    }

    if (!this._loadedBuffer[language].includes(segmentIndex + 1)) {
      // preload next segment
      const nextSegment = this._hlsManager.getSegment(
        language,
        segmentIndex + 1
      );
      if (nextSegment.url) {
        this._loadedBuffer[language].push(segmentIndex + 1);
        this._loadSegemnt(language, nextSegment.url);
      }
    }
  };

  _loadSegemnt = async (language, url) => {
    if (!language) {
      Logger.error("Can't fetch for empty language");
      return;
    }
    if (!url) {
      Logger.error(`Empty Url fro language ${language}`);
      return;
    }
    const { cues } = await this._parseRemoteVtt(url);
    this.appendCues(language, cues);
  };

  _parseRemoteVtt = async url => {
    const vttText = await request("GET", url);
    return VttParser.parse(
      vttText,
      { meta: true },
      this._videoContainer.clientHeight || this._defaultSize.height,
      this._videoContainer.clientWidth || this._defaultSize.width
    );
  };

  _registerListener = () => {
    // start listen to video timeupdate if videoElement
    this._videoElement.addEventListener("timeupdate", () => {
      this.updateSubtitles(this._videoElement.currentTime);
    });
  };

  _renderCues = cues => {
    this._clearRenderedCues();
    cues.forEach(c => {
      const text = c.text.trim();
      const textLines = text.split("\n");
      const cueText = el("p"); // @todo convert to <span>, nest inside <p>

      textLines.forEach((line, i) => {
        const lineSpan = el("span");
        cueText.appendChild(lineSpan);

        lineSpan.innerHTML = line;
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
      container.style.display = "flex";
      container.style.flexDirection = "column";
      container.style.alignItems = "center";

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
