const normalizeTickerData = (raw) => ({
  symbol: raw.SYMBOL,
  close: raw.CLOSE,
  ts: new Date(raw.TS.replace(' ', 'T')).getTime()
});

module.exports = { normalizeTickerData };
