const { checkMovingAverage } = require('../detection/checkMovingAverage');
const { checkSpike } = require('../detection/spikeDetector');
const { addToHistory, getHistory } = require('../history/history');

const startLoadTest = (count) =>{

     for(i=0; i<count; i++){
        const symbol = `STM_${i}`;
        let price = 1000 + Math.random() * 500;

        setInterval(() => {
            price = price * (1 + (Math.random() - 0.5) * 0.01);
            const tick = {
                symbol,
                close: price.toFixed(2),
                ts: Date.now() 
            }

            const start = process.hrtime.bigint();
            
            addToHistory(tick);
            checkSpike(getHistory(symbol), 3, 30);

            checkMovingAverage(getHistory(symbol), 5, 10);

            const end = process.hrtime.bigint();
            const microseconds = Number(end - start) / 1000;

            if(Math.random() < 0.001){
                console.log(`[LOAD TEST] tick processed in ${microseconds.toFixed(2)}us for ${symbol}`);
            }
        }, 1500);

     }


}

module.exports = {startLoadTest};