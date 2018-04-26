const config = require('../config/config.json');
const multer = require('multer');
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const common = require('../utils/common.js');


const storage = multer.diskStorage({
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

const upload = multer({ storage: storage });

exports.upload = upload;