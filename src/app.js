const expressWinston = require('express-winston');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const routes = require('./routes');
const logger = require('./logger');

const app = express();

app.use(cors());
app.use(expressWinston.logger({
  winstonInstance: logger,
  expressFormat: true,
  colorize: false,
  meta: false,
  statusLevels: true,
}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

Object.keys(routes).forEach((key) => {
  app.use(`/api/${routes[key].path}`, routes[key].router);
});

app.use('/', (req, res) => {
  res.json({ now: new Date() });
});

app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});
module.exports = app;
