require('dotenv').config();
const { io } = require('socket.io-client');
const { normalizeTickerData } = require('./normalizeTickerData');
const { addToHistory, getHistory } = require('./history');
const { checkSpike } = require('./spikeDetector');
const { checkMovingAverage } = require('./checkMovingAverage');
const { updateLivestatus } = require('./burst_guard');

const socket = io(process.env.Ticker_tier);

const config = {
  RELIANCE: { strategy: 'spike', thresholdPercent: 3, windowSec: 30 },
  TCS: { strategy: 'movingAverage', deviationPercent: 5, sampleSize: 10 },
  INFY: { strategy: 'spike', thresholdPercent: 2.5, windowSec: 20 }
};

const runDetection = (symbol, history) =>{
  const settings = config[symbol];
  if(!settings) return null;

  if(settings.strategy === 'spike'){
    return checkSpike(history, settings.thresholdPercent, settings.windowSec);
  }
  if(settings.strategy === 'movingAverage'){
    return checkMovingAverage(history, settings.deviationPercent, settings.sampleSize);
  }

  return null;

}

const startSocket = () => {
  socket.on('connect', () => {
    console.log('Connected to WebSocket server');
    socket.emit('subscribe', Object.keys(config));
  });

  socket.on('connect_error', (error) => {
    console.error('Connection error:', error);
  });

  socket.on('ticker', (data) => {
    const normalizedData = normalizeTickerData(data);
    addToHistory(normalizedData);
    const isLive = updateLivestatus(normalizedData.symbol);
    console.log("", normalizedData.symbol, "isLive:", isLive);

    if (!isLive) {
      console.log(`Symbol ${normalizedData.symbol} is still in burst. Skipping detection.`);
    return;
    }

    const reson = runDetection(normalizedData.symbol, getHistory(normalizedData.symbol));
    console.log('reson for', normalizedData.symbol, ':', reson);
    console.log('history length for', normalizedData.symbol, ':', getHistory(normalizedData.symbol).length);
    if (reson) {
      console.log(`Detection for ${normalizedData.symbol}: ${reson}`);
    }
  });
};

module.exports = { startSocket };
