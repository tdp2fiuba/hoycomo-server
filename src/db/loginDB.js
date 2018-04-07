var mongoose = require('mongoose');
var db_tools = require('../tools/db_tools');
var Store = require('../db/store');

exports.findStore = function(credentials) {
    return new Promise(function (resolve, reject) {
        Store.getStoreUser({ login: credentials.user, password: credentials.password })
             .then(function(store) {
                 resolve(store);
             })
             .catch(function (err) {
                 reject(err);
             });
    });
}
