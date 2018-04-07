var db_tools = require('../tools/db_tools.js');
var mongoose = require('mongoose');

// database connect
var db = db_tools.DBConnectMongoose();

Schema   = mongoose.Schema;	

var storeSchema = new Schema({
  name: { type: String },
  description : { type: String },
  login : { type: String },
  password : { type: String},
  business_name : {type: String},
  register_timestamp : { type: Date, default: Date.now },
  last_edit_timestamp : { type: Date, default: Date.now },
  email : { type: String },
  address : {
        name : {type : String},
        lat : {type : Number},
        lon : {type : Number}
  },
  menu: [ 
    {dish_id: {type: mongoose.Schema.Types.ObjectId}}
  ],
  delay_time: {
    max : {type : Number},
    min : {type : Number}
  },
  suspended: {type: Boolean, default: false}
});

var Store = mongoose.model('Store',storeSchema);

exports.Store = Store;

exports.saveStore = function(store_data) {
    var store = new Store(store_data);
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
        Store.findOne({_id : store_id})
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
        Store.find()//{sort: {register_timestamp: 'asc'}, skip: data.page*data.count, limit: data.count})
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
    return new Promise(function(resolve, reject) {
        Store.findOneAndUpdate({_id : store_id},data)
            .then(store => {
                resolve(store);
            })
            .catch(err => {
                reject(err);
            })
    })
};

exports.getStoreUser = function (credentials) {
    return Store.findOne({ login: credentials.login, password: credentials.password });
};