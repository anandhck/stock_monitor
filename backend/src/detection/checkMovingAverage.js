

const checkMovingAverage = (history, deviationPercent, sampleSize)=>{
    if (history.length < sampleSize) {
        return null;
    }

    const recent = history.slice(-sampleSize);

    const sum = recent.reduce((acc, ticker) => acc + ticker.close, 0);
    const movingAverage = sum / sampleSize;

    const latestPrice = history[recent.length - 1].close;
    const deviation = ((latestPrice - movingAverage) / movingAverage) * 100;


    if (Math.abs(deviation) >= deviationPercent) {
        const direction = deviation > 0 ? 'above' : 'below';
        return `price is ${Math.abs(deviation).toFixed(2)}% ${direction} its ${sampleSize}-day moving average of ${movingAverage.toFixed(2)}`;
    }

    return null;
};

module.exports = { checkMovingAverage };