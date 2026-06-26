require('dotenv').config();
const express = require('express');
const cors = require('cors');
const alertRoutes = require('./routes/alertRoutes');

const app = express();
app.use(cors());
app.use('/api', alertRoutes);
const PORT = process.env.PORT || 4000;
const { startSocket } = require('./socketClient');


console.log('starting...');
startSocket();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


