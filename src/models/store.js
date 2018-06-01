const storeDB = require('../db/store.js');
const Review = require('../models/review.js');
const Dish = require('../models/dish.js');
const Order = require('../models/order.js');
const googlemaps = require('../models/googlemaps.js');
const common = require('../utils/common.js');

function storeToFront(store) {
    //mock
    const mockAvailability = {
        monday: {
            start_time: "18:30:00",
            end_time: "00:30:00"
        },
        tuesday: {
            start_time: "18:30:00",
            end_time: "00:30:00"
        },
        wednesday: {
            start_time: "18:30:00",
            end_time: "00:30:00"
        },
        thursday: {
            start_time: "18:30:00",
            end_time: "01:30:00"
        },
        friday: {
            start_time: "18:30:00",
            end_time: "02:00:00"
        },
        saturday: {
            start_time: "18:30:00",
            end_time: "03:00:00"
        },
        sunday: {
            start_time: "18:30:00",
            end_time: "01:30:00"
        }
    };

    return {
        id: store.store_id,
        name: store.name,
        business_name: store.business_name,
        address: store.address,
        email: store.email,
        average_price: store.average_price,
        rating: store.rating,
        food_types: store.foodTypes,
        avatar: store.avatar ? store.avatar : common.apiBaseURL() + '/images' + '/avatar_default.jpg',
        delay_time: store.delay_time,
        availability: store.availability ? store.availability : mockAvailability,
        discount: store.discount
    }


}

exports.storeToFront = storeToFront;

exports.createStore = function(store_data) {
    return new Promise(function(resolve, reject) {
        if (!store_data.name ||
            !store_data.business_name ||
            !store_data.address ||
            !store_data.login ||
            !store_data.password) {
            reject('Missing fields');
            return;
        }
        
        //append data

        storeDB.saveStore(store_data)
            .then(store => {
                resolve(store);
            })
            .catch(err => {
                reject(err);
            })
    });
};

exports.updateStore = function(store_id,store_data) {
    return new Promise(function(resolve, reject) {
        if (!store_id || !store_data) {
            reject('Missing parameters');
            return;
        }

        //TODO: VALIDATE DATA

        storeDB.updateStore(store_id,store_data)
            .then(store => {
                resolve(store);
            })
            .catch(err => {
                reject(err);
            })
    });
};

//get store by ID
exports.getStoreByID = function(store_id) {
  return new Promise(function(resolve, reject) {
        if (!store_id) {
            reject('Missing Store ID');
            return;
        }

        storeDB.getStoreById(store_id)
            .then(store => {
                resolve(store);
            })
            .catch(err => {
                reject("Error al buscar el comercio.");
            })
    });
};

//get list of stores
exports.getStores = function(data) {
  return new Promise(function(resolve, reject) {
      if (data.page === 'undefined' || (data.page < 0) || !data.count) {
            reject('Missing page or count in search store');
            return;
      }
      storeDB.getStores(data)
        .then(stores => {
            resolve(stores);
        })
        .catch(err => {

            reject(err);
        })
    });
};

exports.getStoreByLogin = function(login) {
  return new Promise(function(resolve, reject) {
        if (!login) {
            reject('Missing Store Login');
            return;
        }

        storeDB.Store.find({login: login})
            .then(store => {
                resolve(store);
            })
            .catch(err => {
                reject(err);
            })
    });
};

exports.findSimilarLogin = function(login) {
  return new Promise(function(resolve, reject) {
        if (!login) {
            reject('Missing Store Login');
            return;
        }

        storeDB.Store.find({login: new RegExp(login+'\d*', 'i')})
            .then(store => {
                resolve(store);
            })
            .catch(err => {
                reject(err);
            })
    });
};

exports.deleteById = function (id) {
    return storeDB.delete(id);
};

exports.findStoreByLogin = function(login) {
    return storeDB.findStoreByLogin(login);
};

exports.findStoreByID = function(store_id) {
    return storeDB.getStoreById(store_id);
};

exports.recalculateStoreRating = function (store_id){
    if (!store_id) {
        console.log("Error on recalculate store rating, missing store id");
    }

    storeDB.getStoreById(store_id)
        .then(store => {
            //buscar reviews y calcular el rating
            Review.getReviewByStoreId(store_id,{all:1})
            .then(reviews => {
                if (!reviews || reviews.length <= 0) return;

                let rating_sum = 0;
                reviews.forEach(review => {
                    rating_sum += parseFloat(review.rating);
                });

                store.rating = rating_sum / reviews.length;
                store.save();
            })
        })
        .catch(err => {
            console.log("Error on recalculate store rating, " + err);
        })
};

exports.recalculateStoreAveragePrice = function (store_id){
    if (!store_id) {
        console.log("Error on recalculate average price, missing store id");
    }

    storeDB.getStoreById(store_id)
        .then(store => {
            //buscar dishes y calcular el promedio
            Dish.getDishsByStore({page: 0,count: 1000,store_id: store_id})
                .then(dishes => {
                    if (!dishes || dishes.length <= 0) return;

                    let price_sum = 0;
                    dishes.forEach(dish => {
                        price_sum += parseFloat(dish.price);
                    });

                    store.average_price = price_sum / dishes.length;
                    store.save();
                })
        })
        .catch(err => {
            console.log("Error on recalculate average price " + err);
        })
};

exports.recalculateStoreDelayTime = function (store_id){
    if (!store_id) {
        console.log("Error on recalculate delay time, missing store id");
    }

    storeDB.getStoreById(store_id)
        .then(store => {
            //buscar orders y calcular el promedio
            Order.getOrders({store_id: store_id,'state.state': 'DELIVERED'})
                .then(orders => {
                    if (!orders || orders.length <= 0) return;

                    Promise.all(orders.map(Order.calculateDeliveryTime))
                    .then(delays => {
                        let delay_seconds = delays.reduce(function(sum, delay) {
                            return sum + (delay > 0 ? delay : 0);
                        },0);

                        store.delay_time = delay_seconds / orders.length;
                        store.save();
                    });
                })
        })
        .catch(err => {
            console.log("Error on recalculate average price " + err);
        })
};

exports.deleteAll = function () {
  return storeDB.Store.remove({}).exec();
};
