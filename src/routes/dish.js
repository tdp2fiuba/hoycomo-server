const dish = require('../api/dish.js');
const common = require('../utils/common.js');
const apiHostBase = common.getConfigValue('api_host_base');
//const upload = require('../models/file').upload;

exports.assignRoutes = function (app) {
    dish.config({logger: app.get('logger')});

    //Create dish
    app.post(apiHostBase + '/dish',dish.create);

    //Read dish by store
    app.get(apiHostBase + '/dish/store/:store_id',dish.searchByStore);

    //update dish
    app.put(apiHostBase + '/dish/:dish_id',dish.update);

    //disable dish
    app.put(apiHostBase + '/dish/:dish_id/disable',dish.disable);

    //enable dish
    app.put(apiHostBase + '/dish/:dish_id/enable',dish.enable);

    //Delete dish
    app.delete(apiHostBase + '/dish/:dish_id',dish.delete);

    //DEBUG
    //Read all dish
    app.get(apiHostBase + '/dishes', dish.searchAll);

    //active all dishes
    //app.get(apiHostBase + '/dishes/enable', dish.enableAll);

};
