## MongoDB Schemas

### User
- key:
	`user_id : string`
- value:
```
{
    first_name:    { type: String },
    last_name:     { type: String },
    facebook_id:   { type: String },
    firebase_token:   { type: String },
    register_timestamp : { type: Date, default: Date.now },
    last_edit_timestamp : { type: Date, default: Date.now },
    email : { type: String },
    date_of_birth : { type: String },
    avatar: {type: String},
    address: {
        name : {type : String},
        lat : {type : Number},
        lon : {type : Number}
    },
    other_address : [
        {
          name : {type : String},
          lat : {type : Number},
          lon : {type : Number}
        }
    ],
    orders : [ {order_id: {type : String} }]
}
```

## Store

- key:
	`store_id : string`
- value:
```
{
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
  }
}
```

## Dish

- key:
	`dish_id : string`
- value:
```
{
    store_id: {type: Number},
    name: { type: String },
    price : { type: Number },
    discount : { type: Number },
    description : { type: String },
    pictures : [{ type: String }],
    garnishes : [{ type: String }],
    diabetic : { type: Boolean },
    vegan : { type: Boolean },
    vegetarian : { type: Boolean },
    celiac : { type: Boolean },
    register_timestamp : { type: Date, default: Date.now },
    last_edit_timestamp : { type: Date, default: Date.now }
}
```

## Order

- key:
	`order_id : string`
- value:
```
```
{
    store_id: {type: Number},
    user_id: { type: Number },
    price : { type: Number },
    discount : { type: Number },
    description: { type: String},
    dishes_id: [{ type: String }],
    register_timestamp : { type: Date, default: Date.now },
    state: [ {
        state: {
            type: String,
            enum: [STATE_TAKEN, STATE_PREPARATION, STATE_DISPATCHED, STATE_DELIVERED, STATE_CANCELLED],
            default: STATE_TAKEN
        },
        timestamp: {type: Date, default: Date.now}
    }],
    address: {
        name : {type : String},
        lat : {type : Number},
        lon : {type : Number}
    }
}
```
