const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    user_type: {
        type: String,
        required: true,
        enum : ['consumer', 'vendor'],
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    mobile: {
        type: Number,
        required: true,
    },
    address: {
        type: String
    },
    sold_products: [{
        type: Schema.Types.ObjectId, 
        ref: 'Product'
    }],
    cart: [{
        type: Schema.Types.ObjectId, 
        ref: 'Product'
    }],
    orders: [{
        type: Schema.Types.ObjectId, 
        ref: 'Product'
    }]
})

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);
