const orderDB = require('../db/order.js');
const Dish = require('../models/dish.js');
const Store = require('../models/store.js');
const User = require('../models/user.js');

function stateToFront(states) {
    const lastState = states[states.length - 1];

    return {
        name: lastState.state,
        timestamp: lastState.timestamp
    };
}

function orderToFront(order) {
    const _order = {
        price : order.price,
        discount : order.discount,
        description: order.description,
        register_timestamp : order.register_timestamp,
        address: order.address
    };

    return Dish.getDishByIDs(order.dishes_id)
    .then( dishes => {
        _order.dishes = dishes.map(Dish.dishToFront);
        return Promise.resolve(_order);
    })
    .then(_order => {
        return Store.getStoreByID(order.store_id)
            .then(store => {
                _order.store = Store.storeToFront(store);
                return Promise.resolve(_order);
            })
    })
    .then(_order => {
        return User.getUserByID(order.user_id)
        .then(user => {
            _order.user = User.userToFront(user);
            return Promise.resolve(_order);
        })
    })
    .then(_order => {
        return _order;
    })
    .catch(err => {
        console.log("Error on parse order to front object ",err);
        return _order;
    });

}

exports.orderToFront = orderToFront;

exports.createOrder = function(data) {
    if (!data.store_id ||
        !data.user_id ||
        !data.dishes_id ||
        data.dishes_id.length <= 0 ||
        !data.address ||
        !data.address.name ||
        !data.address.latitude ||
        !data.address.longitude) {

        return Promise.reject('Missing fields');
    }

    return orderDB.saveOrder(data);
};

exports.updateStore = function(order_id,data) {
    if (!order_id || !data) {
        return Promise.reject('Missing parameters');
    }
    return orderDB.updateOrder(order_id,data);
};

exports.getOrderById= function(id) {
    if (!id) {
        return Promise.reject('Missing Order ID');
    }

    return orderDB.getOrderById(id);
};

exports.getOrderByStoreId= function(id) {
    if (!id) {
        return Promise.reject('Missing Store ID');
    }

    return orderDB.getOrderByStore(id);
};

exports.getOrders = function() {
    return orderDB.getOrders();
};

exports.deleteById = function (id) {
    return orderDB.delete(id);
};