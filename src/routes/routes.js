const storeRoutes = require('./store.js');
const config = require('../config/config');
const apiHostBase = config.api_host_base;
const loginRoutes = require('../routes/login')
const utilsRoutes = require('./utils.js');
const fileRoutes = require('./file.js');

exports.assignRoutes = function (app) {
    storeRoutes.assignRoutes(app);

    app.post(apiHostBase + "/login", loginRoutes.login);

    utilsRoutes.assignRoutes(app);

    fileRoutes.assignRoutes(app);
};