const checkSpike = (history, thresholdPercent, windowsec) => {
  if (!history || history.length < 2) {
    return null;
  }

  const latestData = history[history.length - 1];
  const cutoffTime = latestData.ts - windowsec * 1000;

  let pastTick = null;
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].ts < cutoffTime) {
      pastTick = history[i];
      break;
    }
  }

  if (!pastTick) {
    return null;
  }

  const percentChange = ((latestData.close - pastTick.close) / pastTick.close) * 100;

  if (Math.abs(percentChange) >= thresholdPercent) {
    const direction = percentChange > 0 ? 'up' : 'down';
    return `price spiked ${Math.abs(percentChange).toFixed(2)}% ${direction} in the last ${windowsec} seconds.`;
  }

  return null;
};

module.exports = { checkSpike };
