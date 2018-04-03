//Store API methods
var HttpStatus = require('http-status-codes');
var Store = require('../models/store.js');
var common = require('../utils/common.js');
var db;
var logger;

exports.config = function(config){
	db = config.db;
	logger = config.logger;
	common.config(config);
};

exports.create = function (req, res) {

	var name = req.body.name;
	var business_name = req.body.business_name;
	var address = req.body.address;

	if (! common.checkDefinedParameters([name,business_name,address],"add store")){
		return common.handleError(res,{code:common.ERROR_PARAMETER_MISSING,message:"Breach of preconditios (missing parameters)"},HttpStatus.NOT_ACCEPTABLE);
	}
	
	Store.find({name: name},function(err, _store) {
		if(err) return common.handleError(res,{code:common.ERROR_INSERT_DB,message:"Store non exist."},HttpStatus.NOT_FOUND);
      	if (_store) {
      		logger.error('Error on add new store, already exist -> name: '+ name);
			return common.handleError(res,{code:common.ERROR_INSERT_DB,message:"Store already exist."},HttpStatus.NOT_ACCEPTABLE);
      	}
	});

	// TODO: 1. create login and pass
	var login = "";
	var pass = "";

	var store = new Store({
		name : name,
		business_name : business_name,
		address : {
			name: address.name,
			lat : address.lat,
			lon : adresss.lon
		},
		login : login,
		password : pass
	});

	store.save(function(err, store) {
		if(err) return common.handleError(res,{code:common.ERROR_INSERT_DB,message:"Store already exist."},HttpStatus.NOT_ACCEPTABLE);
    	res.status(HttpStatus.CREATED).json(store);
	});
};

exports.search = function (req, res) {
	var page = req.params.page || common.DEFAULT_PAGE;
	var count = req.params.count || common.DEFAULT_SIZE;
	
	Store.find({}, { sort: {name: 1}, skip: page*count, limit: count }, function(err, results) { 
		if(err) { 
			res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(err); 
			return; 
		};

        res.status(HttpStatus.OK).json(results);
	});	
};

exports.read = function (req, res) {
	var id = req.params.id;
	
	if (! common.checkDefinedParameters([id],"read store")){
		return common.handleError(res,{code:common.ERROR_PARAMETER_MISSING,message:"Breach of preconditios (missing parameters)"},HttpStatus.NOT_ACCEPTABLE);
	}

	Store.findById(id,function(err, _store) {
		if(err) return common.handleError(res,{code:common.ERROR_INSERT_DB,message:"Store non exist."},HttpStatus.NOT_FOUND);
      	res.status(HttpStatus.OK).json(_store);
	});
};


exports.update = function (req, res) {
	var id = req.params.id;
	
	if (! common.checkDefinedParameters([id],"update store")){
		return common.handleError(res,{code:common.ERROR_PARAMETER_MISSING,message:"Breach of preconditios (missing parameters)"},HttpStatus.NOT_ACCEPTABLE);
	}

	Store.findById(id, function(err, store) {
	    if (err)
	      return common.handleError(res,{code:common.ERROR_INSERT_DB,message:"Store non exist."},HttpStatus.NOT_FOUND);

	    //TODO Update
	    
    	//Save the store and check for errors
	    store.save(function(err) {
	      	if (err)
	        	return common.handleError(res,{code:common.ERROR_INSERT_DB,message:"Store non exist."},HttpStatus.NOT_FOUND);
	        
	      	res.status(HttpStatus.OK).json(store);
	    });
	});
};

exports.delete = function (req, res) {

	var id = req.params.id;
	
	if (! common.checkDefinedParameters([id],"delete store")){
		return common.handleError(res,{code:common.ERROR_PARAMETER_MISSING,message:"Breach of preconditios (missing parameters)"},HttpStatus.NOT_ACCEPTABLE);
	}

	// Use the Beer model to find a specific beer and remove it
  	Store.findByIdAndRemove(id, function(err) {
    	if (err)
    		return common.handleError(res,{code:common.ERROR_PARAMETER_MISSING,message:"Breach of preconditios (missing parameters)"},HttpStatus.NOT_ACCEPTABLE);

    	res.status(HttpStatus.NO_CONTENT).json({ message: 'Store removed from the system!' });
  });

};