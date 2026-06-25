const histories = {};
const MaxHistoryLength = 50;

const addToHistory = (ticker) => {
  if (!histories[ticker.symbol]) {
    histories[ticker.symbol] = [];
  }

  histories[ticker.symbol].push(ticker);

  if (histories[ticker.symbol].length > MaxHistoryLength) {
    histories[ticker.symbol].shift();
  }

  console.log(histories[ticker.symbol]);
};

const getHistory = (symbol) => histories[symbol] || [];

module.exports = { histories, addToHistory, getHistory, MaxHistoryLength };
