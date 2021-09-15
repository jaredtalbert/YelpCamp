const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const ejsMate = require('ejs-mate')
const methodOverride = require('method-override')

const AppError = require('./helpers/AppError')

const campgrounds = require('./routes/campgrounds');
const reviews = require('./routes/reviews');

/* ---- EXPRESS ---- */
const app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.engine('ejs', ejsMate);

app.use(express.static(path.join(__dirname, 'public')));

app.use('/campgrounds', campgrounds);
app.use('/campgrounds/:id/reviews', reviews);

/* ---- DATABASE ---- */
const dbName = 'yelpcamp';
mongoose.connect(`mongodb://localhost:27017/${dbName}`, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

const db = mongoose.connection
db.on('error', console.error.bind(console, 'Connection error:'))
db.once('open', () => {
    console.log('DB connected')
})

app.get('/', (req, res) => {
    res.render('home')
})

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