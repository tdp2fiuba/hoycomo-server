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

    app.get('/test/firebase',function(req,res){
        firebase.sendNotification("eYgbf7YD2OQ:APA91bG6eC9fGohU31gC6b_kcuPEk_xR_kjzxt0a83yess0uR4RnEYoosCniZxKyXuvdLoMx0wN9aDFNWU-CIteNR4pv_3PO3KzSzvWxl4tmdbIlUjdMo3hHaWMLvloeXg7BoxF_I1se","TEST","Hola máquinaaa");
        res.status(HttpStatus.OK).json({success:true});
    });

    app.get('/test/firebase/delivered',function(req,res){

    	const token = req.query.token ? req.query.token : "eYgbf7YD2OQ:APA91bG6eC9fGohU31gC6b_kcuPEk_xR_kjzxt0a83yess0uR4RnEYoosCniZxKyXuvdLoMx0wN9aDFNWU-CIteNR4pv_3PO3KzSzvWxl4tmdbIlUjdMo3hHaWMLvloeXg7BoxF_I1se";

    	const data = {
            topic: "DELIVERED",
            storeId: "1",
            orderId: "1"
        };
        firebase.sendNotification(token,"Pedido entregado 🛵","Gracias por confiar en HoyComo!",data);
        res.status(HttpStatus.OK).json({success:true});
	});
};