const stats = require('../api/stats.js');
const config = require('../config/config.json');
const apiHostBase = config.api_host_base;

exports.assignRoutes = function (app) {
    //stats.config({db: app.get('db') , logger: app.get('logger')});

    //Billing
    app.get(apiHostBase + '/stats/billing',stats.getBilling);

    //Fee
    app.get(apiHostBase + '/stats/fee',stats.getFee);

    app.get(apiHostBase + '/stats/orders',stats.getOrders);

};
