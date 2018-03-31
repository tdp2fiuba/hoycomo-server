'use strict';

//Requires
var log4js = require('log4js');
var express = require("express");
var app = express();
var http = require('http');
var massive = require("massive");
var path = require('path');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

//Require configs files
var config = require('./src/config/configdb.js');
var configDB = require('./src/config/configdb.js');

//Api files
var api = require('./src/api/api.js');


//Configure log
log4js.configure('./src/config/log.conf.json');
var logger = log4js.getLogger();

//Set up bodyparser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


//Set up mongoose connection
var mongoDB = 'mongodb://' + configDB.host + '/'+ configDB.db;
mongoose.connect(mongoDB);
logger.debug('Conecting mongoDB, host: '+ configDB.host + ' DB: ' + configDB.db);

// Get Mongoose to use the global promise library
mongoose.Promise = global.Promise;
//Get the default connection
var db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on('error', logger.error('MongoDB connection error'));


logger.debug('Server config succefull');

var configApi = {};
configApi.logger = logger;


app.route('/').get(function(req, res){
	 res.send('Error, check API in www.');
});

/*
//listados de puestos de trabajo
app.get('/job_positions', api.jobPositions);

//listado de puestos de trabajo por categoria
app.get('/job_positions/categories/:category', api.findJobPositionsByCategory);

//alta de puestos
app.post('/job_positions/categories/:category', api.addJobPosition);

//baja de puesto
app.delete('/job_positions/categories/:category/:name',api.deleteJobPosition);

//update de puesto
app.put('/job_positions/categories/:category/:name',api.updateJobPosition);

//listado de skills
app.get('/skills', api.skills);

//listado de skills por categoria
app.get('/skills/categories/:category', api.findSkillsByCategory);

//alta de skill
app.post('/skills/categories/:category',api.addSkill);

//baja de skill
app.delete('/skills/categories/:category/:name',api.deleteSkill);

//update de skill
app.put('/skills/categories/:category/:name',api.updateSkill);

//listado de categorias
app.get('/categories', api.categories);

//alta de categoria
app.post('/categories',api.addCategory);

//baja de categoria
app.delete('/categories/:category',api.deleteCategory);

//update de categoria
app.put('/categories/:category',api.updateCategory);
*/