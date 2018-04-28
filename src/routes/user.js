const user = require('../api/user.js');
const apiHostBase = require('../config/config.json').api_host_base;

exports.assignRoutes = function (app) {
    user.config({logger: app.get('logger')});

    //Read store
    app.get(apiHostBase + '/user/:user_id',user.read);

    //Update store
    app.put(apiHostBase + '/user/:user_id', user.update);

    //Delete store
    app.delete(apiHostBase + '/user/:user_id',user.delete);

    //Search stores
    app.get(apiHostBase + '/user',user.search);
};
