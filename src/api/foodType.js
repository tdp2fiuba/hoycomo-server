const FoodTypes = require('../models/foodType.js');
const HttpStatus = require('http-status-codes');
const common = require('../utils/common.js');

let logger;

exports.config = (config) => {
	logger = config.logger;
	common.config(config);
};

exports.getAll = (req, res) => {
    FoodTypes.getFoodTypes()
        .then((foodTypes) => {
            res.status(HttpStatus.OK).json(foodTypes);
        })
        .catch((err) => {
            // logger.error("Error while getting food types: " + err);
            console.log(err);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json("Error al obtener tipos de comida");
        })
};