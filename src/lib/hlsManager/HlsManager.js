import M3U8Parser from "m3u8-parser";
import Logger from "../log";
import {request} from "../networking";

export default class HlsManager {
  _manifestBaseUrl = "";

  _tracks = [];

  loadManifest = async url => {
    this._manifestBaseUrl = this._getBaseUrl(url);
    const manifestText = await request("GET", url);
    const manifestObj = M3U8Parser.parse(manifestText);

  };

  loadTracks = tracksUrls => {
    
  }

  _getTrack = async url => {

  }

  _getBaseUrl = url => {
    const urlSigments = url.slide("/");
    if (urlSigments[0] !== "https") {
      Logger.warn(`Unsafe use of ${urlSigments[0]}`);
    }
    urlSigments.pop();
    return urlSigments.join("/");
  };
}
