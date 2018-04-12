var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

var userSchema = new Schema({
  first_name:    { type: String },
  last_name:     { type: Number },
  description : { type: String },
  login : { type: String },
  password : { type: String },
  register_timestamp : { type: Date, default: Date.now },
  last_edit_timestamp : { type: Date, default: Date.now },
  email : { type: String },
  date_of_birth : { type: Date, default: Date.now },
  address : [
      {
        name : {type : String},
        latitude : {type : Number},
        longitude : {type : Number}
      }
  ],
  orders : [ {order_id: {type : mongoose.Schema.Types.ObjectId} }]
});

module.exports = mongoose.model('User', userSchema);
