const user = require('../api/user.js');
const apiHostBase = require('../config/config.json').api_host_base;

exports.assignRoutes = function (app) {
    user.config({logger: app.get('logger')});

    //Read user
    app.get(apiHostBase + '/user/:user_id',user.read);

    //Update user
    app.put(apiHostBase + '/user/:user_id', user.update);

    //Delete user
    app.delete(apiHostBase + '/user/:user_id',user.delete);

    //Search users
    app.get(apiHostBase + '/user',user.search);
};
