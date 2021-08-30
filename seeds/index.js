const mongoose = require('mongoose')
const cities = require('./cities')
const { descriptors, places } = require('./seedHelpers')
const Campground = require('../models/campground')

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

const sample = array => array[Math.floor(Math.random() * array.length)]

const seed = async () => {
    await Campground.deleteMany({})

    for (let i = 0; i < 50; i++) {
        const random1k = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 30) + 10;
        const camp = new Campground({
            location: `${cities[random1k].city}, ${cities[random1k].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: 'https://source.unsplash.com/collection/483251',
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptates quos temporibus quae, fugiat itaque perferendis dolorum dolor minima aut magnam tenetur optio, corrupti veniam est? Tempore nihil excepturi nulla corporis.',
            price
        })
        await camp.save()
    }
}

seed().then(() => {
    console.log("Database successfully seeded")
    mongoose.connection.close()
})