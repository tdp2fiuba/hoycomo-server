const mongoose = require('mongoose');

Schema = mongoose.Schema;

const foodTypeSchema = new Schema({
    description: { type: String }
});

const FoodTypes = mongoose.model('foodTypes', foodTypeSchema);

exports.FoodTypeSchema = foodTypeSchema;
exports.FoodTypes = FoodTypes;

exports.getFoodTypes = () => {
    return new Promise((resolve, reject) => {
        FoodTypes.find()
            .sort({ description: 'asc' })
            .then((foodTypes) => { 
                resolve(foodTypes) 
            })
            .catch((err) => { 
                reject(err) 
            });
    });
};
