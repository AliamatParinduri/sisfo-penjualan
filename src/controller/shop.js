const fs = require('fs');
const path = require('path');

const pdfDocument = require('pdfkit')

const productModel = require('../models/products');
const orderModel = require('../models/order');
const rootDir = require('../util/path');

const Items_per_page = 2;

const getAllProducts = async (req,res,next) => {
    const page = +req.query.page || 1;
    const productCount = await productModel.find({userId: req.user}).countDocuments();
    const products = await productModel.find({userId: req.user}).skip((page - 1) * Items_per_page).limit(Items_per_page).then(e=>e).catch(e=>console.log(e));
    res.render(path.join(rootDir, 'src', 'views', 'shop', 'product-list'),{
        prods: products,
        pageTitle: 'All Product',
        path: '/products',
        hasProducts: products.length > 0 ? true: false,
        totalProduct: productCount,
        currentPage: page,
        hasNextPage: Items_per_page * page < productCount,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil((productCount/Items_per_page))
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
    const page = +req.query.page || 1;
    const productCount = await productModel.find({userId: req.user}).countDocuments();
    const products = await productModel.find({userId: req.user}).skip((page - 1) * Items_per_page).limit(Items_per_page).then(e=>e).catch(e=>console.log(e));

    res.render(path.join(rootDir, 'src', 'views', 'shop', 'index'),{
        prods: products,
        pageTitle: 'shop',
        path: '/',
        hasProducts: products.length > 0 ? true: false,
        totalProduct: productCount,
        currentPage: page,
        hasNextPage: Items_per_page * page < productCount,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil((productCount/Items_per_page))
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

const getInvoice = async (req,res,next) => {
    const orderId = req.params.orderId;
    const order = await orderModel.findById(orderId).then(e=>e).catch(e=>next(new Error(e)));

    if (!order) {
        return next(new Error("Order tidak ditemukan"));
    }
    if (order.user.userId.toString() !== req.user._id.toString()) {
        return next(new Error("Unautorized"));
    }

    const invoiceName = 'Invoice-'+ orderId + '.pdf';
    const invoicePath = path.join(__dirname, "..", 'data', 'invoices', invoiceName);

    const pdfDoc = new pdfDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="'+ invoiceName +'"');

    pdfDoc.pipe(fs.createWriteStream(invoicePath));
    pdfDoc.pipe(res);

    pdfDoc.fontSize(26).text('Invoice', {
        underline: true
    });
    pdfDoc.text('----------------------------');
    pdfDoc.text(order.user.userId);

    pdfDoc.end();
}

module.exports = {getAllProducts,getIndex,getCart,getCheckout,getOrders,getProductById,storeCart,deleteCart,storeOrder,getInvoice};