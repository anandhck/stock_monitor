const { checkMovingAverage } = require("../detection/checkMovingAverage");
const { checkSpike } = require("../detection/spikeDetector");
const { config } = require("./detectionConfig");

const runDetection = (symbol, history) =>{
  const settings = config[symbol] || { strategy: 'spike', thresholdPercent: 0.5, windowSec: 30 };;
  if(!settings) return null;

  if(settings.strategy === 'spike'){
    return checkSpike(history, settings.thresholdPercent, settings.windowSec);
  }
  if(settings.strategy === 'movingAverage'){
    return checkMovingAverage(history, settings.deviationPercent, settings.sampleSize);
  }

  return null;

}

module.exports = {runDetection};