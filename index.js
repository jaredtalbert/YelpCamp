const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const Campground = require('./models/campground')

const app = express()
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

const dbName = 'yelpcamp'

mongoose.connect(`mongodb+srv://admin:admin123@cluster0.rphhm.mongodb.net/${dbName}?retryWrites=true&w=majority`, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
})

const db = mongoose.connection
db.on('error', console.error.bind(console, 'Connection error:'))
db.once('open', () => {
    console.log('DB connected')
})


app.get('/', (req, res) => {
    res.render('home')
})

app.get('/campgrounds', async (req, res) => {
    const campgrounds = await Campground.find({})

    res.render('campgrounds/index', { campgrounds })
})

app.listen(3000, () => {
    console.log("Listening on port 3000")
})