const HttpStatus = require('http-status-codes');
const Order = require('../models/order.js');
const Dish = require('../models/dish.js');
const User = require('../models/user.js');
const Store = require('../models/store.js');
const common = require('../utils/common.js');
const beaber = require('../models/bearerAuthorization.js');
const firebase = require('../models/firebase.js');
const mailing = require('../tools/mailing.js');
let logger;

exports.config = function(config){
    logger = config.logger;
    common.config(config);
};


function _create(req, res, user) {
    const user_id = req.body.user_id;

    //solo el usuario registrado con el mismo id que el del body puede crear un pedido
    if (user.user_id != user_id){
        return common.handleError(res,{message:"Error de autorización"},HttpStatus.UNAUTHORIZED);
    }

    const store_id = req.body.store_id;
    const items = req.body.items;
    const address = req.body.address;

    if (! common.checkDefinedParameters([user_id,items,store_id,address,address.name,address.lat,address.lon],"add order")){
        return common.handleError(res,{code:common.ERROR_PARAMETER_MISSING,message:"Parámetros inválidos o insuficientes"},HttpStatus.BAD_REQUEST);
    }
    const dishes_id = [];
    items.forEach(function (item) {
       if (!item.id) {
           console.log("error al agregar el pedido, falta el dish id en items",item);
           return common.handleError(res,{code:common.ERROR_PARAMETER_MISSING,message:"Parámetros inválidos o insuficientes"},HttpStatus.BAD_REQUEST);
       }
       dishes_id.push(item.id);
       if (!item.quantity || item.quantity < 1){
           item.quantity = 1;
       }
    });

    const data = {
        user_id : user_id,
        store_id : store_id,
        items: items,
        address: address,
        description : req.body.description
    };

    if (req.body.price && req.body.price > 0){
        data.price = req.body.price;
    }

    Store.getStoreByID(store_id)
    .then(store => {
        if (!store) {
            logger.error("Error on add order, store non exist. store_id: " + store_id);
            return common.handleError(res, {
                code: common.ERROR_PARAMETER_MISSING,
                message: "Error al agregar un pedido, no existe el comercio"
            }, HttpStatus.NOT_FOUND);
        }
        data.store = store;
        return Promise.resolve(data);
    })
    .then(data => {
        return Dish.getDishByIDs(dishes_id)
            .then(dishes => {
                if (!dishes || dishes.length < dishes_id.length) {
                    const db_dishes_id = [];
                    dishes.forEach(id => {
                        db_dishes_id.push(id);
                    });

                    const faltantes = dishes_id.filter(id => {
                        db_dishes_id.indexOf(id) < 0
                    });
                    logger.error("Error on add order, dish non exist. dish_id: " + faltantes);
                    return common.handleError(res, {
                        code: common.ERROR_PARAMETER_MISSING,
                        message: "Error al agregar un pedido, no existe el plato con id:" + faltantes
                    }, HttpStatus.NOT_FOUND);
                }
                else {
                    return Promise.resolve(data);
                }
            })
    })
    .then(data => {
        Order.createOrder(data)
        .then(order => {
            logger.info("Order created:" + order);
            //TODO: UPDATE ADDRESS AL USUARIO, si es la primera como la defautl si no en other_address

            //Enviar email al comercio.
            mailing.sendHTMLMail(data.store.email,"Nuevo pedido", "<p>Nuevo pedido:</p>");

            //Enviar notificaciones push desp de 10 seg
            //setTimeout(function () {
            //    firebase.sendNotification(user.firebase_token,"Tu pedido se está preparando!", "");
            //},10000);

            res.status(HttpStatus.CREATED).json(Order.orderToFront(order));
        })
        .catch(err => {
            logger.error("Error on create order " + err);
            return common.handleError(res,{code:common.ERROR_PARAMETER_MISSING,message:"Error al agregar el pedido, " + err},HttpStatus.INTERNAL_SERVER_ERROR);
        })
    })
    .catch(err => {
        logger.error("Error on create order " + err);
        return common.handleError(res,{code:common.ERROR_PARAMETER_MISSING,message:"Error al agregar el pedido, " + err},HttpStatus.INTERNAL_SERVER_ERROR);
    })

}

exports.create = function (req, res) {
    beaber.authorization(req, res, _create);
};

function _read(req, res, user) {
    const id = req.params.order_id;

    if (! common.checkDefinedParameters([id],"read order")){
        return common.handleError(res,{code:common.ERROR_PARAMETER_MISSING,message:"Breach of preconditios (missing parameters)"},HttpStatus.NOT_ACCEPTABLE);
    }

    Order.getOrderById(id)
        .then(order => {
            if (order){
                if (user.user_id && (user.user_id != order.user_id)) {
                    return common.handleError(res,{message:"Error de autorización"},HttpStatus.UNAUTHORIZED);
                } else if (user.store_id && (user.store_id != order.store_id)) {
                    return common.handleError(res,{message:"Error de autorización"},HttpStatus.UNAUTHORIZED);
                }
                res.status(HttpStatus.OK).json(Order.orderToFront(order));
            } else {
                return common.handleError(res,{message:"Order non exists"},HttpStatus.NO_CONTENT);
            }
        })
        .catch(err => {
            return common.handleError(res,{message:"Error on read order"},HttpStatus.INTERNAL_SERVER_ERROR);
        });
}

