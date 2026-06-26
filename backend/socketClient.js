require('dotenv').config();
const { io: ioClient } = require('socket.io-client');
const axios = require('axios');
const { createAlert, getRecentAlerts } = require('./alertStore');
const { normalizeTickerData } = require('./normalizeTickerData');
const { addToHistory, getHistory } = require('./history');
const { checkSpike } = require('./spikeDetector');
const { checkMovingAverage } = require('./checkMovingAverage');
const { updateLivestatus } = require('./burst_guard');

const socket = ioClient(process.env.Ticker_tier);

const config = {
  RELIANCE: { strategy: 'spike', thresholdPercent: 0.1, windowSec: 30 },
  TCS: { strategy: 'movingAverage', deviationPercent: 0.1, sampleSize: 10 },
  INFY: { strategy: 'spike', thresholdPercent: 0.1, windowSec: 20 }
};

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

const startSocket = (io) => {
  socket.on('connect', async() => {
    console.log('Connected to WebSocket server');
    try{
    const response = await axios.get('https://mock-data.tealvue.in/api/v1/symbols');
    if(response.data && response.data.success){
      const validSymbols = response.data.data.map(item => item.symbol);

      const symbolsToSubscribe = Object.keys(config).filter(sym => validSymbols.includes(sym));
      socket.emit('subscribe', symbolsToSubscribe);
    }
   
    }catch(error){
      console.error('Failed to resolve dynamic symbol registration:', error.message);    }
  });

  socket.on('connect_error', (error) => {
    console.error('Connection error:', error);
  });

  socket.on('ticker', (data) => {
    console.log('Received ticker data:', data);
    const normalizedData = normalizeTickerData(data);
    addToHistory(normalizedData);

    io.emit('priceUpdate', normalizedData);

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
    const alert =  createAlert(normalizedData.symbol, reson, normalizedData.ts);
    io.emit('newAlert', alert);
    }

  });
};


module.exports = { startSocket };
