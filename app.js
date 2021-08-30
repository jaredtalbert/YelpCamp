const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const ejsMate = require('ejs-mate')
const methodOverride = require('method-override')

const Campground = require('./models/campground')
const Review = require('./models/review')
const catchAsyncError = require('./helpers/catchAsyncError')
const AppError = require('./helpers/AppError')
const { campgroundSchema, reviewSchema } = require('./validation');
const review = require('./models/review');

/* ---- EXPRESS ---- */
const app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.engine('ejs', ejsMate);

/* ---- DATABASE ---- */
const dbName = 'yelpcamp';

mongoose.connect(`mongodb+srv://admin:admin123@cluster0.rphhm.mongodb.net/${dbName}?retryWrites=true&w=majority`, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection
db.on('error', console.error.bind(console, 'Connection error:'))
db.once('open', () => {
    console.log('DB connected')
})

/* ---- VALIDATION FUNCTIONS ---- */

function validateCampground(req, res, next) {
    const { error } = campgroundSchema.validate(req.body)

    if (error) {
        const errorMessage = error.details.map(x => x.message).join(',')
        throw new AppError(errorMessage, 400)
    } else {
        next()
    }

}

function validateReview(req, res, next) {
    const { error } = reviewSchema.validate(req.body)

    if (error) {
        const errorMessage = error.details.map(x => x.message).join(',')
        throw new AppError(errorMessage, 400)
    } else {
        next()
    }
}


/* ---- ROUTES ---- */
app.get('/', (req, res) => {
    res.render('home')
})

app.get('/campgrounds', catchAsyncError(async (req, res) => {
    const campgrounds = await Campground.find({})

    res.render('campgrounds/index', { campgrounds })
}))

app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new')
});

app.post('/campgrounds', validateCampground, catchAsyncError(async (req, res, next) => { // Create new campground
    // if (!req.body.campground) { throw new AppError("Invalid data received", 400) }

    const campground = new Campground(req.body.campground)
    await campground.save()

    res.redirect(`/campgrounds/${campground._id}`)
}))

app.get('/campgrounds/:id', catchAsyncError(async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findById(id)

    res.render('campgrounds/details', { campground })
}))

app.get('/campgrounds/:id/edit', catchAsyncError(async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findById(id)

    res.render('campgrounds/edit', { campground })
}))

app.put('/campgrounds/:id', validateCampground, catchAsyncError(async (req, res) => {
    const { id } = req.params
    await Campground.findByIdAndUpdate(id, { ...req.body.campground })
    res.redirect(`/campgrounds/${id}`)
}))

app.delete('/campgrounds/:id', catchAsyncError(async (req, res) => {
    const { id } = req.params
    await Campground.findByIdAndDelete(id)
    res.redirect('/campgrounds')
}))

app.post('/campgrounds/:id/reviews', validateReview, catchAsyncError(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review)

    campground.reviews.push(review)

    await review.save()
    await campground.save()

    res.redirect(`/campgrounds/${campground._id}`)
}))

app.all('*', (req, res, next) => {
    next(new AppError("404 Not Found", 404))
})

app.use((err, req, res, next) => {
    const { status = 500 } = err

    if (!err.message) err.message = "Something went wrong, please try again!"

    res.status(status).render('error', { err })
})

app.listen(3000, () => {
    console.log("Listening on port 3000")
})