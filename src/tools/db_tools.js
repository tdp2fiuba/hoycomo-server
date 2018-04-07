'use strict'

var mongoose = require('mongoose');
var config = require('../config/configdb.json');
var log4js = require('log4js');
log4js.configure('./src/config/log.conf.json');
// var logger = log4js.getLogger();

var db;

exports.DBConnectMongoose = function() {
    return new Promise(function(resolve, reject) {
        if (db) {
            return db;
        }
        mongoose.Promise = global.Promise;

        // database connect
        mongoose.connect('mongodb://' + config.db_config.host + ":" + config.db_config.port + "/" + config.db_config.name, { useMongoClient: true })
            .then(() => {
                // logger.log('mongo connection created');
                resolve(db);
            })
            .catch(err => {
                console.log('error creating db connection: ' + err);
                reject(db);
            });
    });
};