const HttpStatus = require('http-status-codes');
const Review = require('../models/review.js');
const Store = require('../models/store.js');
const beaber = require('../models/bearerAuthorization.js');
const common = require('../utils/common.js');
let logger;

exports.config = function(config){
    logger = config.logger;
    common.config(config);
};

function _create(req, res, user) {
    //2.0 deberiamos chequear que hizo un pedido al comercio para poder calificar

    if (!user || !user.user_id){
        return common.handleError(res,{message:"Error de autorización"},HttpStatus.UNAUTHORIZED);
    }

    const user_id = user.user_id;
    const store_id = req.params.store_id;
    const rating = req.body.rating;
    const body = req.body.body;

    if (! common.checkDefinedParameters([user_id,store_id,rating],"add review")){
        return common.handleError(res,
            {code:common.ERROR_PARAMETER_MISSING,
            message:"Parámetros inválidos o insuficientes"
            },HttpStatus.BAD_REQUEST);
    }

    if (rating < 0 || rating > 5){
        return common.handleError(res,
            {code:common.ERROR_PARAMETER_MISSING,
                message:"Rating be a value between 1 and 5"
            },HttpStatus.BAD_REQUEST);
    }

    const data = {
        user_id : user_id,
        store_id : store_id,
        rating: rating,
        body: body
    };

    Store.getStoreByID(store_id)
        .then(store => {
            if (!store) {
                console.log("Error on add review, store non exist. store_id: " + store_id);
                return common.handleError(res, {
                    code: common.ERROR_PARAMETER_MISSING,
                    message: "Error al agregar la opinión, no existe el comercio"
                }, HttpStatus.NOT_FOUND);
            }
        })
        .then(() => {
            Review.createReview(data)
            .then(review => {
                Review.reviewToFront(review)
                .then( review => {
                    res.status(HttpStatus.CREATED).json(review);
                });

                //update store rating
                Store.recalculateStoreRating(store_id);
            })
        })
        .catch(err => {
            console.log("Error on create review " + err);
            return common.handleError(res,{code:common.ERROR_PARAMETER_MISSING,message:"Error al agregar la opinión, " + err},HttpStatus.INTERNAL_SERVER_ERROR);
        })

}

exports.create = function (req, res) {
    beaber.authorization(req, res, _create);
};

exports.getByStore = function (req, res) {

    const store_id = req.params.store_id;

    Review.getReviewByStoreId(store_id)
        .then(reviews => {
            const promises = reviews.map(Review.reviewToFront);
            Promise.all(promises).then( reviews => {
                res.status(HttpStatus.OK).json(reviews);
            });
        })
        .catch(err => {
            return common.handleError(res,{message:"Error on read order"},HttpStatus.INTERNAL_SERVER_ERROR);
        });
};