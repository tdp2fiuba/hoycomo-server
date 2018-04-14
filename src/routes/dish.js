const dish = require('../api/dish.js');
const common = require('../utils/common.js');
const apiHostBase = common.getConfigValue('api_host_base');
const upload = require('../models/file').upload;

exports.assignRoutes = function (app) {
    dish.config({logger: app.get('logger')});

    //Create dish
    app.post(apiHostBase + '/dish', upload.array('pictures'),dish.create);

    //Read dish by store
    app.get(apiHostBase + '/dish/store/:store_id',dish.searchByStore);

    //update dish
    app.put(apiHostBase + '/dish/:dish_id',dish.update);

    //Delete dish
    app.delete(apiHostBase + '/dish/:dish_id',dish.delete);

    //Read all dish, for debug
    app.get(apiHostBase + '/dishes', dish.searchAll);

};
