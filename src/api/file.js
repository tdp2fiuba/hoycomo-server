//Store API methods
const HttpStatus = require('http-status-codes');
const ImageDB = require('../db/image.js');
const common = require('../utils/common.js');

exports.findImageById = function (req, res) {
    const image_id = req.params.image_id;
    if (! common.checkDefinedParameters([image_id],"get image")){
        return common.handleError(res,{code:common.ERROR_PARAMETER_MISSING,message:"Bad request"},HttpStatus.BAD_REQUEST);
    }

    ImageDB.getImageById(image_id)
        .then(image => {
            res.writeHead(HttpStatus.OK, {
                'Content-Type': image.contentType,
                'Content-Length': image.data.length
            });
            res.end(image.data);
        })
        .catch(err => {
            console.log("Error al ler la imagen ", err);
            res.status(HttpStatus.BAD_REQUEST);
        });
};