const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

Schema   = mongoose.Schema;

const reviewSchema = new Schema({
    body: { type: String },
    rating : { type: String },
    store_id : { type: String},
    user_id : { type: String},
    timestamp : { type: Date, default: Date.now },
});

reviewSchema.plugin(AutoIncrement, {inc_field: 'review_id'});

const Review = mongoose.model('Review',reviewSchema);

exports.Review = Review;

exports.saveReview = function(data) {
    const review = new Review(data);
    return review.save();
};

exports.getReviewsByStore = function(store_id,data) {
    const data_find = {store_id: store_id};
    if (!data || !data.all) {
        data_find.body = { $ne: null }
    }
    return Review.find(data_find)
        .sort({timestamp: 'desc'});
};

exports.getReviewsByUser = function(user_id) {
    return Review.find({user_id : user_id});
};

exports.getReviewByID = function(review_id) {
    return Review.findOne({review_id : review_id});
};