var Store = require('../models/store.js');
var config = require('../config/config.json');

exports.ERROR_INSERT_DB = 1;
exports.ERROR_DESTROY_DATA_DB = 2;
exports.ERROR_UPDATE_DB = 3;
exports.ERROR_FIND_DATA_DB = 4;
exports.ERROR_PARAMETER_MISSING = 10;
exports.ERROR_PARAMETER_INVALID = 11;

exports.DEFAULT_PAGE = 0;
exports.DEFAULT_SIZE = 10;
var conf = {};

exports.config = function(config){
	conf.db = config.db;
	conf.logger = config.logger;
};

exports.checkDefinedParameters = function(parameters,context){
	for (var i = 0; i < parameters.length ; i++) {
		if (typeof parameters[i] === "undefined"){
			logger.error('Error on '+ context +' missing parameters, arrived -> '+ parameters);
			return false;
		}
	}
	return true;
};

exports.handleError = function(res,err,cod) {
	console.log(err);
    return res.status(cod).send({code:err.code, message: err.message});
};

exports.generateLogin = function(store_name) {
	var login_data = {};

	//0. password
	login_data.password = Math.random().toString(36).slice(-8);
	
	//1. lowercase
	var login = store_name.toLowerCase();

	//2. replace whitespace
	login = login.replace(/\s+/g, '');
	
	//3. replace caractertes: +,.`
	login = login.replace(/\'+|\++|\.+|,+|`+|\"+/g, '');

	//4. max length 40 characters
	login = login.substr(0,39);

	//5. find user_name is already exist
	return Store.findSimilarLogin(login).then(stores => {
		if (stores.length > 0){
			var last_login = stores[stores.length-1].login;
            var last_number = 0;
            if (last_login !== login){
                last_number = last_login.substr(login.length, last_login.length);
            }

			login = login + (parseInt(last_number) + 1);
		}
		login_data.login = login;
		return login_data;
	});
};

exports.setApiBaseURL = function(apiBaseURL) {
	conf.apiBaseURL = apiBaseURL;
};

exports.apiBaseURL = function() {
	return conf.apiBaseURL;
};

exports.getConfigValue = function(key) {
    return config[key];
};

exports.validateEmail = function(email) {
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}
