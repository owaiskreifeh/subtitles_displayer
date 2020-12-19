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
        console.log(tracks)
    })

window.subtitlesDisplayer = subtitlesDisplayer;