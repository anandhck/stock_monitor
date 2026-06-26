require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const alertRoutes = require('./routes/alertRoutes');
const { startSocket } = require('./socketClient');


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

const PORT = process.env.PORT || 4000;

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


