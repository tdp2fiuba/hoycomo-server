const common = require('../utils/common.js');
const file = require('../api/file.js');

exports.assignRoutes = function (app) {

    //get image by object, id and name
    app.get(common.getConfigValue('api_host_base') + common.getConfigValue('api_image_base') +'/:image_id' ,file.findImageById);
};