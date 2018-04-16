const store = require('../api/store.js');
const config = require('../config/config.json');
const upload = require('../models/file').upload;
const apiHostBase = config.api_host_base;

exports.assignRoutes = function (app) {
	store.config({db: app.get('db')});
	
	//Create store
	app.post(apiHostBase + '/store',store.create);

	//Read store
	app.get(apiHostBase + '/store/:store_id',store.read);
	
	//Update store
	app.put(apiHostBase + '/store/:store_id', upload.single('avatar') ,store.update);
	
	//Delete store
	app.delete(apiHostBase + '/store/:store_id',store.delete);

	//Search stores
	app.get(apiHostBase + '/stores',store.search);

	//delete all store, CUIDADO
    app.delete(apiHostBase + '/stores',store.deleteAll);
};
