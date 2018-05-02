const loginDB = require('../db/loginDB');
const HttpStatus = require('http-status-codes');
const common = require('../utils/common.js');
const User = require('../models/user.js');
const passport = require('passport');
const bearer = require('../models/bearerAuthorization.js');
let logger;

exports.config = function(config){
    logger = config.logger;
    common.config(config);
};

exports.loginStoreDEPRECATED = function(req, res) {
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
        return common.handleError(res,{message:"Error interno"},HttpStatus.BAD_REQUEST);
    })
};

exports.loginStore = function (req, res, next) {
    passport.authenticate('local', function(err, user, info) {
        if (err) {
            return common.handleError(res,{message:"Error intente nuevamente más tarde."},HttpStatus.INTERNAL_SERVER_ERROR);
        }
        if (!user) {
            return common.handleError(res,{message:info.message},HttpStatus.UNAUTHORIZED);
        }

        res.status(HttpStatus.OK).send({store_id: user.store_id,name: user.name, token: bearer.generateStoreToken(user)});

    })(req, res, next);
};

exports.loginUser = function (req, res, next) {
    passport.authenticate('facebook-token', function(err, user, info) {
        if (err) {
            return common.handleError(res,{message:"Error intente nuevamente más tarde."},HttpStatus.INTERNAL_SERVER_ERROR);
        }
        if (!user) {
            return common.handleError(res,{message:info.message},HttpStatus.UNAUTHORIZED);
        }
        new Promise((resolve, reject) => {
            if (req.body.firebase_id) {
                return User.updateUser({firebase_id: req.body.firebase_id});
            } else {
                resolve(user);
            }
        })
        .then(user => {
            res.status(HttpStatus.OK).send({user: User.userToFront(user), token: bearer.generateUserToken(user)});
        })
        .catch(err => {
            console.log("Err on update firebase id " + err);
            return common.handleError(res,{message:"Error al asignar el id de firebase"},HttpStatus.INTERNAL_SERVER_ERROR);
        });
    })(req, res, next);
};

exports.logout = function(req, res) {
    req.logout();
    res.status(HttpStatus.OK).json({success: true});
}