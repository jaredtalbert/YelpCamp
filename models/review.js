const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    body: String,
    rating: Number
})

module.exports = mongoose.model("Reveiew", reviewSchema)