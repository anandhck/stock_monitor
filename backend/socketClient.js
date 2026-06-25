require('dotenv').config();
const { io } = require('socket.io-client');
const { normalizeTickerData } = require('./normalizeTickerData');
const { addToHistory, getHistory } = require('./history');
const { checkSpike } = require('./spikeDetector');
const { checkMovingAverage } = require('./checkMovingAverage');

const socket = io(process.env.Ticker_tier);
const SUBSCRIBE_SYMBOLS = ['RELIANCE', 'TCS', 'INFY'];

const startSocket = () => {
  socket.on('connect', () => {
    console.log('Connected to WebSocket server');
    socket.emit('subscribe', SUBSCRIBE_SYMBOLS);
  });

  socket.on('connect_error', (error) => {
    console.error('Connection error:', error);
  });

  socket.on('ticker', (data) => {
    const normalizedData = normalizeTickerData(data);
    addToHistory(normalizedData);

    const spikeMessage = checkSpike(getHistory(normalizedData.symbol), 3, 30);
    const movingAverageMessage = checkMovingAverage(getHistory(normalizedData.symbol), 5, 10);
    if (spikeMessage) {
      console.log(`Spike detected for ${normalizedData.symbol}: ${spikeMessage}`);
    }
    if (movingAverageMessage) {
      console.log(`Moving average alert for ${normalizedData.symbol}: ${movingAverageMessage}`);
    }
  });
};

module.exports = { startSocket };
