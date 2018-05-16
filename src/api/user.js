const HttpStatus = require('http-status-codes');
const User = require('../models/user.js');
const common = require('../utils/common.js');
const googleMaps = require('../models/googlemaps.js');
const imageDB = require('../db/image.js');
const beaber = require('../models/bearerAuthorization.js');
let logger;

exports.config = function(config){
    logger = config.logger;
    common.config(config);
};

exports.search = function (req, res) {
    const page = req.query.page || common.DEFAULT_PAGE;
    const count = req.query.count || common.DEFAULT_SIZE;

    User.getUsers({page: page,count: count})
        .then(users => {
            res.status(HttpStatus.OK).json(users.map(User.userToFront));
        })
        .catch(err => {
            logger.error("Error on search users " + err);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json("Error al buscar los usuarios");
        });
};

exports.read = function (req, res) {
    const id = req.params.user_id;

    if (! common.checkDefinedParameters([id],"read user")){
        return common.handleError(res,{code:common.ERROR_PARAMETER_MISSING,message:"Breach of preconditios (missing parameters)"},HttpStatus.NOT_ACCEPTABLE);
    }

    User.getUserByID(id)
        .then(user => {
            res.status(HttpStatus.OK).json(User.userToFront(user));
        })
        .catch(err => {
            logger.error("Error on read user " + err);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json("Error al obtener el usuario");
        });
};

function update(req,res,user){
    const id = req.params.user_id;
    const data_update = {};

    if (! common.checkDefinedParameters([id],"update user")){
        return common.handleError(res,{code:common.ERROR_PARAMETER_MISSING,message:"Breach of preconditios (missing parameters)"},HttpStatus.NOT_ACCEPTABLE);
    }

    if (user.user_id !== id) {
        return common.handleError(res,{message:"Error de autorización, no puede editar otro usuario"},HttpStatus.UNAUTHORIZED);
    }

    const fields = ['name','last_name','address'];

    fields.forEach(function (field) {
        if (req.body[field]){
            data_update[field] = req.body[field];
        }
    });

    new Promise(function(resolve, reject) {
        //Avatar
        if (req.body.avatar){
            const file = req.body.avatar;

            imageDB.saveImage(file)
                .then( image => {
                    data_update.avatar = common.apiBaseURL() + common.getConfigValue('api_host_base') + common.getConfigValue('api_image_base') +'/' + image.image_id;
                    resolve(data_update);
                })
                .catch(err => {
                    reject(err);
                });
        } else {
            resolve(data_update);
        }
    })
        .then(data_update => {
            if (data_update.address) {
                googleMaps.processAddress(data_update.address)
                    .then(address => {
                        data_update.address = address;
                        return Promise.resolve(data_update);
                    })
            } else {
                return Promise.resolve(data_update);
            }
        }).then( data_update => {
        User.updateUser(id,data_update)
            .then(user => {
                res.status(HttpStatus.OK).json(User.userToFront(user));
            })
            .catch(err => {
                logger.error("Error on update user " + err);
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).json("Error al actualizar el usuario");
            });
    });
}


exports.update = function (req, res) {
    beaber.authorization(req, res, update);
};

function updateFirebaseToken(req,res,user){
    const token = req.body.firebase_token;

    if (! common.checkDefinedParameters([token],"update user")){
        return common.handleError(res,{code:common.ERROR_PARAMETER_MISSING,message:"Breach of preconditios (missing parameters)"},HttpStatus.NOT_ACCEPTABLE);
    }

    User.updateUser(user.user_id,{firebase_token: token})
    .then(user => {
        res.status(HttpStatus.OK).json();
    })
    .catch(err => {
        console.log("Err on update firebase id " + err);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json("Error al actualizar el usuario");
    });
}

exports.updateFirebaseToken = function (req, res) {
    beaber.authorization(req, res, updateFirebaseToken());
};



function _delete(req, res, user){
    const id = req.params.user_id;

    if (! common.checkDefinedParameters([id],"delete user")){
        return common.handleError(res,{code:common.ERROR_PARAMETER_MISSING,message:"Breach of preconditios (missing parameters)"},HttpStatus.NOT_ACCEPTABLE);
    }

    if (user.user_id !== id) {
        return common.handleError(res,{message:"Error de autorización, no puede eliminar otro usuario"},HttpStatus.UNAUTHORIZED);
    }

    User.deleteById(id)
        .then(() => {
            res.status(HttpStatus.OK).json("Usuario eliminado");
        })
        .catch(err => {
            logger.error("Error on delete user " + err);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json("Error al eliminar el usuario");
        });
}

exports.delete = function (req, res) {
    //beaber.authorization(req, res, _delete);
    const id = req.params.user_id;
    User.deleteById(id)
        .then(() => {
            res.status(HttpStatus.OK).json("Usuario eliminado");
        })
        .catch(err => {
            logger.error("Error on delete user " + err);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json("Error al eliminar el usuario");
        });
};