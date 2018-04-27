const mongoose = require('mongoose'),
    Schema   = mongoose.Schema;
const AutoIncrement = require('mongoose-sequence')(mongoose);
const mongoose_delete = require('mongoose-delete');

const userSchema = new Schema({
    first_name:    { type: String },
    last_name:     { type: Number },
    facebook_id:   { type: String },
    register_timestamp : { type: Date, default: Date.now },
    last_edit_timestamp : { type: Date, default: Date.now },
    email : { type: String },
    date_of_birth : { type: Date, default: Date.now },
    avatar: {type: String},
    address: {
        name : {type : String},
        latitude : {type : Number},
        longitude : {type : Number}
    },
    other_address : [
        {
          name : {type : String},
          latitude : {type : Number},
          longitude : {type : Number}
        }
    ],
    orders : [ {order_id: {type : String} }]
});

userSchema.plugin(AutoIncrement, {inc_field: 'user_id'});
userSchema.plugin(mongoose_delete,{ deletedAt : true, overrideMethods: true });

userSchema.methods.validPassword = function(candidatePassword, cb) {
    return this.password == candidatePassword;
    //bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    //    if (err) return cb(err);
    //    cb(null, isMatch);
    //});
};

const User = mongoose.model('User',userSchema);

exports.User = User;

exports.saveUser = function(user_data) {
    const user = new User(user_data);
    return new Promise(function(resolve, reject) {
        user.save()
            .then(user => {
                resolve(user);
            })
            .catch(err => {
                reject(err);
            })
    })
};

exports.updateUser = function(user_id,user_data) {
    user_data.last_edit_timestamp = Date.now;
    return User.findOneAndUpdate({user_id : user_id},user_data,{new: true});
};

exports.updateAvatar = function(user_id,avatar){
    const data = {avatar: avatar, last_edit_timestamp: Date.now};
    return User.findOneAndUpdate({user_id : user_id},data,{new: true});
};

exports.getUserById = function(user_id) {
    return new Promise(function(resolve, reject) {
        User.findOne({user_id : user_id})
            .then(user => {
                resolve(user);
            })
            .catch(err => {
                reject(err);
            })
    })
};

exports.delete = function(user_id) {
    return new Promise(function(resolve, reject) {
        User.delete({user_id:user_id},function (err,result) {
            if (!err){
                resolve(true);
                console.log("Borrado logico de usuario con id:" + user_id);
            } else {
                console.log(err);
                reject("Error al eliminar el usuario.");
            }
        })
    });
};

exports.forceDelete = function (user_id) {
    return User.findOneAndRemove({ user_id: user_id});
};