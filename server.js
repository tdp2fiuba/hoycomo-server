'use strict';

var express = require('express');
var bodyparser = require('body-parser');
var log4js = require('log4js');
var cors = require('cors');

log4js.configure('./src/config/log.conf.json');
var logger = log4js.getLogger();
var db_tools = require('./src/tools/db_tools');
var config = require('./src/config/config.json');
var common = require('./src/utils/common.js');

var app = express();
db_tools.DBConnectMongoose()
    .then(() => {
        var routes = require('./src/routes/routes.js');
        
        app.use(cors());
        // configure app to use bodyParser()
        // this will let us get the data from a POST
        app.use(bodyparser.urlencoded({extended: true}));
        app.use(bodyparser.json({limit: '10mb'}));

        app.use(express.static(__dirname + '/src/assets'));
        app.use(express.static(__dirname + '/uploads'));

        app.set('logger',logger);

        routes.assignRoutes(app);
        
        var port = process.env.PORT || config.express.port;
        var host = process.env.HEROKU_ENVIRONMENT ? 'https://hoycomo-server.herokuapp.com' : 'http://localhost';
        var apiBaseURL =  process.env.HEROKU_ENVIRONMENT ? 'https://hoycomo-server.herokuapp.com' : ('http://localhost:' + port);
        common.setApiBaseURL(apiBaseURL);

        app.listen(port);
        logger.info('Server listening on '+ host +' port ' + port);
        console.log('Server listening on '+ host +' port ' + port);
    })
    .catch(err => {
        console.log('Error: ' + err);
})