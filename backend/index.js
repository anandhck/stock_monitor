require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const alertRoutes = require('./src/alerts/alertRoutes');
const { startSocket } = require('./src/feed/socketClient');
const { startLoadTest } = require('./src/utils/loadTest');

const app = express();
app.use(cors());
app.use('/api', alertRoutes);

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
  }
});

startSocket(io);

if(process.env.ENABLE_LOAD_TEST === 'true' ){
  startLoadTest(1000);
}

const PORT = process.env.PORT || 4000;

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


