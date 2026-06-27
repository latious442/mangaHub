const mongoose = require('mongoose');
const paySchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    pay: {
        type: String,
        required: true,
    },
    ph:{
        type: String,
        required: true,
    }
});

const Pay = mongoose.model('Pay', paySchema);
module.exports = Pay;
