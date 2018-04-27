const loginDB = require('../db/loginDB');
const HttpStatus = require('http-status-codes');
const common = require('../utils/common.js');
let logger;

exports.config = function(config){
    logger = config.logger;
    common.config(config);
};
/*
exports.loginStore = function(req, res) {
    const credentials = {
        user: req.body.user,
        password: req.body.password
    };

    loginDB.findStore(credentials)
    .then(store => {
        if (store){
            res.status(HttpStatus.OK).send(store);
        } else {
            return common.handleError(res,{code:common.ERROR_FIND_DATA_DB,message:"Usuario o contraseña incorrectos "},HttpStatus.BAD_REQUEST);
        }
    })
    .catch( err => {
        return common.handleError(res,{code:common.ERROR_FIND_DATA_DB,message:"Error interno"},HttpStatus.BAD_REQUEST);
    })
};
*/
exports.loginStore = function (req, res) {
    if (req.user && req.user.store_id){
        res.status(HttpStatus.OK).send(req.user);
    } else {
        return common.handleError(res,{code:common.ERROR_FIND_DATA_DB,message:"Usuario o contraseña incorrectos "},HttpStatus.BAD_REQUEST);
    }
};

exports.loginUser = function (req, res) {
    res.status((req.user && req.user.user_id)? HttpStatus.OK : HttpStatus.UNAUTHORIZED).send();
};

exports.logout = function(req, res) {
    req.logout();
    res.status(HttpStatus.OK).json({success: true});
}