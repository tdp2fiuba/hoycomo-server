var store = require('../api/store.js');
var config = require('../config/config.json');
var apiHostBase = config.api_host_base;

exports.assignRoutes = function (app) {
	store.config({db: app.get('db') , logger: app.get('logger')});
	
	//Create store
	app.post(apiHostBase + '/store',store.create);

	//Read store
	app.get(apiHostBase + '/store/:store_id',store.read);
	
	//Update store
	app.put(apiHostBase + '/store/:store_id',store.update);
	
	//Delete store
	app.delete(apiHostBase + '/store/:store_id',store.delete);

	//Search stores
	app.get(apiHostBase + '/stores',store.search);

	//delete all store, CUIDADO
    app.delete(apiHostBase + '/stores',store.deleteAll);
};
