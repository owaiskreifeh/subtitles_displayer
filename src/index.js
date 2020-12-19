import { request } from './lib/networking';
import VttParser from './lib/vttParser/parser';
import Logger from './lib/log'
import { $, el, isArrayEqual } from './lib/helpers';


const CUE_CONT_CLASS = '__displayer_cues_container';
export default class SubtitlesDisplayer {
    constructor(videoContainer, videoElement = null, debug = false){
        this._videoElement = videoElement;
        this._videoContainer = videoContainer;

        this._textTracks = [];
        this._currenTextTrack = {};

        this._isVisible = false;
        this._lastRenderedCues = [];

        this._cuesContainer = this._getCuesContainer(); // init container

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
        const vttObject = VttParser.parse(vttText, { meta: true }, this._videoContainer.clientHeight);
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
        if (!visbile){
            this._clearRenderedCues()
        }
    }

    updateSubtitles(time) {
        if (! this._isVisible) return;

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
        this._clearRenderedCues();
        cues.forEach((c, i) => {
            let text = c.text.trim();
            const textLines = text.split("\n");
            this._applyStyles(c.cssStyles)
            textLines.forEach((line, i) => {
                const cueText = el('p');
                cueText.style.width = this._videoContainer.clientWidth + "px"
                cueText.textContent = line;
                this._cuesContainer.appendChild(cueText); 
                if (i !== textLines.length - 1){
                    const breakLine = el('br');
                    cueText.appendChild(breakLine); 
                }
            })
        })
        this._lastRenderedCues = cues;
    }

    _getCuesContainer = () => {
        let container = $(`.${CUE_CONT_CLASS}`);
        if (!container){
            container = el('div');
            container.className = CUE_CONT_CLASS;
            this._videoContainer.appendChild(container)
        }

        return container;
    }

    _clearRenderedCues = () => {
        while (this._cuesContainer.firstChild) {
            this._cuesContainer.removeChild(this._cuesContainer.lastChild);
        }
    }

    _applyStyles = (styles) => {
        Object.keys(styles).forEach(attr => {
            this._cuesContainer.style[attr] = styles[attr];
            console.log(styles.attr)
        })
    }

}

