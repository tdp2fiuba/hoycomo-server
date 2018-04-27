var foodTypeDB = require('../db/foodType.js');

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