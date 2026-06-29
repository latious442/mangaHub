const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        
    },
    email:{
        type: String,
        required: true,
        unique: true,
    
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false, 
      },
    timestamp: {
        type: Date,
        default: Date.now,
    },
    vipInvitePending: {
        type: Boolean,
        default: false,
    },
    vipMember: {
        type: Boolean,
        default: false,
    },
    vipDuration: {
        type: String,
        enum: ['30d', '60d', '90d'],
        default: '30d',
    }
});

const User = mongoose.model('User', userSchema);
module.exports = User;
