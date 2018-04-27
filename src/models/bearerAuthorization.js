const jwt = require('jsonwebtoken');
const config = require('../config/config');
const BearerStrategy = require('passport-http-bearer').Strategy;
const User = require('../models/user.js');
const Store = require('../models/store.js');

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
            }
            else if (decoded.store){
                Store.findStoreByID(decoded.id)
                .then(store => {
                    if (store){
                        return cb(null, store);
                    }
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
