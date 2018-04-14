const config = require('../config/config.json');
const multer = require('multer');
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const common = require('../utils/common.js');


var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, config.uploads.temp_upload_dir)
    },
    filename: function (req, file, cb) {
        crypto.pseudoRandomBytes(16, function(err, raw) {
            if (err) return callback(err);

            cb(null, raw.toString('hex') + path.extname(file.originalname));
        });
    }
});

var upload = multer({ storage: storage });

exports.upload = upload;

function findFileByPath(path) {
    return new Promise(function(resolve, reject) {
        if (fs.existsSync(path)){
            resolve(path);
        }
        reject(path +" does not exist");
    });
}

//deprecated
exports.findStaticImageByName = function (name) {
    const image_path = 'assets/images/' + name;
    return findFileByPath(image_path);
};

exports.findImageByObjectIdAndName = function (object,id,name) {
    const image_path = common.getConfigValue(uploads).upload_dir + '/' + object + '/' + id + '/' + name;
    return findFileByPath(image_path);
};