var storeRoutes = require('./store.js');
var config = require('../config/config');
var apiHostBase = config.api_host_base;
var loginRoutes = require('../routes/login')

exports.assignRoutes = function (app) {
    //storeRoutes.assignRoutes(app);

    app.post(apiHostBase + "/login", loginRoutes.login);
}