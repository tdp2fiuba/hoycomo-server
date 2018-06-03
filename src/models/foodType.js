var foodTypeDB = require('../db/foodType.js');
var storeDB = require('../db/store.js');

exports.getFoodTypes = () => {
    return new Promise((resolve, reject) => {
        foodTypeDB.getFoodTypes()
            .then((foodTypes) => { 
                resolve(foodTypes) 
            })
            .catch((err) => { 
                reject(err)
            })
    })
}

exports.addFoodType = (foodType) => {
    return new Promise((resolve, reject) => {
        foodTypeDB.addFoodType(foodType)
            .then((foodType) => { 
                resolve(foodType) 
            })
            .catch((err) => { 
                reject(err)
            })
    })
}

exports.deleteFoodType = (foodType) => {
    return new Promise((resolve, reject) => {
        storeDB.existsWithFoodType(foodType)
            .then(() => {
                foodTypeDB.deleteFoodType(foodType)
                    .then((foodType) => { 
                        resolve(foodType) 
                    })
                    .catch((err) => { 
                        reject(err)
                    })
            })
            .catch((err) => {
                reject({ message: "Hay comercios que utilizan este tipo de comida" })
            });
    })
}