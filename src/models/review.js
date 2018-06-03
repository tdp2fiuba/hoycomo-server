const reviewDB = require('../db/review.js');
const User = require('../models/user.js');

function reviewToFront(review) {

    const _review = {
        id: review.review_id,
        store_id: review.store_id,
        rating: review.rating,
        body: review.body,
        timestamp: review.timestamp
    };

    return User.getUserByID(review.user_id)
    .then(user => {
        _review.user = User.userToFront(user);
        return _review;
    })
    .catch(err => {
        console.log("Error on parse review to front object ",err);
        return _review;
    });
}

exports.reviewToFront = reviewToFront;

exports.createReview = function(data) {
    if (!data.store_id ||
        !data.user_id ||
        !data.rating) {
        return Promise.reject('Missing fields');
    }

    return reviewDB.saveReview(data);
};

exports.getReviewByStoreId= function(store_id,data) {
    if (!store_id) {
        return Promise.reject('Missing Store ID');
    }

    return reviewDB.getReviewsByStore(store_id,data);
};