const express = require('express');

const isAtuh = require('../middleware/is-auth');
const router = express.Router();
const { getAllProducts, getIndex, getCart, getCheckout, getOrders, getProductById, storeCart, deleteCart, storeOrder } = require('../controller/shop');

router.route('/')
    .get(getIndex)

router.get('/products', getAllProducts);
router.get('/products/:productId',getProductById);
router.get('/products/delete', isAtuh);

router.get('/cart', isAtuh,getCart);
router.post('/cart', isAtuh,storeCart);
router.get('/checkout', isAtuh,getCheckout);
router.get('/orders', isAtuh,getOrders);
router.post('/create-order', isAtuh,storeOrder);
router.post('/cart-delete-item', isAtuh,deleteCart);

module.exports = router;