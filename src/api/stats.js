const HttpStatus = require('http-status-codes');
const Order = require('../models/order.js');
const Store = require('../models/store.js');
const common = require('../utils/common.js');
const beaber = require('../models/bearerAuthorization.js');

exports.getBilling = function (req, res) {

    const start_date = req.query.start_date;
    const end_date = req.query.end_date;

    const data_find = {'state.state': 'DELIVERED'};
    if ( start_date && end_date){
        const start = new Date(start_date);
        const end = new Date(end_date);
        if (start instanceof Date && !isNaN(start) && end instanceof Date && !isNaN(end)){
            data_find["register_timestamp"] = {"$gte": start, "$lt": end};
        } else {
            return common.handleError(res,{message:"Error en las fechas especificadas"},HttpStatus.NOT_FOUND);
        }
    }

    Store.getStores({all:1})
    .then(stores=> {

        Order.getOrders(data_find)
            .then(orders => {
                const billings = {};
                orders.forEach(function (order) {
                    const billing = order.price - (order.discount ? order.price*(order.discount/100) : 0);
                    billings[order.store_id] = (billings[order.store_id] || 0) + billing;
                });
                const states = [];
                stores.forEach(function (store) {
                    states.push({store:store.name, billing: billings[store.store_id] || 0});
                });

                res.status(HttpStatus.OK).json(states);
            })
            .catch(err => {
                console.log(err);
                return common.handleError(res,{message:"Error on load states"},HttpStatus.INTERNAL_SERVER_ERROR);
            });
    });
};

exports.getFee = function (req, res) {

    const start_date = req.query.start_date;
    const end_date = req.query.end_date;

    const data_find = {'state.state': 'DELIVERED'};
    if ( start_date && end_date){
        const start = new Date(start_date);
        const end = new Date(end_date);
        if (start instanceof Date && !isNaN(start) && end instanceof Date && !isNaN(end)){
            data_find["register_timestamp"] = {"$gte": start, "$lt": end};
        } else {
            return common.handleError(res,{message:"Error en las fechas especificadas"},HttpStatus.NOT_FOUND);
        }
    }

    Store.getStores({all:1})
        .then(stores=> {

            Order.getOrders(data_find)
                .then(orders => {
                    const fee = {};
                    const fee_percent = 0.01;
                    orders.forEach(function (order) {
                        const price = order.price - (order.discount ? order.price*(order.discount/100) : 0);
                        fee[order.store_id] = (fee[order.store_id] || 0) + price*fee_percent;
                    });
                    const states = [];
                    stores.forEach(function (store) {
                        states.push({store:store.name, fee: fee[store.store_id] || 0});
                    });

                    res.status(HttpStatus.OK).json(states);
                })
                .catch(err => {
                    console.log(err);
                    return common.handleError(res,{message:"Error on load states"},HttpStatus.INTERNAL_SERVER_ERROR);
                });
        });
};

function getOrdersPerDay(req, res, user) {
    const start_date = req.query.start_date;
    const end_date = req.query.end_date;
    const store_id = user.store_id;
    const start = new Date(start_date);
    const end = new Date(end_date);

    const data_find = {'state.state': 'DELIVERED','store_id': store_id};
    if ( start_date && end_date){
        if (start instanceof Date && !isNaN(start) && end instanceof Date && !isNaN(end)){
            data_find["register_timestamp"] = {"$gte": start, "$lt": end};
        } else {
            return common.handleError(res,{message:"Error en las fechas especificadas"},HttpStatus.NOT_FOUND);
        }
    }else {
        return common.handleError(res,{message:"Error en las fechas especificadas"},HttpStatus.NOT_FOUND);
    }

    Order.getOrders(data_find)
    .then(orders => {
        const ordersPerDay = {};
        orders.forEach(function (order) {
            const orderDate = new Date(order.state.timestamp).toLocaleDateString();//common.getDayAndMonth(new Date(order.state.timestamp));
            ordersPerDay[orderDate] = (ordersPerDay[orderDate] || 0) + 1;
        });
        let _date = new Date(start.getFullYear(),start.getMonth(),start.getDate());
        const _end = new Date(end.getFullYear(),end.getMonth(),end.getDate()).getTime();
        const days = [];
        while (_date.getTime() <= _end){

            days.push({day:_date.toLocaleDateString('es-ar'),orders: (ordersPerDay[_date.toLocaleDateString()] || 0)});

            _date.setDate(_date.getDate() + 1);
        }

        res.status(HttpStatus.OK).json(days);
    })
    .catch(err => {
        console.log(err);
        return common.handleError(res,{message:"Error, intente nuevamente mas tarde"},HttpStatus.INTERNAL_SERVER_ERROR);
    });
}

exports.getOrders = function (req,res) {
    beaber.authorization(req, res, getOrdersPerDay);
};

function getLeadTimePerDay(req, res, user) {
    const start_date = req.query.start_date;
    const end_date = req.query.end_date;
    const store_id = user.store_id;
    const start = new Date(start_date);
    const end = new Date(end_date);

    const data_find = {'state.state': 'DELIVERED','store_id': store_id};
    if ( start_date && end_date){
        if (start instanceof Date && !isNaN(start) && end instanceof Date && !isNaN(end)){
            data_find["register_timestamp"] = {"$gte": start, "$lt": end};
        } else {
            return common.handleError(res,{message:"Error en las fechas especificadas"},HttpStatus.NOT_FOUND);
        }
    }else {
        return common.handleError(res,{message:"Error en las fechas especificadas"},HttpStatus.NOT_FOUND);
    }

    Order.getOrders(data_find)
        .then(orders => {
            const leadTimePerDay = {};
            const accSecondsPerDay = {};
            const evalOrdersPerDay = {};
            const usedOrderDates = [];
            orders.forEach(function (order) {
                const orderDate = new Date(order.state.timestamp).toLocaleDateString();//common.getDayAndMonth(new Date(order.state.timestamp));
                usedOrderDates.push(orderDate);
                evalOrdersPerDay[orderDate] = (evalOrdersPerDay[orderDate] || 0) + 1;
                const orderLeadSeconds = Order.calculateDeliveryTime(order);
                accSecondsPerDay[orderDate] = (accSecondsPerDay[orderDate] || 0) + orderLeadSeconds;
            });
            usedOrderDates.forEach(orderDate =>
                leadTimePerDay[orderDate] = accSecondsPerDay[orderDate] / evalOrdersPerDay[orderDate]
            );

            let _date = new Date(start.getFullYear(),start.getMonth(),start.getDate());
            const _end = new Date(end.getFullYear(),end.getMonth(),end.getDate()).getTime();
            const days = [];
            while (_date.getTime() <= _end){

                days.push({day:_date.toLocaleDateString('es-ar'), lead_time: (leadTimePerDay[_date.toLocaleDateString()] || 0)});

                _date.setDate(_date.getDate() + 1);
            }

            res.status(HttpStatus.OK).json(days);
        })
        .catch(err => {
            console.log(err);
            return common.handleError(res,{message:"Error, intente nuevamente mas tarde"},HttpStatus.INTERNAL_SERVER_ERROR);
        });
}

exports.getLeadTime = function (req,res) {
    beaber.authorization(req, res, getLeadTimePerDay);
};