const storeRoutes = require('./store.js');
const loginRoutes = require('../routes/login');
const utilsRoutes = require('./utils.js');
const dishRoutes = require('./dish.js');
const fileRoutes = require('./file.js');
const foodTypesRoutes = require('./foodType.js');
const beaber = require('../models/bearerAuthorization.js');

exports.assignRoutes = function (app) {
    //test athorizarion
    //app.get('/api/testAuth', beaber.authorization(req, res, function(req, res, user) {
    //    return res.status(200).json(user);
    //}));

    loginRoutes.assignRoutes(app);

    storeRoutes.assignRoutes(app);

    dishRoutes.assignRoutes(app);

    utilsRoutes.assignRoutes(app);

    fileRoutes.assignRoutes(app);

    foodTypesRoutes.assignRoutes(app);
};