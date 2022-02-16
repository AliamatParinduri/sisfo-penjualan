const mongoose = require('mongoose');
const {Schema,model} = require('mongoose');

const products = new Schema({
    title: {
        type: "String",
        required: true,
    },
    price: {
        type: "Number",
        required: true,
    },
    description: {
        type: "String",
        required: true,
    },
    imageUrl: {
        type: "String",
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    }
})
const productModel = model('product', products)

module.exports = productModel;


// const fs = require('fs');
// const path = require('path');
// const dirname = require('../util/path');

// const cart = require('./cart');
        
    // const productsArray = [];
    // const p = path.join(dirname, "src", "data", "products.json");
    
    // const getProductsFromFile = cb => {
    //     fs.readFile(p, (err, fileContent) => {
    //         if (err) {
    //             return cb([])
    //         }
    //         cb(JSON.parse(fileContent));
    //     })
    // }
    
    // class product {
    //     constructor(id,title, price,description,imageUrl) {
    //         this.id = id,
    //         this.title = title,
    //         this.price = price,
    //         this.description = description,
    //         this.imageUrl = imageUrl
    //     }
        
    //     save() {
    
    //         getProductsFromFile(products => {
        //             if (this.id) {
            //                 const existingProductIndex = products.findIndex(prod => prod.id === this.id);
            //                 const updatedProducts = [...products];
            //                 updatedProducts[existingProductIndex] = this;
            //                 fs.writeFile(p, JSON.stringify(updatedProducts), (err) => console.log(err))
            //             }else{
    //                 this.id = (Math.floor(Math.random()*1000)).toString();
    //                 // const p = path.join(dirname, "src", "data", "products.json");
    //                 // fs.readFile(p, (err, fileContent) => {
        //                 //     let product = [];
        //                 //     if (!err) {
            //                 //         product = JSON.parse(fileContent);
            //                 //     }
            //                 //     product.push(this);
            //                 //     fs.writeFile(p, JSON.stringify(product), (err) => console.log(err))
            //                 // })
            //                 getProductsFromFile(product => {
                //                     product.push(this);
    //                     fs.writeFile(p, JSON.stringify(product), (err) => console.log(err))
    //                 })
    //             }
    //         })
    //     }
    
    //     static fetchAll(cb) {
        //         getProductsFromFile(cb)
        //     }
        
        //     static findDataById(id, cb) {
            //         getProductsFromFile(products => {
                //             const product = products.find(p => p.id === id);
                //             cb(product);
                //         })
                //     }
                
                //     static deleteById(id,cb) {
                    //         getProductsFromFile(products => {
    //             const product = products.find(prod => prod.id.trim() === id.trim());
    //             const updateProducts = products.filter (p => p.id.trim() !== id.trim());
    //             fs.writeFile(p, JSON.stringify(updateProducts), err => {
    //                 if (!err) {
    //                     cart.deleteProduct(id, product.price);
    //                 }
    //             })
    //         })
    //     }
    // }
    // module.exports = {productModel, product};