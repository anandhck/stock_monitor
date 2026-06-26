const crypto = require('crypto');


const createAlert = (symbol, reason, ts) => {
    const alertRef = 'TV-' + crypto.randomBytes(3).toString('hex').toLocaleUpperCase();

    const alert ={
        alertRef,
        symbol,
        reason,
        ts,
        timestamp: new Date(ts).toISOString()
    }
    console.log('Alert created:', alert);
    return alert;
};

module.exports = { createAlert 
}