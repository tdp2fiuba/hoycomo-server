var storeRoutes = require('./store.js');
var config = require('../config/config');
var apiHostBase = config.api_host_base;
var loginRoutes = require('../routes/login')
var utilsRoutes = require('./utils.js');

exports.assignRoutes = function (app) {
    storeRoutes.assignRoutes(app);

    app.post(apiHostBase + "/login", loginRoutes.login);
    utilsRoutes.assignRoutes(app);

    //TODO otros objetos!

}