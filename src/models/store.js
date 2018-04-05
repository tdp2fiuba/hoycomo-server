var storeDB = require('../db/store.js');

function storeToFront(store) {
    return {
        id: store._id,
        name: store.name,
        business_name: store.business_name,
        address: store.address,
        menu: store.menu
    }
}

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
            reject('Missing Store ID');
            return;
        }

        storeDB.getStoreById(store_id)
            .then(store => {
                //TODO UPDATE status
                resolve(storeDB.saveStore(store));
            })
            .catch(err => {
                reject(err);
            })
    });
}

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
                reject(err);
            })
    });
}

//get list of stores
exports.getStores = function(data) {
  return new Promise(function(resolve, reject) {
        if (data.page === 'undefined' || (data.page < 0) || !data.count) {
            reject('Missing page or count in search store');
            return;
        }

        storeDB.getStores(data)
            .then(stores => {
                resolve(stores.map(storeToFront));
            })
            .catch(err => {
                reject(err);
            })
    });
}

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
}

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
}

exports.suspendStore = function(storeData) {
  
}