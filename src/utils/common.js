exports.ERROR_INSERT_DB = 01;
exports.ERROR_DESTROY_DATA_DB = 02;
exports.ERROR_UPDATE_DB = 03;
exports.ERROR_FIND_DATA_DB = 04;
exports.ERROR_PARAMETER_MISSING = 10;
exports.ERROR_PARAMETER_INVALID = 11;

exports.DEFAULT_PAGE = 0;
exports.DEFAULT_SIZE = 10;

var db = null;
var logger = null;

exports.config = function(config){
	db = config.db;
	logger = config.logger;
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
    return res.status(cod).send({code:err.code, error: err.message});
};


exports.validateAddress = function(address_name){

}