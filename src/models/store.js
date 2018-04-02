var mongoose = require('mongoose'),
Schema   = mongoose.Schema;	

var storeSchema = new Schema({
  name: { type: String },
  description : { type: String },
  login : { type: String },
  password : { type: String },
  business_name : {type: String},
  register_timestamp : { type: Date, default: Date.now },
  last_edit_timestamp : { type: Date, default: Date.now },
  email : { type: String },
  address : 
      {
        name : {type : String},
        lat : {type : Number},
        lon : {type : Number}
      },
  menu : [
    dish_id : {type : ObjectId}
  ],
  delay_time: {
    max : {type : Number},
    min : {type : Number}
  }
});

module.exports = mongoose.model('Store',storeSchema);