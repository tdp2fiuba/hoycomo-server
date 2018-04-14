const HttpStatus = require('http-status-codes');
const Dish = require('../models/dish.js');
const Store = require('../models/store.js');
const common = require('../utils/common.js');
const fs = require('fs');
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
    const dish = req.body.dish;
    if (!dish){
        return common.handleError(res,{code:common.ERROR_PARAMETER_MISSING,message:"Parámetros inválidos o insuficientes"},HttpStatus.BAD_REQUEST);
    }
    const name = dish.name;
    const price = dish.price;
    const store_id = dish.store_id;

    if (! common.checkDefinedParameters([name,price,store_id],"add dish")){
        return common.handleError(res,{code:common.ERROR_PARAMETER_MISSING,message:"Parámetros inválidos o insuficientes"},HttpStatus.BAD_REQUEST);
    }

    const dishData = {
        name : name,
        price : price,
        store_id: store_id
    };

    if (dish.discount){
        dishData.discount = dish.discount;
    }

    Store.getStoreByID(store_id)
    .then(store => {
        if (!store){
            logger.error("Error on add dish, store non exist. store_id: " + store_id);
            return res.status(HttpStatus.NOT_FOUND).json("Error al agregar un plato, no existe el comercio");
        }
        Dish.createDish(dishData)
            .then(dish => {
                if (req.files){
                    //process images and store url in dish
                    const pictures = [];
                    req.files.forEach(function (file) {
                        // 1. Create correct folder for images if not exists
                        const folder_dir =  common.getConfigValue('uploads').upload_dir + "/dish/" + dish.dish_id;
                        const full_folder_dir = __basedir + '/' + folder_dir;
                        if (!fs.existsSync(full_folder_dir)) {
                            logger.debug("make dir: " + full_folder_dir);
                            fs.mkdirSync(full_folder_dir);
                        }

                        //move images. tmp -> new folder
                        const oldPath = __basedir + '/' + file.path;
                        const newPath = full_folder_dir + '/' + file.filename;
                        fs.renameSync(oldPath, newPath);
                        logger.debug("move file: " + oldPath + "->" + newPath);

                        //create and add url
                        const url = common.apiBaseURL() + '/' + folder_dir + '/' + file.filename;
                        pictures.push(url);
                    });

                    //update dish with pictures array
                    Dish.updateDishPictures(dish,pictures)
                        .then(dish => {
                            logger.info("Dish created:" + dish);
                            res.status(HttpStatus.CREATED).json(dishToFront(dish));
                        })
                        .catch(err => {
                            logger.error("Error on append pictures of dish " + err);
                            //TODO: delete dish?
                            return common.handleError(res,{code:common.ERROR_INSERT_DB,message:"Error agregando las imagenes al plato"},HttpStatus.NOT_ACCEPTABLE);
                        });

                } else {
                    logger.info("Dish created:" + dish);
                    res.status(HttpStatus.CREATED).json(dishToFront(dish));
                }
            })
            .catch(err => {
                logger.error("Error on create dish " + err);
                return common.handleError(res,{code:common.ERROR_INSERT_DB,message:"Error interno al crear el plato "},HttpStatus.NOT_ACCEPTABLE);
            });
    })
    .catch(err => {
        logger.error("Error on add dish store non exist" + err);
        res.status(HttpStatus.NOT_FOUND).json("Error al agregar un plato, no existe el comercio");
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