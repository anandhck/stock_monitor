const crypto = require('crypto');

const alerts = [];
const MAX_ALERTS = 10;

const createAlert = (symbol, reason, ts) => {
const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
const alertRef = `TV-${randomHex}`; 

    const alert ={
        alertRef,
        symbol,
        reason,
        ts,
        timestamp: new Date(ts).toISOString()
    }

    alerts.push(alert);
    if(alerts.length > MAX_ALERTS){
        alerts.shift();
    }
    
    console.log('Alert created:', alert);
    return alert;
};
 const getRecentAlerts = () => {
    return alerts.slice(-MAX_ALERTS);
 }

module.exports = { createAlert, getRecentAlerts 
}