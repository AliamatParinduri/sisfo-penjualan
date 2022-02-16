const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        email: {
            type:String,
            required:true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true
        }
    },
    products:[{
        product: {
            type: Object,
            required: true,
        },
        quantity: {
            type:Number,
            required:true
        }
    }],
})

module.exports = mongoose.model('order', orderSchema);