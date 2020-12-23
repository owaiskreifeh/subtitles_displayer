"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class AdManager {
  constructor() {
    _defineProperty(this, "_adsCues", []);

    _defineProperty(this, "appendCues", cues => {
      this._adsCues.push(...cues);

      this._adsCues.sort((a, b) => a.startTime - b.startTime);
    });

    _defineProperty(this, "flushCues", () => {
      const adsCues = [...this._adsCues];
      this._adsCues = [];
      return adsCues;
    });

    _defineProperty(this, "getAdsCues", () => this._adsCues);

    _defineProperty(this, "getRealDuration", duration => {
      return duration - this._getPreviousAdsDuration(duration);
    });

    _defineProperty(this, "_getPreviousAdsDuration", duration => {
      let adsDurations = 0;

      for (let index = 0; index < this._adsCues.length; index++) {
        const adsCue = this._adsCues[index];

        if (duration <= adsCue.endTime) {
          adsDurations += adsCue.endTime - adsCue.startTime;
        }
      }

      return adsDurations;
    });
  }

}

exports["default"] = AdManager;