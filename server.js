'use strict';

var express = require('express');
var bodyparser = require('body-parser');
// var log4js = require('log4js');

// log4js.configure('./src/config/log.conf.json');
// var logger = log4js.getLogger();
var db_tools = require('./src/tools/db_tools');
var config = require('./src/config/config.json');

var app = express();

db_tools.DBConnectMongoose()
    .then((db) => {
        var routes = require('./src/routes/routes');

        // configure app to use bodyParser()
        // this will let us get the data from a POST
        app.use(bodyparser.urlencoded({extended: true}));
        app.use(bodyparser.json({limit: '10mb'}));

        // app.set('logger',logger);
        app.set('db',db);
        
        routes.assignRoutes(app);

        var port = config.express.port;

        app.listen(port);

        console.log('Server listening on port ' + port);
    })
    .catch(err => {
        console.log('Error: ' + err);
})