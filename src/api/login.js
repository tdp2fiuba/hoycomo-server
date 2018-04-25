var loginDB = require('../db/loginDB');

exports.login = function (credentials) {
    return new Promise(function (resolve, reject) {
        loginDB.findStore(credentials)
               .then(function (store) {
                   resolve(store);
               })
               .catch(function (err) {
                   reject(err);
               })
    });
}