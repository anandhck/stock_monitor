const lastRealArrival = {};
const isLive = {};
const Live_THRESHOLD = 1000;

function updateLivestatus(symbol) {
   const now = Date.now();
   if(lastRealArrival[symbol] !== undefined){
    const gab = now - lastRealArrival[symbol];
    if(gab > Live_THRESHOLD){
        isLive[symbol] = true;
    }
   }
    lastRealArrival[symbol] = now; 
    return isLive[symbol] || false;
}

module.exports = {updateLivestatus};