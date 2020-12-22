import { Parser as M3U8Parser } from "m3u8-parser";
import Logger from "../log";
import { request, resolveUrl } from "../networking";

export default class HlsManager {
  _manifestBaseUrl = "";

  _tracks = [];

  loadManifest = async url => {
    Logger.info("Loading M3U8 Manifest", url);
    this._manifestBaseUrl = this._getBaseUrl(url);
    const manifestText = await request("GET", url);
    const manifestObj = this._parse(manifestText);
    const tracks =
      manifestObj.mediaGroups.SUBTITLES[
        Object.keys(manifestObj.mediaGroups.SUBTITLES)[0]
      ];

    if (tracks) {
      this._populateTracks(tracks);
    } else {
      Logger.warn("No subtitles tracks found in the manifest");
    }

    return this._tracks;
  };

  loadTrack = async language => {
    const trackManifestIndex = this._tracks.findIndex(
      m => m.language === language
    );
    if (this._tracks[trackManifestIndex].loaded) {
      Logger.info(
        "Loading Text Track for ",
        language,
        " Already loaded, skipping"
      );
      return;
    }
    Logger.info("Loading Text Track for ", language);
    const trackManefestText = await request(
      "GET",
      resolveUrl(this._manifestBaseUrl, this._tracks[trackManifestIndex].uri)
    );
    const trackManifestObject = this._parse(trackManefestText);
    this._tracks[trackManifestIndex].segments = trackManifestObject.segments;
    if (
      !trackManifestObject.segments ||
      trackManifestObject.segments.length < 1
    ) {
      Logger.warn(`No segments found in track ${language}`);
    }
    this._tracks[trackManifestIndex].loaded = true;
    this._tracks[trackManifestIndex].targetDuration =
      trackManifestObject.targetDuration;

    // eslint-disable-next-line consistent-return
    return this._tracks[trackManifestIndex];
  };

  getSegment = (language, index) => {
    const trackManifestIndex = this._tracks.findIndex(
      m => m.language === language
    );
    if (index < this._tracks[trackManifestIndex].segments.length) {
      const url = resolveUrl(
        this._manifestBaseUrl,
        this._getBaseUrl(this._tracks[trackManifestIndex].uri),
        this._tracks[trackManifestIndex].segments[index].uri
      );
      return {
        url,
        index,
        ...this._tracks[trackManifestIndex].segments[index]
      };
    }
    Logger.error(`No segment with index${index} found`);
    return {
      url: "",
      index
    };
  };

  getSegmentForDuration = (language, durationInSeconds) => {
    const trackManifest = this._tracks.find(m => m.language === language);
    const segemntIndex = parseInt(
      durationInSeconds / trackManifest.targetDuration,
      10
    );
    return {
      url: this.getSegment(language, segemntIndex).url,
      index: segemntIndex,
      ...trackManifest.segments[segemntIndex]
    };
  };

  getTracks = () => {
    return this._tracks;
  };

  getTrack = language => {
    return this._tracks.find(m => m.language === language);
  };

  _populateTracks = tracks => {
    const __tracks = [];
    Object.keys(tracks).forEach(trackLabel => {
      __tracks.push({
        ...tracks[trackLabel],
        label: trackLabel,
        cues: [],
        segments: [],
        segmented: true,
        loaded: false
      });
    });
    this._tracks = __tracks;
  };

  _parse = m3u8Text => {
    const parser = new M3U8Parser();
    parser.push(m3u8Text);
    parser.end();
    return parser.manifest;
  };

  _getBaseUrl = url => {
    const urlSegments = url.split("/");
    if (urlSegments[0] === "http:") {
      Logger.warn(`Unsafe use of ${urlSegments[0]}`);
    }
    urlSegments.pop(); // remove /manifest.m3u8
    return urlSegments.join("/");
  };
}
