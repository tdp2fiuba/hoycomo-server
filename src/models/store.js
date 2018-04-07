var storeDB = require('../db/store.js');

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

        storeDB.updateStore(store_id,data)
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

        storeDB.Store.find({login: new RegExp(login+'\d+', 'i')})
            .then(store => {
                resolve(store);
            })
            .catch(err => {
                reject(err);
            })
    });
};

exports.suspendStore = function(storeData) {
  
};
