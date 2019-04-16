'use strict';

const routes = require('./routes');
const expressWinston = require('express-winston');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const logger = require('./logger');
var app = express();

app.use(cors());
app.use(expressWinston.logger({
    winstonInstance: logger,
    expressFormat: true,
    colorize: false,
    meta: false,
    statusLevels: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use('/', (req, res) => {
    res.json({now: new Date()});
});

Object.keys(routes).forEach((key) => {
    app.use(`/api/${routes[key].path}`, routes[key].router);
});

app.use(function(req, res, next) {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});
module.exports = app;
