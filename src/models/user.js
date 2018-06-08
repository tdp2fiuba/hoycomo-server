const userDB = require('../db/user.js');

function userToFront(user) {

    return {
        user_id: user.user_id,
        first_name: user.first_name,
        last_name: user.last_name,
        address: user.address || null,
        avatar: user.avatar
        //email: user.email,
    }
}

exports.userToFront = userToFront;

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
    if (!user_id || !user_data) {
        return Promise.reject('Missing parameters');
    }
    return userDB.updateUser(user_id,user_data);
};

exports.updateUserAddress = function(user_id,address) {
    if (!user_id || !address || !address.name || !address.lat || !address.lon) {
        return Promise.reject('Missing parameters');
    }
    return userDB.updateUser(user_id,{address: address});
};

exports.deleteById = function (id) {
    return userDB.delete(id);
};