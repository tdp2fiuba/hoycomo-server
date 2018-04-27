const storeRoutes = require('./store.js');
const loginRoutes = require('../routes/login');
const utilsRoutes = require('./utils.js');
const dishRoutes = require('./dish.js');
const fileRoutes = require('./file.js');
const foodTypesRoutes = require('./foodType.js');

exports.assignRoutes = function (app) {
    loginRoutes.assignRoutes(app);

    storeRoutes.assignRoutes(app);

    dishRoutes.assignRoutes(app);

    utilsRoutes.assignRoutes(app);

    fileRoutes.assignRoutes(app);

    foodTypesRoutes.assignRoutes(app);
};