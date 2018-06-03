'use strict'

var mongoose = require('mongoose');
var config = require('../config/configdb.json');

var db;

exports.DBConnectMongoose = function() {
    return new Promise(function(resolve, reject) {
        if (db) {
            return db;
        }
        mongoose.Promise = global.Promise;

        // database connect
        //MONGODB_URI for mongo db in heroku app
        const db_uri = process.env.MONGODB_URI ? process.env.MONGODB_URI : 'mongodb://' + config.db_config.host + ":" + config.db_config.port + "/" + config.db_config.name;

        mongoose.connect(db_uri, { useMongoClient: true })
            .then(() => {
                console.log('mongo connection created on URI:'+ db_uri);
                resolve(db);
            })
            .catch(err => {
                console.log('error creating db connection: ' + err);
                reject(db);
            });
    });
};

exports.buildFindStoreQuery = function (filters) {
    var query = [];
    if (filters) {
        // Para poder filtrar por distancia, se necesita una propiedad que sea un array de dos Numbers,
        // con formato [ long, lat ] de la ubicación que se quiere usar
        if (filters.distance) {
            var addFields = { 
                $addFields: {
                    loc: ["$address.lon", "$address.lat"]
                } 
            };
            query.push(addFields);
        }
        var match = { $match: {} };

        // Por cada filtro
        for (var filter in filters) {
            switch (filter) {
                case "distance":
                    match.$match.loc = {
                        $geoWithin: {
                            $centerSphere: [
                                [filters.distance.lon, filters.distance.lat],
                                filters.distance.distance/6378.1
                            ]
                        }
                    };
                    break;
                case "foodTypes":
                    match.$match.foodTypes = {
                        $in: filters.foodTypes
                    };
                    break;
                case "delayTime":
                    match.$match.delay_time = {
                        $lte: filters.delayTime * 60
                    }; 
                    break;
                case "rating":
                    match.$match.rating = {
                        $gte: filters.rating
                    };
                    break;
                case "averagePrice":
                    match.$match.average_price = {
                        $lte: filters.averagePrice
                    }
                    break;
            }
        }
        query.push(match);
    }
    return query;
}