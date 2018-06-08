const HttpStatus = require('http-status-codes');
const Order = require('../models/order.js');
const Store = require('../models/store.js');
const common = require('../utils/common.js');

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