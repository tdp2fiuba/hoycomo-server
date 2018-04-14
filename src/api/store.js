//Store API methods
var HttpStatus = require('http-status-codes');
var Store = require('../models/store.js');
var common = require('../utils/common.js');
var googleMaps = require('../models/googlemaps.js');
var logger;

var mocks = require('../utils/mocks.js');

exports.config = function(config){
	logger = config.logger;
	common.config(config);
};

function storeToFront(store) {
	//mock
	const minMock = Math.floor((Math.random() * 20) + 30);
	const maxMock = minMock + Math.floor((Math.random() * 40) + 1);

	return {
        id: store.store_id,
        name: store.name,
        business_name: store.business_name,
        address: store.address,
        menu: store.menu, //TODO: find menu objects

		//mock

		avatar: common.apiBaseURL() + '/images' + '/avatar_default.jpg',
		delay_time: {
        	min: minMock,
			max: maxMock
		},
        availability: {
            monday: {
                start_time: "18:30:00",
                end_time: "00:30:00"
            },
            tuesday: {
                start_time: "18:30:00",
                end_time: "00:30:00"
            },
            wednesday: {
                start_time: "18:30:00",
                end_time: "00:30:00"
            },
            thursday: {
                start_time: "18:30:00",
                end_time: "01:30:00"
            },
            friday: {
                start_time: "18:30:00",
                end_time: "02:00:00"
            },
            saturday: {
                start_time: "18:30:00",
                end_time: "03:00:00"
            },
            sunday: {
                start_time: "18:30:00",
                end_time: "01:30:00"
            }
        }
    }


}

exports.create = function (req, res) {
	var store = req.body.store;
	if (!store){
        return common.handleError(res,{code:common.ERROR_PARAMETER_MISSING,message:"Parámetros inválidos o insuficientes"},HttpStatus.BAD_REQUEST);
	}
	var name = store.name;
	var business_name = store.business_name;
	var address_name = store.address;

	if (! common.checkDefinedParameters([name,business_name,address_name],"add store")){
		return common.handleError(res,{code:common.ERROR_PARAMETER_MISSING,message:"Parámetros inválidos o insuficientes"},HttpStatus.BAD_REQUEST);
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
				logger.info("Store created:" + store_data);
				res.status(HttpStatus.CREATED).json({user:store.login, password: store.password});
			})
			.catch(err => {
                logger.error("Error on update store " + err);
				return common.handleError(res,{code:common.ERROR_INSERT_DB,message:"Error interno al crear el comercio "},HttpStatus.NOT_ACCEPTABLE);
			});
		});
	
	})
	.catch(err => {
        logger.error("Error on create store " + err);
		return common.handleError(res,{code:common.ERROR_INSERT_DB,message:"Error al validar la dirección."},HttpStatus.NOT_ACCEPTABLE);
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
            logger.error("Error on search stores " + err);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json("Error al buscar los comercios");
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
            logger.error("Error on read store " + err);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json("Error al obtener el comercio");
	});	
};


//update basic information for a store
exports.update = function (req, res) {
	const id = req.params.store_id;
	const data = req.body.store;
	
	if (! common.checkDefinedParameters([id,data],"update store")){
		return common.handleError(res,{code:common.ERROR_PARAMETER_MISSING,message:"Breach of preconditios (missing parameters)"},HttpStatus.NOT_ACCEPTABLE);
	}

  	var data_update = {
		name : data.name,
        business_name: data.business_name,
	};

    new Promise(function(resolve, reject) {
        if (data.address_name){
			googleMaps.processAddress(data.address_name)
			.then(address => {
				data_update.address = address;
				resolve(data_update);
			})
		}
		resolve(data_update);
    })
	.then( data_update => {
        Store.updateStore(id,data_update)
		.then(store => {
			res.status(HttpStatus.OK).json(storeToFront(store));
		})
		.catch(err => {
			logger.error("Error on update store " + err);
			res.status(HttpStatus.INTERNAL_SERVER_ERROR).json("Error al actualizar el comercio");
		});
	});
};

exports.delete = function (req, res) {
	var id = req.params.store_id;
	
	if (! common.checkDefinedParameters([id],"delete store")){
		return common.handleError(res,{code:common.ERROR_PARAMETER_MISSING,message:"Breach of preconditios (missing parameters)"},HttpStatus.NOT_ACCEPTABLE);
	}

	Store.deleteById(id)
        .then(() => {
            res.status(HttpStatus.OK);
        })
        .catch(err => {
            logger.error("Error on delete store " + err);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json("Error al eliminar el comercio");
        });
};

/*
exports.deleteAll = function (req, res) {
	Store.deleteAll().then(
        res.status(HttpStatus.OK).json("Comercios eliminados")
	);
};
*/