const express = require('express');
const router = express.Router({mergeParams: true});
const Campground = require('../models/campground')
const Review = require('../models/review')
const catchAsyncError = require('../helpers/catchAsyncError')
const AppError = require('../helpers/AppError')
const { reviewSchema } = require('../validation');
const { isLoggedIn } = require('../helpers/middleware')

function validateReview(req, res, next) {
    const { error } = reviewSchema.validate(req.body)

    if (error) {
        const errorMessage = error.details.map(x => x.message).join(',')
        throw new AppError(errorMessage, 400)
    } else {
        next()
    }
}

router.post('/', isLoggedIn, validateReview, catchAsyncError(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review)

    campground.reviews.push(review)

    await review.save()
    await campground.save()

    req.flash('success', 'Review added successfully')

    res.redirect(`/campgrounds/${campground._id}`)
}))

router.delete('/:reviewId', isLoggedIn, catchAsyncError(async(req, res) => {
    const {id, reviewId} = req.params;
    const campground = await Campground.findById(id);

    await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}})
    await Review.findByIdAndDelete(reviewId);

    req.flash('success', 'Review deleted successfully')

    res.redirect(`/campgrounds/${id}`)
}))

module.exports = router;