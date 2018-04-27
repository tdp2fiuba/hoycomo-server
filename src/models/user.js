const userDB = require('../db/user.js');


exports.findUserByID = function(user_id) {
    return userDB.getUserById(user_id);
};