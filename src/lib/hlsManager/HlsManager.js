import {Parser as M3U8Parser} from "m3u8-parser";
import Logger from "../log";
import {request} from "../networking";

export default class HlsManager {
  _manifestBaseUrl = "";
  _tracks = [];

  loadManifest = async url => {
    this._manifestBaseUrl = this._getBaseUrl(url);
    const manifestText = await request("GET", url);
    const manifestObj = this._parse(manifestText);
    const tracks = manifestObj.mediaGroups.SUBTITLES.subtitles;
    this._populateTracks(tracks);
    return this._tracks;
  };

  loadTrack = async language => {
    const trackManifestIndex = this._tracks.findIndex(m => m.language == language);
    if (this._tracks[trackManifestIndex].loaded){
      return;
    }

    const trackManefestText = await request("GET", this._manifestBaseUrl + "/" + this._tracks[trackManifestIndex].uri);
    const trackManifestObject = this._parse(trackManefestText);
    this._tracks[trackManifestIndex].segments = trackManifestObject.segments;
    this._tracks[trackManifestIndex].loaded = true;
    this._tracks[trackManifestIndex].targetDuration = trackManifestObject.targetDuration;

    return this._tracks[trackManifestIndex];
  }

  getSegment = (language, index) => {
    const trackManifestIndex = this._tracks.findIndex(m => m.language == language);
    if (index < this._tracks[trackManifestIndex].segments.length) {
      const url = this._manifestBaseUrl 
      + '/' 
      + this._getBaseUrl(this._tracks[trackManifestIndex].uri)
      + '/'
      + this._tracks[trackManifestIndex].segments[index].uri;

      return {
        url, index, ...this._tracks[trackManifestIndex].segments[index]
      }
    }
    return {
      url: "",
      index
    }
  }

  getSegmentForDuration = (language, durationInSeconds) => {
    const trackManifest = this._tracks.find(m => m.language == language);
    const segemntIndex = parseInt(durationInSeconds / trackManifest.targetDuration);

    console.log(segemntIndex)
    return {
      url: this.getSegment(language, segemntIndex).url, 
      index: segemntIndex,
      ...trackManifest.segments[segemntIndex]
    }
    
  } 

  getTracks = () => {
    return this._tracks;
  }

  getTrack = language => {
    return this._tracks.find(m => m.language == language);
  }

  _populateTracks = tracks => {
    let __tracks = [];
    Object.keys(tracks).forEach(trackLabel => {
      __tracks.push({
        ...tracks[trackLabel],
        label: trackLabel,
        cues: [],
        segments: [],
        segmented: true,
        loaded: false
      })
    })
    this._tracks = __tracks;
  }

  _parse = m3u8Text => {
    const parser = new M3U8Parser();
    parser.push(m3u8Text);
    parser.end();
    return parser.manifest;
  }

  _getBaseUrl = url => { 
    const urlSegments = url.split("/");
    if (urlSegments[0] !== "https") {
      Logger.warn(`Unsafe use of ${urlSegments[0]}`);
    }
    urlSegments.pop();
    return urlSegments.join("/");
  };
}
