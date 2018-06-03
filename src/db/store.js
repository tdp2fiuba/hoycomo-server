const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const mongoose_delete = require('mongoose-delete');
const foodTypesDB = require('./foodType');
const dbTools = require('../tools/db_tools');

Schema   = mongoose.Schema;	

const storeSchema = new Schema({
    name: { type: String },
    description : { type: String },
    login : { type: String, unique: true },
    password : { type: String},
    business_name : {type: String},
    register_timestamp : { type: Date, default: Date.now },
    last_edit_timestamp : { type: Date, default: Date.now },
    state : { type: Number, default: 1 },
    email : { type: String },
    avatar: {type: String},
    foodTypes: [{type: String}],
    address : {
        name : {type : String},
        lat : {type : Number},
        lon : {type : Number}
    },
    delay_time: {type : Number},
    rating: {type : Number},
    average_price: {type: Number},
    availability: {
        monday: {
          start_time: {type: String},
          end_time: {type: String}
        },
        tuesday: {
          start_time: {type: String},
          end_time: {type: String}
        },
        wednesday: {
          start_time: {type: String},
          end_time: {type: String}
        },
        thursday: {
          start_time: {type: String},
          end_time: {type: String}
        },
        friday: {
          start_time: {type: String},
          end_time: {type: String}
        },
        saturday: {
          start_time: {type: String},
          end_time: {type: String}
        },
        sunday: {
          start_time: {type: String},
          end_time: {type: String}
        }
    },
    discount: {type: Number, default: 0}
});

storeSchema.plugin(AutoIncrement, {inc_field: 'store_id'});
storeSchema.plugin(mongoose_delete, { deletedAt : true, overrideMethods: true });

storeSchema.methods.validPassword = function(candidatePassword) {
    return this.password == candidatePassword;
};

const Store = mongoose.model('Store',storeSchema);

exports.Store = Store;

exports.saveStore = function(store_data) {
    const store = new Store(store_data);
    return new Promise(function(resolve, reject) {
        store.save()
            .then(store => {
                resolve(store);
            })
            .catch(err => {
                reject(err);
            })
    })
};

exports.getStoreById = function(store_id) {
    return new Promise(function(resolve, reject) {
        Store.findOne({store_id : store_id})
            .then(store => {
                resolve(store);
            })
            .catch(err => {
                reject(err);
            })
    })
};


exports.getStores = function(data) {
    return new Promise(function(resolve, reject) {
        Store.aggregate(dbTools.buildFindStoreQuery(data.filters))
            .skip(data.page*data.count)
            .limit(parseInt(data.count))
            .sort({register_timestamp: 'asc'})
            .then(stores => {
                resolve(stores);
            })
            .catch(err => {
                console.log(err);
                reject("Error al realizar la búsqueda.");
            })
    })
};

exports.updateStore = function(store_id,data) {
    return Store.findOneAndUpdate({store_id : store_id},data,{new: true});
};

exports.getStoreUser = function (credentials) {
    return Store.findOne({ login: credentials.login, password: credentials.password });
};

exports.findStoreByLogin = function(login){
    return Store.findOne({ login: login });
};

exports.delete = function(store_id) {
    return new Promise(function(resolve, reject) {
        Store.delete({store_id:store_id},function (err,result) {
            if (!err){
                resolve(true);
                console.log("Borrado logico comercio con id:" + store_id);
            } else {
                console.log(err);
                reject("Error al eliminar el comercio.");
            }
        })
    });
};

exports.forceDelete = function (store_id) {
    return Store.findOneAndRemove({ store_id: store_id});
};

exports.existsWithFoodType = (foodType) => {
    return new Promise((resolve, reject) => {
        Store.find({ foodTypes: {"$in": [foodType.description]}})
            .then((foodType) => {
                if (foodType.length > 0) {
                    reject();
                } else {
                    resolve();
                }
            })
            .catch((err) => {
                reject(err)
            });
    })
}