const HttpStatus = require('http-status-codes');
const Order = require('../models/order.js');
const common = require('../utils/common.js');
const googleMaps = require('../models/googlemaps.js');
let logger;

exports.config = function(config){
    logger = config.logger;
    common.config(config);
};

