const path = require('path');

const mongoose = require('mongoose');
const {validationResult} = require('express-validator');

const productModel = require('../models/products');
const rootDir = require('../util/path');
const fileHelp = require('../util/file');

const getAddProducts = async (req,res) => {
    res.render(path.join(rootDir, 'src', 'views', 'admin', 'edit-product'), {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false,
        hasError: false,
        errorMessage: null,
        validationErrors: []
    });
};

const storeProduct = (req,res,next) => {
    const title = req.body.title;
    const price = req.body.price;
    const description = req.body.description;
    const image = req.file;

    if (!image) {
        return res.status(422).render(path.join(rootDir, 'src', 'views', 'admin', 'edit-product'), {
            pageTitle: 'Add Product',
            path: '/admin/add-product',
            editing: false,
            hasError: true,
            product: {title,price,description},
            errorMessage: "File tidak dalam format gambar",
            validationErrors: []
        })
    }
    const imageUrl = image.path;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        errors.array()
        return res.status(422).render(path.join(rootDir, 'src', 'views', 'admin', 'edit-product'), {
            pageTitle: 'Add Product',
            path: '/admin/add-product',
            editing: false,
            hasError: true,
            product: {title,price,description,imageUrl},
            errorMessage: errors.array()[0].msg,
            validationErrors: [errors.array()[0]]
        })
    }
    const products = new productModel({
        title,
        price,
        description,
        imageUrl,
        userId: req.user
    })
    products.save().then(e=>res.status(200).redirect('/')).catch(e=>{
        const error = new Error(e);
        error.httpStatusCode = 500;
        return next(error);
    });
}

const editProducts = async (req,res) => {
    const editMode = req.query.edit;
    if (!editMode) {
        return res.redirect('/');
    }
    const prodId = req.params.productId;
    const product = await productModel.findById(prodId);
    if (!product) {
        return res.redirect('/');
    }
    
    res.render(path.join(rootDir, 'src', 'views', 'admin', 'edit-product'), {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        product,
        hasError: false,
        errorMessage: null,
            validationErrors: []
    });
};

const updateProduct = async (req,res,next) => {
    const title = req.body.title;
    const price = req.body.price;
    const description = req.body.description;
    const image = req.file;
    const productId = req.body.productId;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        errors.array()
        return res.status(422).render(path.join(rootDir, 'src', 'views', 'admin', 'edit-product'), {
            pageTitle: 'Add Product',
            path: '/admin/add-product',
            editing: true,
            hasError: true,
            product: {title,price,description,imageUrl},
            errorMessage: errors.array()[0].msg,
            validationErrors: [errors.array()[0]]
        })
    }
    const product = await productModel.findById(productId).then(e=>e).catch(e=>{
        const error = new Error(e);
        error.httpStatusCode = 500;
        return next(error);
    });
    
    if (product.userId.toString() !== req.user._id.toString()) {
        req.flash("error", "Anda tidak memiliki akses untuk edit data ini!");
        return res.redirect('/');
    }
    product.title = title;
    product.price = price;
    product.description = description;
    if (image) {
        fileHelp.deleteFile(product.imageUrl);
        product.imageUrl = image.path;
    }

    product.save();
    res.redirect('/admin/products');
}

const deleteProduct = async (req,res,next) => {
    const prodId = req.body.productId.trim();
    const product = await productModel.findById(prodId).then(e=>e).catch(e=>console.log(e));
    
    if (!product) {
        return next(new Error('Product tidak ditemukan!'));
    }
    fileHelp.deleteFile(product.imageUrl);
    
    await productModel.deleteOne({id: prodId, userId: req.user}).then(e=>e).catch(e=>next(new Error(e)));
    res.redirect('/admin/products');
}

const getProducts = async (req,res,next) => {
    const products = await productModel.find({userId: req.user})
    res.render(path.join(rootDir, 'src', 'views', 'admin', 'products'),{
        prods: products,
        pageTitle: 'Admin Product',
        path: '/admin/products',
        hasProducts: products.length > 0 ? true: false,
    })
}

module.exports = {getAddProducts,getProducts, storeProduct, editProducts,updateProduct, deleteProduct}