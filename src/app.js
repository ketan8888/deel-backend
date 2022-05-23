const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');

const routes = require('./routes');
const app = express();


app.use(bodyParser.json());


app.use(morgan('combined'))


app.use('/api', routes);

module.exports = app;
