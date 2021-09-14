const express = require('express');
const router = express.Router();
const Campground = require('../models/campground')
const catchAsyncError = require('../helpers/catchAsyncError')
const AppError = require('../helpers/AppError')
const { campgroundSchema } = require('../validation');

function validateCampground(req, res, next) {
    const { error } = campgroundSchema.validate(req.body)

    if (error) {
        const errorMessage = error.details.map(x => x.message).join(',')
        throw new AppError(errorMessage, 400)
    } else {
        next()
    }

}

router.get('/', catchAsyncError(async (req, res) => {
    const campgrounds = await Campground.find({})

    res.render('campgrounds/index', { campgrounds })
}))

router.get('/new', (req, res) => {
    res.render('campgrounds/new')
});

router.post('/', validateCampground, catchAsyncError(async (req, res, next) => { // Create new campground
    // if (!req.body.campground) { throw new AppError("Invalid data received", 400) }

    const campground = new Campground(req.body.campground)
    await campground.save()

    res.redirect(`/campgrounds/${campground._id}`)
}))

router.get('/:id', catchAsyncError(async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findById(id).populate('reviews')

    console.log(campground)

    res.render('campgrounds/details', { campground })
}))

router.get('/:id/edit', catchAsyncError(async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findById(id)

    res.render('campgrounds/edit', { campground })
}))

router.put('/:id', validateCampground, catchAsyncError(async (req, res) => {
    const { id } = req.params
    await Campground.findByIdAndUpdate(id, { ...req.body.campground })
    res.redirect(`/campgrounds/${id}`)
}))

router.delete('/:id', catchAsyncError(async (req, res) => {
    const { id } = req.params
    await Campground.findByIdAndDelete(id)
    res.redirect('/campgrounds')
}))

module.exports = router;