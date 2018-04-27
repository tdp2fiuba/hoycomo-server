const login = require('../api/login.js');
const common = require('../utils/common.js');
const apiHostBase = common.getConfigValue('api_host_base');
const passport = require('passport');

exports.assignRoutes = function (app) {
    login.config({logger: app.get('logger')});

    app.post(apiHostBase + "/login", login.loginStore);

    app.post(apiHostBase + "/store/auth", passport.authenticate('local'), login.loginStore);

    app.get(apiHostBase + "/store/logout", login.logout);

    app.post(apiHostBase + '/user/auth/facebook', passport.authenticate('facebook-token'),login.loginUser);

    app.get(apiHostBase + '/user/logout', login.logout);
};