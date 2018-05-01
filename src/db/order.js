const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const mongoose_delete = require('mongoose-delete');

const STATE_TAKEN = 'TAKEN';
const STATE_PREPARATION  = 'PREPARATION ';
const STATE_DISPATCHED = 'DISPATCHED';
const STATE_DELIVERED = 'DELIVERED';
const STATE_CANCELLED = 'CANCELLED';

Schema   = mongoose.Schema;

const orderSchema = new Schema({
    store_id: {type: Number},
    user_id: { type: Number },
    price : { type: Number },
    discount : { type: Number },
    description: { type: String},
    dishes_id: [{ type: String }],
    register_timestamp : { type: Date, default: Date.now },
    state: [ {
        state: {
            type: String,
            enum: [STATE_TAKEN, STATE_PREPARATION, STATE_DISPATCHED, STATE_DELIVERED, STATE_CANCELLED],
            default: STATE_TAKEN
        },
        timestamp: {type: Date, default: Date.now}
    }],
    address: {
        name : {type : String},
        latitude : {type : Number},
        longitude : {type : Number}
    }
});

orderSchema.plugin(AutoIncrement, {inc_field: 'order_id'});
orderSchema.plugin(mongoose_delete,{ deletedAt : true, overrideMethods: true });

const Order = mongoose.model('Order',orderSchema);

exports.Order = Order;

exports.states = [STATE_TAKEN, STATE_PREPARATION, STATE_DISPATCHED, STATE_DELIVERED, STATE_CANCELLED];

exports.saveOrder = function(data) {
    const order = new Order(data);
    return order.save();
};

exports.updateOrder = function(order_id,data) {
    return Order.findOneAndUpdate({order_id : order_id},data,{new: true});
};

exports.updateOrderState = function(order_id,state){
    const data = {state: {
            state: state,
            timestamp: Date.now()
        }};
    return Order.findOneAndUpdate({order_id : order_id},data,{new: true});
};

exports.getOrderById = function(order_id) {
    return Order.findOne({order_id: order_id});
};

exports.getOrderByStore = function(store_id) {
    return Order.find({store_id: store_id})
            .sort({register_timestamp: 'asc'});
};

exports.getOrderByUser = function(user_id) {
    return Order.find({user_id: user_id})
        .sort({register_timestamp: 'asc'});
};

exports.getOrders = function() {
    return Order.find()
            .sort({register_timestamp: 'asc'})
};

exports.delete = function(order_id) {
    return new Promise(function(resolve, reject) {
        Order.delete({order_id:order_id},function (err,result) {
            if (!err){
                resolve(true);
                console.log("Borrado logico de pedido con id:" + dish_id);
            } else {
                console.log(err);
                reject("Error al eliminar el pedido.");
            }
        })
    });
};

exports.forceDelete = function (order_id) {
    return Order.findOneAndRemove({ order_id: order_id});
};