var storeRoutes = require('./store.js');
var utilsRoutes = require('./utils.js');

exports.assignRoutes = function (app) {
    storeRoutes.assignRoutes(app);

    utilsRoutes.assignRoutes(app);

    //TODO otros objetos!

}