exports.read = function (req, res) {
    beaber.authorization(req, res, _read);
};

//Por el momento solo actualiza el estado
function update(req,res,user){
    const id = req.params.order_id;
    const state = req.body.state.toUpperCase();

    if (! common.checkDefinedParameters([id],"update order")){
        return common.handleError(res,{code:common.ERROR_PARAMETER_MISSING,message:"Breach of preconditios (missing parameters)"},HttpStatus.NOT_ACCEPTABLE);
    }

    Order.getOrderById(id)
    .then(order => {
        if (order){
            if (user.user_id && (user.user_id != order.user_id)) {
                return common.handleError(res,{message:"Error de autorización"},HttpStatus.UNAUTHORIZED);
            } else if (user.store_id && (user.store_id != order.store_id)){
                return common.handleError(res,{message:"Error de autorización"},HttpStatus.UNAUTHORIZED);
            }

            if (order.state.state === state){
                return common.handleError(res,{message:"Ese estado es el actual"},HttpStatus.NO_CONTENT);
            }

            if (!Order.validateState(state)){
                return common.handleError(res,{message:"Estado inválido"},HttpStatus.NO_CONTENT);
            }

            Order.updateOrderState(id,state)
                .then(order => {
                    User.getUserByID(order.user_id)
                    .then(orderUser => {
                        let title = "";
                        let text = "";
                        switch(state) {
                            case 'PREPARATION':
                                title = "Tu pedido se está preparando!";
                                text = "";
                                break;
                            case 'DISPATCHED':
                                title = "Tu pedido está en camino! 🛵";
                                text = "";
                                break;
                            case 'DELIVERED':
                                title = "Pedido entregado, gracias por confiar en nosotros";
                                text = "";
                                break;
                            case 'CANCELLED':
                                title = "Tu pedido fue cancelado por el comercio";
                                text = "";
                                break;
                        }

                        firebase.sendNotification(orderUser.firebase_token,title,text);
                    });
                    res.status(HttpStatus.OK).json(Order.orderToFront(order));
                })
                .catch(err => {
                    logger.error("Error on update order " + err);
                    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json("Error al actualizar el pedido");
                });

        } else {
            return common.handleError(res,{message:"Order non exists"},HttpStatus.NO_CONTENT);
        }
    })
    .catch(err => {
        console.log(err);
        return common.handleError(res,{message:"Error on read order"},HttpStatus.INTERNAL_SERVER_ERROR);
    });
}

exports.update = function (req, res) {
    beaber.authorization(req, res, update);
};

function _searchByStore(req, res, user){
    //const page = req.query.page || common.DEFAULT_PAGE;
    //const count = req.query.count || common.DEFAULT_SIZE;
    const store_id = req.params.store_id;

    if (user.store_id && (user.store_id != store_id)){
        return common.handleError(res,{message:"Error de autorización"},HttpStatus.UNAUTHORIZED);
    }

    Order.getOrderByStoreId({store_id: store_id})//{page: page,count: count,store_id: store_id})
    .then(orders => {
        res.status(HttpStatus.OK).json(orders.map(Order.orderToFront));
    })
    .catch(err => {
        logger.error("Error on search order " + err);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json("Error al buscar los pedidos para el comercio :" + store_id);
    });
}

exports.searchByStore = function (req, res){
    beaber.authorization(req, res, _searchByStore);
};

function _searchByUser(req, res, user){
    //const page = req.query.page || common.DEFAULT_PAGE;
    //const count = req.query.count || common.DEFAULT_SIZE;
    const user_id = req.params.user_id;

    if (user.user_id && (user.user_id != user_id)){
        return common.handleError(res,{message:"Error de autorización"},HttpStatus.UNAUTHORIZED);
    }

    Order.getOrderByUserId({user_id: user_id})//{page: page,count: count,user_id: user_id})
        .then(orders => {
            res.status(HttpStatus.OK).json(orders.map(Order.orderToFront));
        })
        .catch(err => {
            logger.error("Error on search order " + err);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json("Error al buscar los pedidos para el usuario :" + user_id);
        });
}

exports.searchByUser = function (req, res){
    beaber.authorization(req, res, _searchByUser);
};

exports.search = function (req, res) {
    Order.getOrders()
        .then(orders => {
            res.status(HttpStatus.OK).json(orders);//.map(Order.orderToFront));
        })
        .catch(err => {
            logger.error("Error on search orders " + err);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json("Error al buscar los pedidos");
        });
};