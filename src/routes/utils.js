const apiUtilsBase = '/utils';
const googleMaps = require('../models/googlemaps.js');
const HttpStatus = require('http-status-codes');
const firebase = require('../models/firebase.js');

exports.assignRoutes = function (app) {	
	//validate address
	app.get(apiUtilsBase + '/geocoding',function(req,res){
		var address_name = req.query.address_name;

		googleMaps.processAddress(address_name)
		.then(address => {
			res.status(HttpStatus.OK).json(address);
		})
		.catch(err => {
			res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({error: err});
		})
	});

    app.get(apiUtilsBase + '/test',function(req,res){
        firebase.sendNotification("eYgbf7YD2OQ:APA91bG6eC9fGohU31gC6b_kcuPEk_xR_kjzxt0a83yess0uR4RnEYoosCniZxKyXuvdLoMx0wN9aDFNWU-CIteNR4pv_3PO3KzSzvWxl4tmdbIlUjdMo3hHaWMLvloeXg7BoxF_I1se","TEST","Hola máquinaaa");
    });
};