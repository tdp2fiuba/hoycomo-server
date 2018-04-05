const apiUtilsBase = '/utils';
var googleMaps = require('../models/googlemaps.js');
var HttpStatus = require('http-status-codes');

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
}