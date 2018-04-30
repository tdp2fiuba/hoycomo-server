const order = require('../api/order.js');
const apiHostBase = require('../config/config.json').api_host_base;

exports.assignRoutes = function (app) {
    order.config({logger: app.get('logger')});

    //Create order
    app.post(apiHostBase + '/order',order.create);

    //Read order
    app.get(apiHostBase + '/order/:order_id',order.read);

    //Read order by user
    app.get(apiHostBase + '/order/user/:user_id',order.readByUser);

    //Read order by store
    app.get(apiHostBase + '/order/store/:store_id',order.readByUser);

    //Update order
    app.put(apiHostBase + '/order/:order_id', order.update);

    //Delete order
    app.delete(apiHostBase + '/order/:order_id',order.delete);

    //Search orders
    app.get(apiHostBase + '/orders',order.search);
};
