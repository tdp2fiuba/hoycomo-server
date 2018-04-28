const jwt = require('jsonwebtoken');
const config = require('../config/config');
const BearerStrategy = require('passport-http-bearer').Strategy;
const User = require('../models/user.js');
const Store = require('../models/store.js');
const common = require('../utils/common.js');
const HttpStatus = require('http-status-codes');
const passport = require('passport');

exports.configPassport = function(passport) {
    passport.use(new BearerStrategy(function (token, cb) {
        jwt.verify(token, config.token_secret_key, function(err, decoded) {
            if (err) return cb(err);

            if (decoded.user){
                User.findUserByID(decoded.id)
                .then(user => {
                    if (user){
                        return cb(null, user);
                    }
                })
                .catch( err => {
                    return cb(err);
                })
            }
            else if (decoded.store){
                Store.findStoreByID(decoded.id)
                .then(store => {
                    if (store){
                        return cb(null, store);
                    }
                })
                .catch( err => {
                    return cb(err);
                })
            } else {
                return cb(null, false);
            }
        });
    }));
};

function generateToken(object) {
    return jwt.sign(object, config.token_secret_key, { expiresIn: '30 days' });
}

exports.generateUserToken= function(user) {
    const object = {id: user.user_id,user:true};
    return generateToken(object);
};

exports.generateStoreToken= function(store) {
    const object = {id: store.store_id, user:false, store:true};
    return generateToken(object);
};


//recibe el request, el response y next: la función a la cual llama cunando fué autorizado el usuario.
//next recibe (req,res,user)
exports.authorization = function(req, res, next) {
    passport.authenticate('bearer', function (err, user, info) {
        if (err) {
            return common.handleError(res,{message:"Error, intente nuevamente más tarde"},HttpStatus.INTERNAL_SERVER_ERROR);
        }
        if (user) {
            req.user = user;
            return next(req,res,req.user);
        } else {
            return common.handleError(res,{message:"Error de autorización"},HttpStatus.UNAUTHORIZED);
        }
    })(req, res, next)
};