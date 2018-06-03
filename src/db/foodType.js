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

exports.addFoodType = (foodType) => {
    var newFoodType = new FoodTypes(foodType);
    return new Promise((resolve, reject) => {
        newFoodType.save()
            .then((foodType) => resolve(foodType))
            .catch((err) => reject(err));
    });
};

exports.deleteFoodType = (foodType) => {
    return new Promise((resolve, reject) => {
        FoodTypes.deleteOne(foodType)
            .then((foodType) => resolve(foodType))
            .catch((err) => reject(err));
    });
}
