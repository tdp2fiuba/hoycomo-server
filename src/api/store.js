//Store API methods
const HttpStatus = require('http-status-codes');
const Store = require('../models/store.js');
const common = require('../utils/common.js');
const googleMaps = require('../models/googlemaps.js');
const fs = require('fs');
const uuid = require('uuid');
const mailing = require('../tools/mailing.js');
let logger;

const mocks = require('../utils/mocks.js');

exports.config = function(config){
	logger = config.logger;
	common.config(config);
};

function storeToFront(store) {
	//mock
	const minMock = Math.floor((Math.random() * 20) + 30);
	const maxMock = minMock + Math.floor((Math.random() * 40) + 1);
	const mockAvailability = {
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
    };

	return {
        id: store.store_id,
        name: store.name,
        business_name: store.business_name,
        address: store.address,
		email: store.email,
		//mock
		foodTypes: store.foodTypes,
		avatar: store.avatar ? store.avatar : common.apiBaseURL() + '/images' + '/avatar_default.jpg',
		delay_time: {
        	min: minMock,
			max: maxMock
		},
        availability: store.availability ? store.availability : mockAvailability
    }


}

exports.create = function (req, res) {
	const name = req.body.name;
	const business_name = req.body.business_name;
	const address_name = req.body.address;
    const email = req.body.email;

	if (! common.checkDefinedParameters([name,business_name,address_name,email],"add store")){
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

	//validate email
	if (!common.validateEmail(email)) {
        return common.handleError(res,{code:common.ERROR_INSERT_DB,message:"Email inválido"},HttpStatus.NOT_ACCEPTABLE);
	}

	const storeData = {
		name : name,
		business_name : business_name,
		email: email
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

				//send email con credenciales
                mailing.sendHTMLMail(store.email,store_data.name + " bienvenido a HoyComo", "<p><em><strong>Hoy Como </strong></em>le da la bienvenida a <strong>"+ store_data.name +".</strong></p><p>Los datos para ingresar al sistema son los siguientes:</p><ul><li><strong>Usuario: </strong>"+ store.login +"</li><li><strong>Contrase&ntilde;a: </strong>"+ store.password +"</li></ul><p>Te recomendamos cambiar la contrase&ntilde;a por una que sea de tu agrado.</p><p>&iexcl;A vender!</p>");

				res.status(HttpStatus.CREATED).json({user:store.login, password: store.password,email: store.email});
			})
			.catch(err => {
                logger.error("Error on update store " + err);
				return common.handleError(res,{code:common.ERROR_INSERT_DB,message:"Error interno al crear el comercio "},HttpStatus.NOT_ACCEPTABLE);
			});
		});
	
	})
	.catch(err => {
        logger.error("Error on create store " + err);
		return common.handleError(res,{code:common.ERROR_INSERT_DB,message:"Error al validar la dirección: " + err},HttpStatus.NOT_ACCEPTABLE);
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
	const data_update = {};
	
	if (! common.checkDefinedParameters([id],"update store")){
		return common.handleError(res,{code:common.ERROR_PARAMETER_MISSING,message:"Breach of preconditios (missing parameters)"},HttpStatus.NOT_ACCEPTABLE);
	}

	const fields = ['name','business_name','availability','address', "foodTypes"];

	fields.forEach(function (field) {
		if (req.body[field]){
			data_update[field] = req.body[field];
		}
    });

	//Avatar
	if (req.body.avatar){
		const file = req.body.avatar;
        // 1. Create correct folder for images if not exists
        const folder_dir =  common.getConfigValue('uploads').upload_dir + "/store/" + id;
        const full_folder_dir = __basedir + '/' + folder_dir;
        if (!fs.existsSync(full_folder_dir)) {
            logger.debug("make dir: " + full_folder_dir);
            fs.mkdirSync(full_folder_dir);
        }

        //store base64 image
        const type = file.type;
        const matches = file.data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

        if (matches.length !== 3) {
            logger.error('Invalid data image input');
            return;
        }
        const base64Image = matches[2];
        const filename = uuid.v1() + '.' + type;
        const imagePath = full_folder_dir + '/' + filename;

        //write file in system
        fs.writeFileSync(imagePath, base64Image, {encoding: 'base64'});
        logger.debug("file created in: " + imagePath);

        //create and add url
        data_update.avatar = common.apiBaseURL() + '/' + folder_dir + '/' + filename;
	}

    new Promise(function(resolve, reject) {
        if (data_update.address){
			googleMaps.processAddress(data_update.address)
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
            res.status(HttpStatus.OK).json("Comercio eliminado");
        })
        .catch(err => {
            logger.error("Error on delete store " + err);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json("Error al eliminar el comercio");
        });
};


exports.deleteAll = function (req, res) {
	Store.deleteAll().then(
        res.status(HttpStatus.OK).json("Comercios eliminados")
	);
};
