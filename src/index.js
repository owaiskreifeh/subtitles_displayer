import { request } from './lib/networking.js';
import VttParser from './lib/vttParser/parser.js';
import Logger from './lib/log.js'
import { $, el, isArrayEqual } from './lib/helpers.js';

export default class SubtitlesDisplayer {
    constructor(videoContainer, videoElement = null, debug = false){
        this._videoElement = videoElement;
        this._videoContainer = videoContainer;

        this._textTracks = [];
        this._currenTextTrack = {};

        this._isVisible = false;
        this._lastRenderedCues = [];

        Logger.debug = debug;

        if (videoElement){
            this._registerListener();
        }

    }

    addTrack = async (url, language) => {
        if (!url || typeof(url) !== 'string'){
            throw (`url should be of type strig, else found ${typeof(url)}`)
        }
        if (!language || typeof(language) !== 'string'){
            throw (`language should be of type string, else found ${typeof(language)}`)
        }

        const vttText = await request("GET", url);
        const vttObject = VttParser.parse(vttText, { meta: true });
        this._textTracks.push({
            language,
            cues: vttObject.cues
        })
        return this._textTracks;
    }

    selectTrackLanguage = (language) => {
        const track = this._textTracks.find(t=>t.language.toLowerCase()===language.toLowerCase())
        if(!track){
            throw (`No track for selected language ${language}`)
        }
        this._currenTextTrack = track;
    }

    setTextVisiblity = (visbile) => {
        this._isVisible = visbile;
    }

    updateSubtitles(time) {
        if (!this._currenTextTrack.cues) {
            Logger.warn("No selected track")
            return;
        }
        const cues = this._currenTextTrack.cues;
        if (!cues){
            Logger.warn("No cues in the track")
            return;
        }

        const currentCues = cues.filter(c => {
            return time >= c.start  &&  time <= c.end;
        })

        if (!isArrayEqual(currentCues, this._lastRenderedCues)){
            this._renderCues(currentCues);
        }
    }


    _registerListener = () => {
        this._videoElement.addEventListener('timeupdate', ev => {
            this.updateSubtitles(this._videoElement.currentTime)
        });
    }

    _renderCues = (cues) => {
        const cueCont = this._getCuesContainer();
        this._clearRenderedCues(cueCont);
        cues.forEach(c => {
            const cueText = el('p');
            cueText.textContent = `vt: ${this._videoElement.currentTime}, cs: ${c.start}, ce: ${c.end}, TEXT: ${c.text}`;
            cueCont.appendChild(cueText);
        })
        this._lastRenderedCues = cues;
    }

    _getCuesContainer = () => {
        let container = $("#__displayer_cues_container");
        if (!container){
            container = el('div');
            container.id = "__displayer_cues_container";
            this._videoContainer.appendChild(container)
        }

        return container;
    }

    _clearRenderedCues = (cueCont) => {
        while (cueCont.firstChild) {
            cueCont.removeChild(cueCont.lastChild);
        }
    }

}

