const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);


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
  delay_time: {
    max : {type : Number},
    min : {type : Number}
  },
  availability: {
      monday: {
          start_time: { type: String },
          end_time: { type: String}
      },
      tuesday: {
          start_time: { type: String },
          end_time: { type: String}
      },
      wednesday: {
          start_time: { type: String },
          end_time: { type: String}
      },
      thursday: {
          start_time: { type: String },
          end_time: { type: String}
      },
      friday: {
          start_time: { type: String },
          end_time: { type: String}
      },
      saturday: {
          start_time: { type: String },
          end_time: { type: String}
      },
      sunday: {
          start_time: { type: String },
          end_time: { type: String}
      }
  },
  suspended: {type: Boolean, default: false}
});

storeSchema.plugin(AutoIncrement, {inc_field: 'store_id'});

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
        Store.find()
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
    return Store.findOneAndUpdate({store_id : store_id},data);
};

exports.getStoreUser = function (credentials) {
    return Store.findOne({ login: credentials.login, password: credentials.password });
};

exports.delete = function (store_id) {
    return Store.findOneAndRemove({ store_id: store_id});
};