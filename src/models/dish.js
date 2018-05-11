const dishDB = require('../db/dish.js');

function dishToFront(dish) {
    return {
        id: dish.dish_id,
        store_id: dish.store_id,
        name: dish.name,
        price: dish.price,
        discount: dish.discount || 0,
        description: dish.description,
        pictures: dish.pictures,
        garnishes: dish.garnishes,
        diabetic: dish.diabetic,
        vegan: dish.vegan,
        vegetarian: dish.vegetarian,
        celiac: dish.celiac
    }
}

exports.dishToFront = dishToFront;

exports.createDish = function(dish_data) {
    return new Promise(function(resolve, reject) {
        if (!dish_data.store_id ||
            !dish_data.name ||
            !dish_data.price) {
            reject('Missing fields');
            return;
        }

        //append data

        dishDB.saveDish(dish_data)
            .then(dish => {
                resolve(dish);
            })
            .catch(err => {
                reject(err);
            })
    });
};

exports.updateDish = function(dish_id,dish_data) {
    return new Promise(function(resolve, reject) {
        if (!dish_id || !dish_data) {
            reject('Missing parameters');
            return;
        }

        //TODO: VALIDATE DATA

        return dishDB.updateDish(dish_id,dish_data);
    });
};

exports.updateDishPictures = function (dish,pictures) {
    return dishDB.updatePictures(dish.dish_id,pictures);
};

exports.getDishByID = function(dish_id) {
    return new Promise(function(resolve, reject) {
        if (!dish_id) {
            reject('Missing Store ID');
            return;
        }

        dishDB.getDishById(dish_id)
            .then(dish => {
                resolve(dish);
            })
            .catch(err => {
                reject("Error al buscar el plato.");
            })
    });
};

exports.getDishByIDs = function(dish_ids) {
    if (!dish_ids || dish_ids.length <= 0) {
        return Promise.reject('Missing Store ID');
    }

    return dishDB.getDishByIds(dish_ids);
};

exports.getDishsByStore = function(data) {
    return new Promise(function(resolve, reject) {
        if (data.page === 'undefined' || (data.page < 0) || !data.count || !data.store_id) {
            reject('Missing page or count in search dish');
            return;
        }

        dishDB.getDishByStore(data)
            .then(dish => {
                resolve(dish);
            })
            .catch(err => {

                reject(err);
            })
    });
};


exports.getDishs = function(data) {
    return new Promise(function(resolve, reject) {
        if (data.page === 'undefined' || (data.page < 0) || !data.count) {
            reject('Missing page or count in search dish');
            return;
        }

        dishDB.getDishs(data)
            .then(dish => {
                resolve(dish);
            })
            .catch(err => {

                reject(err);
            })
    });
};

exports.delete = function(id) {
    return new Promise(function(resolve, reject) {
        if (!id) {
            reject('Missing id in delete dish');
            return;
        }

        dishDB.delete(id)
            .then(() => {
                resolve(true);
            })
            .catch(err => {
                console.log(err);
                reject("Error al eliminar el plato.");
            });
    });
};