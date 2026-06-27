const mongoose = require('mongoose');
const serieSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    sort:{
        type: Array,
        required: true,
    },
  
    photo:{
        type: String,
        required: true,
    }
});

const Serie = mongoose.model('Serie', serieSchema);
module.exports = Serie;