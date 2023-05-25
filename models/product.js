const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const productSchema = new Schema({
    name: {
        type: String,
        required: [true, 'name cannot be empty']
    },
    category: {
        type: String,
        required: [true, 'category cannot be empty']
    },
    description: {
        type: String,
        required: [true, 'product details cannot be empty']
    },
    image: {
        type: String,
        required: [true, 'image url cannot be empty']
    },
    price: {
        type: [Number, 'price must be a number'],
        required: [true, 'price cannot be empty'],
        min: [0, 'price cannot be negative']
    },
    quantity: {
        type: [Number, 'quantity must be a number'],
        required: [true, 'quantity cannot be empty'],
        min: [0, 'quantity cannot be negative']
    },
    shelfLife: {
        type: [Number, 'shelf life must be a number'],
        required: [true, 'shelf life cannot be empty'],
        min: [0, 'shelf life cannot be negative']
    },
    vendor: {
        type: Schema.Types.ObjectId, 
        ref: 'User'
    },
})

productSchema.index({name: 'text', description: 'text'});

module.exports = mongoose.model('Product', productSchema);