const HttpStatus = require('http-status-codes');
const Dish = require('../models/dish.js');
const Store = require('../models/store.js');
const common = require('../utils/common.js');
const imageDB = require('../db/image.js');
let logger;

exports.config = function(config){
    logger = config.logger;
    common.config(config);
};

function dishToFront(dish) {
    //mock
    return {
        id: dish.dish_id,
        store_id: dish.store_id,
        name: dish.name,
        price: dish.price,
        discount: dish.discount || 0,
        pictures: dish.pictures
    }
}

exports.create = function (req, res) {
    const name = req.body.name;
    const price = req.body.price;
    const store_id = req.body.store_id;

    if (! common.checkDefinedParameters([name,price,store_id],"add dish")){
        return common.handleError(res,{code:common.ERROR_PARAMETER_MISSING,message:"Parámetros inválidos o insuficientes"},HttpStatus.BAD_REQUEST);
    }

    const dishData = {
        name : name,
        price : price,
        store_id: store_id
    };

    if (req.body.discount){
        dishData.discount = req.body.discount;
    }

    Store.getStoreByID(store_id)
    .then(store => {
        if (!store) {
            logger.error("Error on add dish, store non exist. store_id: " + store_id);
            return common.handleError(res,{code:common.ERROR_PARAMETER_MISSING,message:"Error al agregar un plato, no existe el comercio"},HttpStatus.NOT_FOUND);
        }

        const files = req.body.pictures;
        if (files && (files.length > 0)) {
            const pictures = [];

            files.forEach(function (file) {
                if (!file.data || !file.type) {
                    throw "Imágenes mal definidas";
                }
                pictures.push(file);
            });
            return imageDB.saveImages(pictures)
                .then(images => {
                    const images_dish = [];
                    images.forEach(function (img) {
                        images_dish.push(common.apiBaseURL() + common.getConfigValue('api_host_base') + common.getConfigValue('api_image_base') + '/' + img.image_id);
                    });

                    dishData.pictures = images_dish;
                    return Promise.resolve(dishData);
                })
                .catch(err => {
                    logger.error("Error al agregar las imágenes " + err);
                    return Promise.reject("Imágenes mal definidas.");
                });
        } else {
            return Promise.resolve(dishData);
        }
    })
    .then(dishData => {
        Dish.createDish(dishData)
        .then(dish => {
            logger.info("Dish created:" + dish);
            res.status(HttpStatus.CREATED).json(dishToFront(dish));
        })
        .catch(err => {
            logger.error("Error on create dish " + err);
            return common.handleError(res,{code:common.ERROR_INSERT_DB,message:"Error interno al crear el plato "},HttpStatus.NOT_ACCEPTABLE);
        });
    })
    .catch(err => {
        logger.error("Error " + err);
        return common.handleError(res,{code:common.ERROR_PARAMETER_MISSING,message:"Error al agregar el plato, " + err},HttpStatus.NOT_FOUND);
    });

};

exports.searchByStore = function (req, res){
    const page = req.query.page || common.DEFAULT_PAGE;
    const count = req.query.count || common.DEFAULT_SIZE;
    const store_id = req.params.store_id;

    Dish.getDishsByStore({page: page,count: count,store_id: store_id})
        .then(dishes => {
            res.status(HttpStatus.OK).json(dishes.map(dishToFront));
        })
        .catch(err => {
            logger.error("Error on search dish " + err);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json("Error al buscar los platos");
        });
};

exports.searchAll = function (req, res){
    const page = req.query.page || common.DEFAULT_PAGE;
    const count = req.query.count || common.DEFAULT_SIZE;

    Dish.getDishs({page: page,count: count})
        .then(dishes => {
            res.status(HttpStatus.OK).json(dishes.map(dishToFront));
        })
        .catch(err => {
            logger.error("Error on search dish " + err);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json("Error al buscar los platos");
        });
};

exports.update = function (req, res) {
    const id = req.params.dish_id;
    const data = req.body.dish;

    if (! common.checkDefinedParameters([id],"update dish")){
        return common.handleError(res,{code:common.ERROR_PARAMETER_MISSING,message:"Breach of preconditios (missing parameters)"},HttpStatus.NOT_ACCEPTABLE);
    }

    Dish.updateDish(id,data)
        .then((dish) => {
            res.status(HttpStatus.OK).json(dishToFront(dish));
        })
        .catch(err => {
            logger.error("Error on update dish " + err);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json("Error al actualizar el plato");
        });
};


exports.delete = function (req, res) {
    const id = req.params.dish_id;

    if (! common.checkDefinedParameters([id],"delete dish")){
        return common.handleError(res,{code:common.ERROR_PARAMETER_MISSING,message:"Breach of preconditios (missing parameters)"},HttpStatus.NOT_ACCEPTABLE);
    }

    Dish.delete(id)
        .then(() => {
            res.status(HttpStatus.OK).json("Plato eliminado");
        })
        .catch(err => {
            logger.error("Error on delete dish " + err);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json("Error al eliminar el plato");
        });
};