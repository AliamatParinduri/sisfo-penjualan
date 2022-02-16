const path = require('path');
const productModel = require('../models/products');
const orderModel = require('../models/order');
const rootDir = require('../util/path');

const getAllProducts = async (req,res,next) => {
    const products = await productModel.find({userId: req.user});
    res.render(path.join(rootDir, 'src', 'views', 'shop', 'product-list'),{
        prods: products,
        pageTitle: 'All Product',
        path: '/products',
        hasProducts: products.length > 0 ? true: false,
    })
}

const getProductById = async (req,res,next) => {
    const prodId = req.params.productId;
    const product = await productModel.findById(prodId);
    res.render(path.join(rootDir, 'src', 'views', 'shop', 'product-detail'), {
        product: product,
        pageTitle: product.title,
        path: 'products',
    })
}

const getIndex = async (req,res,next) => {
    const products = await productModel.find({userId: req.user});
    res.render(path.join(rootDir, 'src', 'views', 'shop', 'index'),{
        prods: products,
        pageTitle: 'shop',
        path: '/',
        hasProducts: products.length > 0 ? true: false,
    })
}

const getCart = async (req,res,next) => {
    const resultCart = await req.user.populate('cart.items.productId');
    res.render(path.join(rootDir, 'src', 'views', 'shop', 'cart'),{
        pageTitle: 'Your Cart',
        path: '/cart',
        products: resultCart.cart.items,
    })
}

const storeCart = async (req,res,next) => {
    const prodId = req.body.productId;
    const resultProduct = await productModel.findById(prodId);
    req.user.addToCart(resultProduct)
    res.redirect('/cart'); 
}

const deleteCart = async (req,res,next) => {
    const prodId = req.body.productId;
    await req.user.removeFromCart(prodId);
    res.redirect('/cart')
}

const getOrders = async (req,res,next) => {
    const orders = await orderModel.find({"user.userId": req.user})
    res.render(path.join(rootDir, 'src', 'views', 'shop', 'orders'),{
        pageTitle: 'Your Orders',
        path: '/orders',
        orders,
    })
}

const storeOrder = async (req,res,next) => {
    const products = req.user.cart.items.map(i => {
        return {quantity: i.quantity, product: { ...i.productId._doc }}
    });
    
    const order = new orderModel({
        user: {
            email: req.user.email,
            userId: req.user
        },
        products: products
    })

    order.save();
    req.user.clearCart();
    res.redirect('/orders');  
}

const getCheckout = (req,res,next) => {
    res.render(path.join(rootDir, 'src', 'views', 'shop', 'product-detail'),{
        pageTitle: 'Your Cart',
        path: '/checkout',
    })
}

module.exports = {getAllProducts,getIndex,getCart,getCheckout,getOrders,getProductById,storeCart,deleteCart,storeOrder};