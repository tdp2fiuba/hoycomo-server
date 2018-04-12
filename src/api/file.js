//Store API methods
const HttpStatus = require('http-status-codes');
const File = require('../models/file.js');
const common = require('../utils/common.js');

exports.findImageByObjectAndId = function (req, res) {
    const object = req.params.object;
    const id = req.params.id;
    const name = req.params.name;

    if (! common.checkDefinedParameters([object,id,name],"get image")){
        return common.handleError(res,{code:common.ERROR_PARAMETER_MISSING,message:"Bad request"},HttpStatus.BAD_REQUEST);
    }

    File.findImageByObjectIdAndName(object,id,name)
    .then(image_path => {
        res.sendFile(image_path);
    })
    .catch(err => {
        res.status(HttpStatus.BAD_REQUEST);
    });
};

//deprecated
exports.findImageByName = function (req, res) {
    const name = req.params.name;

    if (! common.checkDefinedParameters([name],"get image")){
        return common.handleError(res,{code:common.ERROR_PARAMETER_MISSING,message:"Bad request"},HttpStatus.BAD_REQUEST);
    }

    File.findStaticImageByName(name)
    .then(image_path => {
        return res.sendFile(image_path);
    })
    .catch(err => {
        res.status(HttpStatus.BAD_REQUEST);
    });
};