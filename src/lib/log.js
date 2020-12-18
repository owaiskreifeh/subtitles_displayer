const TAG = "SubtitlesDisplayer: "
export default class Logger {
    static debug = false;

    static info = (...args) => {
        if (Logger.debug){
            console.log(TAG,...args)
        }
    }
    static warn = (...args) => {
        if (Logger.debug){
            console.warn(TAG,...args)
        }
    }
    static error = (...args) => {
        if (Logger.debug){
            console.error(TAG,...args)
        }
    }
}