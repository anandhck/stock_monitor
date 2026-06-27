const config = {
  RELIANCE: { strategy: 'spike', thresholdPercent: 3, windowSec: 30 },
  TCS: { strategy: 'movingAverage', deviationPercent: 5, sampleSize: 10 },
  INFY: { strategy: 'spike', thresholdPercent: 2.5, windowSec: 20 }
};

module.exports = { config };