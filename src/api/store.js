//Store API methods
var HttpStatus = require('http-status-codes');
var Store = require('../models/store.js');
var common = require('../utils/common.js');
var googleMaps = require('../models/googlemaps.js');
var logger;

exports.config = function(config){
	logger = config.logger;
	common.config(config);
};

function storeToFront(store) {
    return {
        id: store._id,
        name: store.name,
        business_name: store.business_name,
        address: store.address,
        menu: store.menu
    }
}

exports.create = function (req, res) {
	var store = req.body.store;
	var name = store.name;
	var business_name = store.business_name;
	var address_name = store.address;

	if (! common.checkDefinedParameters([name,business_name,address_name],"add store")){
		return common.handleError(res,{code:common.ERROR_PARAMETER_MISSING,message:"Breach of preconditios (missing parameters)"},HttpStatus.BAD_REQUEST);
	}

	//TODO find if exist store in db
	/*
	Store.find({name: name},function(err, _store) {
		if(err) return common.handleError(res,{code:common.ERROR_INSERT_DB,message:"Error on find store to verify already exist"},HttpStatus.NOT_FOUND);
      	if (_store) {
      		logger.error('Error on add new store, already exist -> name: '+ name);
			return common.handleError(res,{code:common.ERROR_INSERT_DB,message:"Store already exist."},HttpStatus.CONFLICT);
      	}
	});
	*/

	var storeData = {
		name : name,
		business_name : business_name
	};

	//process address
	googleMaps.processAddress(address_name)
	.then(address => {
		storeData.address = address;
		common.generateLogin(name)
		.then(login_data => {
			storeData.login = login_data.login;
			storeData.password = login_data.password;
			return storeData;
		})
		.then(store_data => {
			Store.createStore(store_data)
			.then(store => {
				res.status(HttpStatus.CREATED).json({user:store.login, password: store.password});
			})
			.catch(err => {
				return common.handleError(res,{code:common.ERROR_INSERT_DB,message:"Cannot create store: " + err},HttpStatus.NOT_ACCEPTABLE);
			});
		});
	
	})
	.catch(err => {
		return common.handleError(res,{code:common.ERROR_INSERT_DB,message:"Error on validate address."},HttpStatus.NOT_ACCEPTABLE);
	})
};

exports.search = function (req, res) {
	var page = req.query.page || common.DEFAULT_PAGE;
	var count = req.query.count || common.DEFAULT_SIZE;
	
 	Store.getStores({page: page,count: count})
        .then(stores => {
            res.status(HttpStatus.OK).json(stores.map(storeToFront));
        })
        .catch(err => {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(err);
	});	
};

exports.read = function (req, res) {
	var id = req.params.store_id;
	
	if (! common.checkDefinedParameters([id],"read store")){
		return common.handleError(res,{code:common.ERROR_PARAMETER_MISSING,message:"Breach of preconditios (missing parameters)"},HttpStatus.NOT_ACCEPTABLE);
	}

	Store.getStoreByID(id)
        .then(store => {
            res.status(HttpStatus.OK).json(storeToFront(store));
        })
        .catch(err => {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(err);
	});	
};


exports.update = function (req, res) {
	var id = req.params.store_id;
	var data = req.body.store;
	
	if (! common.checkDefinedParameters([id,data],"update store")){
		return common.handleError(res,{code:common.ERROR_PARAMETER_MISSING,message:"Breach of preconditios (missing parameters)"},HttpStatus.NOT_ACCEPTABLE);
	}

    //TODO parse data to Update

	Store.updateStore(id,data)
	.then(store => {
		res.status(HttpStatus.OK).json(storeToFront(store));
	})
	.catch(err => {
		res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(err);
	});
};

exports.delete = function (req, res) {
	var id = req.params.store_id;
	
	if (! common.checkDefinedParameters([id],"delete store")){
		return common.handleError(res,{code:common.ERROR_PARAMETER_MISSING,message:"Breach of preconditios (missing parameters)"},HttpStatus.NOT_ACCEPTABLE);
	}

	// TODO delete or set suspend in store
};