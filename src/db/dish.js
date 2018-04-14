const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);


Schema   = mongoose.Schema;

const storeDish = new Schema({
    store_id: {type: Number},
    name: { type: String },
    price : { type: Number },
    discount : { type: Number },
    pictures: [{ type: String }],
    register_timestamp : { type: Date, default: Date.now },
    last_edit_timestamp : { type: Date, default: Date.now }
});

storeDish.plugin(AutoIncrement, {inc_field: 'dish_id'});

var Dish = mongoose.model('Dish',storeDish);

exports.Dish = Dish;

exports.saveDish = function(dish_data) {
    var dish = new Dish(dish_data);
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
    return Dish.findOneAndUpdate({dish_id : dish_id},dish_data);
};

exports.updatePictures = function(dish_id,pictures){
  const data = {pictures: pictures};
  return Dish.findOneAndUpdate({dish_id : dish_id},data);
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

exports.delete = function(id) {
    return new Promise(function(resolve, reject) {
        Dish.findOneAndRemove({dish_id:id})
            .then(() => {
                resolve(true);
            })
            .catch(err => {
                console.log(err);
                reject("Error al eliminar el plato.");
            });
    })
};