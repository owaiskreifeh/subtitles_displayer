export default class AdManager {
  _adsCues = [];

  appendCues = cues => {
    this._adsCues.push(...cues);
    this._adsCues.sort((a, b) => a.startTime - b.startTime);
  };

  flushCues = () => {
    const adsCues = [...this._adsCues];
    this._adsCues = [];
    return adsCues;
  };

  getAdsCues = () => this._adsCues;

  getRealDuration = duration => {
    return duration - this._getPreviousAdsDuration(duration);
  };

  _getPreviousAdsDuration = duration => {
    let adsDurations = 0;
    for (let index = 0; index < this._adsCues.length; index++) {
      const adsCue = this._adsCues[index];
      if (duration <= adsCue.endTime) {
        adsDurations += adsCue.endTime - adsCue.startTime;
      }
    }
    return adsDurations;
  };
}
