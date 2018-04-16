'use strict';
const express = require('express');
const bodyparser = require('body-parser');
const log4js = require('log4js');
const cors = require('cors');

log4js.configure('./src/config/log.conf.json');
const logger = log4js.getLogger();
const db_tools = require('./src/tools/db_tools');
const config = require('./src/config/config.json');
const common = require('./src/utils/common.js');
global.__basedir = __dirname;

const app = express();
db_tools.DBConnectMongoose()
    .then(() => {
        const routes = require('./src/routes/routes.js');
        
        app.use(cors());
        app.use(bodyparser.urlencoded({extended: true}));
        app.use(bodyparser.json({limit: '10mb'}));

        app.use(express.static(__dirname + '/src/assets'));
        //app.use(express.static(__dirname + '/uploads/'));
        app.use('/uploads', express.static(__dirname + '/uploads'));

        // app.set('logger',logger);

        app.get("/", function(req, res) {
            res.sendFile(__dirname + "/src/index.html");
        });

        routes.assignRoutes(app);

        const port = process.env.PORT || config.express.port;
        const host = process.env.HEROKU_ENVIRONMENT ? 'https://hoycomo-server.herokuapp.com' : 'http://localhost';
        const apiBaseURL =  process.env.HEROKU_ENVIRONMENT ? 'https://hoycomo-server.herokuapp.com' : ('http://localhost:' + port);
        common.setApiBaseURL(apiBaseURL);

        app.listen(port);
        logger.info('Server listening on '+ host +' port ' + port);
        console.log('Server listening on '+ host +' port ' + port);
    })
    .catch(err => {
        console.log('Error: ' + err);
})