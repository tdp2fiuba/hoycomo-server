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
        //MONGODB_URI for mongo db in heroku app
        const db_uri = process.env.MONGODB_URI ? process.env.MONGODB_URI : 'mongodb://' + config.db_config.host + ":" + config.db_config.port + "/" + config.db_config.name;

        mongoose.connect(db_uri, { useMongoClient: true })
            .then(() => {
                console.log('mongo connection created on URI:'+ db_uri);
                // logger.log('mongo connection created');
                resolve(db);
            })
            .catch(err => {
                console.log('error creating db connection: ' + err);
                reject(db);
            });
    });
};