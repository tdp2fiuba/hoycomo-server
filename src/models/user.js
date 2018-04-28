const userDB = require('../db/user.js');

exports.findUserByID = function(user_id) {
    return userDB.getUserById(user_id);
};

exports.getUsers = function(data) {
    if (data.page === 'undefined' || (data.page < 0) || !data.count) {
        return Promise.reject('Missing page or count in search store');
    }
    return userDB.getUsers(data);
};

exports.getUserByID = function(user_id) {
    return userDB.getUserById(user_id);
};

exports.updateUser = function(user_id,user_data) {
    return new Promise(function(resolve, reject) {
        if (!user_id || !user_data) {
            reject('Missing parameters');
            return;
        }
        return userDB.updateUser(user_id,user_data);
    });
};

exports.deleteById = function (id) {
    return userDB.delete(id);
};