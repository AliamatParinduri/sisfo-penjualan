const express = require('express');
const isAtuh = require('../middleware/is-auth');

const router = express.Router();
const adminRoute = require('../controller/admin');

const {body} = require('express-validator');

router.route('/add-product', isAtuh)
    .get(adminRoute.getAddProducts)
    .post([
    body('title').isString().isLength({min:3}).trim(),
    body('price').isNumeric(),
    body('description').isLength({min: 5, max:125}).trim()
],adminRoute.storeProduct)

router.get('/edit-product/:productId',isAtuh, adminRoute.editProducts);
router.post('/edit-product/',isAtuh,[
    body('title').isString().isLength({min:3}).trim(),
    body('price').isFloat(),
    body('description').isLength({min: 5, max:125}).trim()
], adminRoute.updateProduct);
router.get('/products',isAtuh, adminRoute.getProducts);

router.post('/delete-product/',isAtuh, adminRoute.deleteProduct);

module.exports = {router};