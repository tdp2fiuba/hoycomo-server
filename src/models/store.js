const storeDB = require('../db/store.js');

function storeToFront(store) {
    //mock
    const minMock = Math.floor((Math.random() * 20) + 30);
    const maxMock = minMock + Math.floor((Math.random() * 40) + 1);
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
        //mock
        food_types: store.foodTypes,
        avatar: store.avatar ? store.avatar : common.apiBaseURL() + '/images' + '/avatar_default.jpg',
        delay_time: {
            min: minMock,
            max: maxMock
        },
        availability: store.availability ? store.availability : mockAvailability
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
      console.log("debug 6");
      if (data.page === 'undefined' || (data.page < 0) || !data.count) {
            reject('Missing page or count in search store');
            return;
      }
      console.log("debug 7");
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

exports.deleteAll = function () {
  return storeDB.Store.remove({}).exec();
};
