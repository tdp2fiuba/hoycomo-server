const login = require('../api/login.js');
const common = require('../utils/common.js');
const apiHostBase = common.getConfigValue('api_host_base');

exports.assignRoutes = function (app) {
    login.config({logger: app.get('logger')});

    //deprecated in future
    app.post(apiHostBase + "/login", login.loginStoreDEPRECATED);

    app.post(apiHostBase + "/store/auth", login.loginStore);

    app.get(apiHostBase + "/store/logout", login.logout);

    app.post(apiHostBase + '/user/auth/facebook', login.loginUser);

    app.get(apiHostBase + '/user/logout', login.logout);
};