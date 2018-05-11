const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const mongoose_delete = require('mongoose-delete');

Schema   = mongoose.Schema;

const dishSchema = new Schema({
    store_id: {type: Number},
    name: { type: String },
    price : { type: Number },
    discount : { type: Number },
    description: { type: String },
    pictures: [{ type: String }],
    garnishes: [{ type: String }],
    diabetic: { type: Boolean, default: false },
    vegan: { type: Boolean, default: false },
    vegetarian: { type: Boolean, default: false },
    celiac: { type: Boolean, default: false },
    register_timestamp : { type: Date, default: Date.now },
    last_edit_timestamp : { type: Date, default: Date.now }
});

dishSchema.plugin(AutoIncrement, {inc_field: 'dish_id'});
dishSchema.plugin(mongoose_delete,{ deletedAt : true, overrideMethods: true });

const Dish = mongoose.model('Dish',dishSchema);

exports.Dish = Dish;

exports.saveDish = function(dish_data) {
    const dish = new Dish(dish_data);
    return new Promise(function(resolve, reject) {
        dish.save()
            .then(store => {
                resolve(dish);
            })
            .catch(err => {
                reject(err);
            })
    })
};

exports.updateDish = function(dish_id,dish_data) {
    return Dish.findOneAndUpdate({dish_id : dish_id},dish_data,{new: true});
};

exports.updatePictures = function(dish_id,pictures){
  const data = {pictures: pictures};
  return Dish.findOneAndUpdate({dish_id : dish_id},data,{new: true});
};

exports.getDishById = function(dish_id) {
    return new Promise(function(resolve, reject) {
        Dish.findOne({dish_id : dish_id})
            .then(dish => {
                resolve(dish);
            })
            .catch(err => {
                reject(err);
            })
    })
};

exports.getDishByIds = function(dish_ids) {
    return Dish.find({dish_id : {$in: dish_ids}});
};

/*
exports.getDishByIds = function(dish_ids,cb) {
    Dish.find({dish_id : {$in: dish_ids}},function (err,dishes) {
        if (err){
            cb("Error interno al buscar los platos");
        }
        cb(null,dishes);
    });
};
*/

exports.getDishByStore = function(data) {
    return new Promise(function(resolve, reject) {
        Dish.find({store_id: data.store_id})
            .skip(data.page*data.count)
            .limit(parseInt(data.count))
            .sort({register_timestamp: 'asc'})
            .then(dishes => {
                resolve(dishes);
            })
            .catch(err => {
                console.log(err);
                reject("Error al realizar la búsqueda.");
            })
    })
};

exports.getDishs = function(data) {
    return new Promise(function(resolve, reject) {
        Dish.find()
            .skip(data.page*data.count)
            .limit(parseInt(data.count))
            .sort({register_timestamp: 'asc'})
            .then(dishes => {
                resolve(dishes);
            })
            .catch(err => {
                console.log(err);
                reject("Error al realizar la búsqueda.");
            })
    })
};

exports.delete = function(dish_id) {
    return new Promise(function(resolve, reject) {
        Dish.delete({dish_id:dish_id},function (err,result) {
            if (!err){
                resolve(true);
                console.log("Borrado logico de plato con id:" + dish_id);
            } else {
                console.log(err);
                reject("Error al eliminar el plato.");
            }
        })
    });
};

exports.forceDelete = function (dish_id) {
    return Dish.findOneAndRemove({ dish_id: dish_id});
};