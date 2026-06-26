const expres = require('express');

const {getRecentAlerts} = require('../alertStore');

const router = expres.Router();


const authenticate = (req, res, next) => {
    const key = req.headers['x-api-key'];
    console.log('Received API key:', key);
    if(!key || key !== process.env.ALERTS_API_KEY){
        return res.status(401).json({success: false, message: 'Unauthorized'});
    }
    next();
}

router.get('/alerts', authenticate, (req, res) => {
    console.log('API key authenticated. Returning recent alerts.');
    res.json({success: true, alerts: getRecentAlerts()});
});

module.exports = router;
