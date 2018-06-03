const orderDB = require('../db/order.js');
const Dish = require('../models/dish.js');
const Store = require('../models/store.js');
const User = require('../models/user.js');

function lastState(order){
    let lastState;
    order.states.forEach(function (state) {
        if (!lastState || Date(state.timestamp) >= Date(lastState.timestamp)){
            lastState = {state: state.state, timestamp: state.timestamp};
        }
    });

    return lastState;
}

function orderToFront(order) {

    const _order = {
        id: order.order_id,
        price : order.price,
        items: order.items,
        discount : order.discount || 0,
        states : [],
        description: order.description,
        register_timestamp : order.register_timestamp,
        address: order.address
    };

    if (order.states.length <= 0) {
        order.states = { state: 'TAKEN', timestamp: order.register_timestamp};
    }

    let lastState;
    order.states.forEach(function (state) {
        if (!lastState || Date(state.timestamp) >= Date(lastState.timestamp)){
            lastState = {state: state.state, timestamp: state.timestamp};
        }
        _order.states.push({state: state.state, timestamp: state.timestamp});
    });    

    _order.state = lastState;

    const dishes_id = [];
    order.items.forEach(function (item) {
        dishes_id.push(item.id);
    });
    return Dish.getDishByIDs(dishes_id)
    .then( dishes => {
        const _dishes = {};//dishes.map(Dish.dishToFront);
        dishes.forEach(function (dish) {
            _dishes[dish.dish_id] = Dish.dishToFront(dish);
        });

        _order.dishes = _dishes;

        const _items = [];
        order.items.forEach(function (item) {
            let dish = _dishes[item.id];
            let _item = {};
            _item.id = item.id;
            _item.comments = item.comments;
            _item.quantity = item.quantity;
            _item.garnish = item.garnish;
            _item.price = dish.price;
            _item.name = dish.name;
            _items.push(_item);
        });
        _order.items = _items;

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

exports.lastState = lastState;
exports.orderToFront = orderToFront;

exports.createOrder = function(data) {
    if (!data.store_id ||
        !data.user_id ||
        !data.items ||
        data.items.length <= 0 ||
        !data.address ||
        !data.address.name ||
        !data.address.lat ||
        !data.address.lon) {

        return Promise.reject('Missing fields');
    }

    return orderDB.saveOrder(data);
};

exports.updateOrder = function(order_id,data) {
    if (!order_id || !data) {
        return Promise.reject('Missing parameters');
    }

    return orderDB.updateOrder(order_id,data);
};

exports.updateOrderState = function(order_id,state) {
    if (!order_id || !state) {
        return Promise.reject('Missing parameters');
    }

    return orderDB.updateOrderState(order_id,state);
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

exports.getOrderByUserId = function(data) {
    if (!data.user_id) {
        return Promise.reject('Missing User ID');
    }

    return orderDB.getOrderByUser(data.user_id,data);
};

exports.getOrders = function(data) {
    return orderDB.getOrders(data);
};

exports.deleteById = function (id) {
    return orderDB.delete(id);
};


exports.validateState = function (state) {
    return (orderDB.states.indexOf(state.toUpperCase()) > 0);
};