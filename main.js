import SubtitlesDisplayer from './src/index.js';
import { $ } from './src/lib/helpers.js';

const subtitlesDisplayer = new SubtitlesDisplayer($("#video-container"), $("#video"), true);
subtitlesDisplayer
    .addTrack(
        "https://raw.githubusercontent.com/ThePacielloGroup/AT-browser-tests/gh-pages/video/subtitles-en.vtt",
        'ar'
    )
    .then((tracks) => {
        subtitlesDisplayer.selectTrackLanguage("ar");
    })