var upload = require('../models/file').upload;
var common = require('../utils/common.js');
var apiImageBase = common.getConfigValue('api_image_base');
var file = require('../api/file.js');

exports.assignRoutes = function (app) {

    //test store image
    app.post('/api/upload',upload.single('image'),function (req, res, next) {
         //req.file is the `image` file
        console.log(req.file);
    });

    //get image by object, id and name
    app.get(apiImageBase + '/:object/:object_id/:name',file.findImageByObjectAndId);
};