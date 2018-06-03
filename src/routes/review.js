const review = require('../api/review.js');
const apiHostBase = require('../config/config.json').api_host_base;

exports.assignRoutes = function (app) {

    review.config({logger: app.get('logger')});

    //get review by store
    app.get(apiHostBase + '/store/:store_id/reviews',review.getByStore);

    //add review
    app.post(apiHostBase + '/store/:store_id/reviews', review.create);
};
