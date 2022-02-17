const express = require('express');

const isAuth = require('../middleware/is-auth');
const router = express.Router();
const shopController = require('../controller/shop');

router.route('/')
    .get(shopController.getIndex)

router.get('/products', shopController.getAllProducts);
router.get('/products/:productId',shopController.getProductById);

router.get('/cart', isAuth,shopController.getCart);
router.post('/cart', isAuth,shopController.storeCart);
router.get('/checkout', isAuth,shopController.getCheckout);
router.get('/orders', isAuth,shopController.getOrders);
router.post('/create-order', isAuth,shopController.storeOrder);
router.post('/cart-delete-item', isAuth,shopController.deleteCart);

router.get('/orders/:orderId', isAuth,shopController.getInvoice);

module.exports = router;