const HttpStatus = require('http-status-codes');
const Dish = require('../models/dish.js');
const Store = require('../models/store.js');
const common = require('../utils/common.js');
const imageDB = require('../db/image.js');
const beaber = require('../models/bearerAuthorization.js');

let logger;

exports.config = function(config){
    logger = config.logger;
    common.config(config);
};

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
    if (req.body.description) {
        dishData.description = req.body.description;
    }
    if (req.body.garnishes && Array.isArray(req.body.garnishes)) {
        dishData.garnishes = req.body.garnishes;
    }
    dishData.diabetic = req.body.diabetic || false;
    dishData.vegan = req.body.vegan || false;
    dishData.vegetarian = req.body.vegetarian || false;
    dishData.celiac = req.body.celiac || false;

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
            res.status(HttpStatus.CREATED).json(Dish.dishToFront(dish));

            //recalculate average price
            Store.recalculateStoreAveragePrice(store_id);
            Store.recalculateStoreMaxDiscount(store_id);
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
    const all = req.query.all || false;

    Dish.getDishsByStore({page: page,count: count,store_id: store_id,all: all})
        .then(dishes => {
            res.status(HttpStatus.OK).json(dishes.map(Dish.dishToFront));
        })
        .catch(err => {
            logger.error("Error on search dish " + err);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json("Error al buscar los platos");
        });
};

exports.searchAll = function (req, res){
    const page = req.query.page || common.DEFAULT_PAGE;
    const count = req.query.count || common.DEFAULT_SIZE;

    Dish.getDishs({page: page,count: count,all:true})
        .then(dishes => {
            res.status(HttpStatus.OK).json(dishes.map(Dish.dishToFront));
        })
        .catch(err => {
            logger.error("Error on search dish " + err);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json("Error al buscar los platos");
        });
};


function _disable(req, res,user) {
    const id = req.params.dish_id;

    if (! common.checkDefinedParameters([id],"disable dish")){
        return common.handleError(res,{code:common.ERROR_PARAMETER_MISSING,message:"Breach of preconditios (missing parameters)"},HttpStatus.NOT_ACCEPTABLE);
    }

    if (!user.store_id) {
        //TODO: check if dish store id is equal to this.
        return common.handleError(res,{message:"Error de autorización"},HttpStatus.UNAUTHORIZED);
    }

    Dish.updateDish(id,{disable:true})
        .then((dish) => {
            res.status(HttpStatus.OK).json(Dish.dishToFront(dish));

            //recalculate average price
            Store.recalculateStoreAveragePrice(dish.store_id);
            Store.recalculateStoreMaxDiscount(dish.store_id);
        })
        .catch(err => {
            console.log("Error on disable dish " + err);
            return common.handleError(res,{message:"Error al desactivar el plato"},HttpStatus.INTERNAL_SERVER_ERROR);
        });
}

function _enable(req, res, user) {
    const id = req.params.dish_id;

    if (! common.checkDefinedParameters([id],"enable dish")){
        return common.handleError(res,{code:common.ERROR_PARAMETER_MISSING,message:"Breach of preconditios (missing parameters)"},HttpStatus.NOT_ACCEPTABLE);
    }

    if (!user.store_id) {
        //TODO: check if dish store id is equal to this.
        return common.handleError(res,{message:"Error de autorización"},HttpStatus.UNAUTHORIZED);
    }

    Dish.updateDish(id,{disable:false})
        .then((dish) => {
            res.status(HttpStatus.OK).json(Dish.dishToFront(dish));

            //recalculate average price
            Store.recalculateStoreAveragePrice(dish.store_id);
            Store.recalculateStoreMaxDiscount(dish.store_id);
        })
        .catch(err => {
            console.log("Error on enable dish " + err);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json("Error al activar el plato");
        });
}

exports.disable = function(req,res){
    beaber.authorization(req, res, _disable);
};

exports.enable = function(req,res){
    beaber.authorization(req, res, _enable);
};

exports.update = function (req, res) {
    const id = req.params.dish_id;
    const data = req.body.dish;

    if (! common.checkDefinedParameters([id],"update dish")){
        return common.handleError(res,{code:common.ERROR_PARAMETER_MISSING,message:"Breach of preconditios (missing parameters)"},HttpStatus.NOT_ACCEPTABLE);
    }

    Dish.updateDish(id,data)
        .then((dish) => {
            res.status(HttpStatus.OK).json(Dish.dishToFront(dish));

            //recalculate average price
            Store.recalculateStoreAveragePrice(dish.store_id);
            Store.recalculateStoreMaxDiscount(dish.store_id);
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

            //recalculate average price
            Store.recalculateStoreAveragePrice(dish.store_id);
            Store.recalculateStoreMaxDiscount(dish.store_id);
        })
        .catch(err => {
            console.log("Error on delete dish " + err);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json("Error al eliminar el plato");
        });
};

exports.enableAll = function (req, res) {
    Dish.enableAll()
        .then(() => {
            res.status(HttpStatus.OK).json("Platos activados");
        })
        .catch(err => {
            console.log("Error on active dish " + err);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json("Error al activar los platos");
        });
};