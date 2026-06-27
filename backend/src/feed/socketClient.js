require('dotenv').config();
const { io: ioClient } = require('socket.io-client');
const axios = require('axios');
const { createAlert, getRecentAlerts } = require('../alerts/alertStore');
const { normalizeTickerData } = require('../utils/normalizeTickerData');
const { addToHistory, getHistory } = require('../history/history');
const { checkSpike } = require('../detection/spikeDetector');
const { checkMovingAverage } = require('../detection/checkMovingAverage');
const { updateLivestatus } = require('../detection/burst_guard');
const { config } = require('../config/detectionConfig');
const { runDetection } = require('../config/runDetection');

const socket = ioClient(process.env.Ticker_tier);


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

      process.on('SIGINT', () => {
        console.log('Shutting down, unsubscribing from symbols...');
        socket.emit('unsubscribe', Object.keys(config));
        socket.disconnect();
        process.exit(0);
      });

      socket.on('connect_error', (error) => {
    console.error('Connection error:', error);
  });

  socket.on('ticker', (data) => {
    const normalizedData = normalizeTickerData(data);
    addToHistory(normalizedData);

    io.emit('priceUpdate', normalizedData);

    const isLive = updateLivestatus(normalizedData.symbol);

    if (!isLive) {
    return;
    }

    const reson = runDetection(normalizedData.symbol, getHistory(normalizedData.symbol));

    if (reson) {
    const alert =  createAlert(normalizedData.symbol, reson, normalizedData.ts);
    io.emit('newAlert', alert);
    }

  });
};


module.exports = { startSocket };
