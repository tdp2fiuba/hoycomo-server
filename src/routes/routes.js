const storeRoutes = require('./store.js');
const loginRoutes = require('../routes/login');
const utilsRoutes = require('./utils.js');
const dishRoutes = require('./dish.js');
const fileRoutes = require('./file.js');
const foodTypesRoutes = require('./foodType.js');
const passport = require('passport');

exports.assignRoutes = function (app) {
    //test athorizarion
    app.get('/api/testAuth', function(req, res, next) {
        passport.authenticate('bearer', function(err, user, info) {
            if (err) return res.status(500).json({ status: 'error', code: 'internal server error' });
            if (user) {
                req.user = user;
                return res.status(200).json(req.user);
            } else {
                return res.status(401).json({ status: 'error', code: 'unauthorized' });
            }
        })(req, res, next);
    });

    loginRoutes.assignRoutes(app);

    storeRoutes.assignRoutes(app);

    dishRoutes.assignRoutes(app);

    utilsRoutes.assignRoutes(app);

    fileRoutes.assignRoutes(app);

    foodTypesRoutes.assignRoutes(app);
};