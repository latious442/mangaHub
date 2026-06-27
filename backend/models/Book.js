const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    manga: {
        type: String,
        required: true,
    },
    selectedSeriesCategories:{
        type:Array,
        required:true
    },
    image: {
        type: String,
        required: true,
    },
    serie:{
         type:String,
         required:true
    },
    access:{
        type:String,
        required:true
    },

    timestamp: {
        type: Date,
        default: Date.now,
    }
});

const Book = mongoose.model('Book', bookSchema);
module.exports = Book;
