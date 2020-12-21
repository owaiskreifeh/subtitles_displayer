import SubtitlesDisplayer from './src/index.js';
import { $ } from './src/lib/helpers.js';

const subtitlesDisplayer = new SubtitlesDisplayer($("#video-container"), $("#video"), true);
subtitlesDisplayer
    .addTrack(
        "./elephants-dream-subtitles-en.vtt",
        'ar'
    )
    .then((tracks) => {
        subtitlesDisplayer.selectTrackLanguage("ar");
        subtitlesDisplayer.setTextVisiblity(true);
        subtitlesDisplayer.setCueStyles({
            fontSize: "2em",
            color: "white",
            backgroundColor: "",
            textShadow: '2px 2px 4px #000',

        })
    })

window.subtitlesDisplayer = subtitlesDisplayer;