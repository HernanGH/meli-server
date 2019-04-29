const http = require('http');
const app = require('./src/app');
const logger = require('./src/logger');

const port = process.env.SERVER_PORT || '3005';

app.set('port', port);

const server = http.createServer(app);

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string'
    ? `Pipe ${port}` : `Port ${port}`;

  switch (error.code) {
    case 'EACCES':
      logger.error(`${bind} requires elevated privileges`);
      throw new Error(`${bind} requires elevated privileges`);
    case 'EADDRINUSE':
      logger.error(`${bind} is already in use`);
      throw new Error(`${bind} is already in use`);
    default:
      throw error;
  }
}

function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string'
    ? `pipe ${addr}` : `port ${addr.port}`;
  logger.info(`Listening on ${bind}`);
}

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);
