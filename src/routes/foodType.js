const FoodTypes = require('../api/foodType.js');
const config = require('../config/config.json');
const apiHostBase = config.api_host_base;

exports.assignRoutes = (app) => {
    FoodTypes.config({ db: app.get('db') , logger: app.get('logger') });

    // Get all food types
    app.get(apiHostBase + "/foodTypes", FoodTypes.getAll);

    // Add new food type
    app.post(apiHostBase + "/foodTypes", FoodTypes.addFoodType);

    // Deletes one food type
    app.delete(apiHostBase + "/foodTypes", FoodTypes.deleteFoodType);
}