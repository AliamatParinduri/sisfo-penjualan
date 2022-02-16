const mongoose = require('mongoose');

const users = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    resetToken: String,
    resetTokenExpiration: Date,
    cart: {
        items: [{
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'product',
                required:true,
            },  
            quantity: {
                type:Number,
                required:true,
            }
        }]
    }
})

users.methods.addToCart = function (product) {
    cartProductIndex = this.cart.items.findIndex(cp => cp.productId.toString() === product._id.toString());
    updatedCartItems = [...this.cart.items];
    let newQuantity = 1;

    if (cartProductIndex >= 0) {
        newQuantity = this.cart.items[cartProductIndex].quantity + 1;
        updatedCartItems[cartProductIndex].quantity = newQuantity;
    }else{
        updatedCartItems.push({
            productId: product._id,
            quantity: newQuantity
        })
    }
    const updatedCart = {
        items: updatedCartItems
    }
    this.cart = updatedCart;
    return this.save()
}

users.methods.removeFromCart = function (productId) {
    const updatedCartItems = this.cart.items.filter(item => item.productId.toString() !== productId.toString());
    this.cart.items = updatedCartItems;
    return this.save();
}

users.methods.clearCart = function () {
    this.cart = { items: []};
    return this.save();
}

module.exports = mongoose.model('user', users);