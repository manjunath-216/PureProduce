const express = require('express');
const  products = require('../controllers/products');
const router = express.Router();
const {isLoggedin, isSeller} = require('../middleware');

router.route('/')
    .get(products.renderIndex)
    .post(isLoggedin, products.createProduct)

router.route('/:id/orders/pay-verify')
    .post(isLoggedin, products.payVerify);

router.get('/new', isLoggedin, products.renderNewForm)

router.route('/:id')
    .get(products.showProduct)    
    .put(isLoggedin, isSeller, products.updateProduct)
    .delete(isLoggedin, isSeller, products.deleteProduct)

router.route('/:id/cart')
    .post(isLoggedin, products.add_to_cart)
    .delete(isLoggedin, products.remove_from_cart)

router.delete('/:id/orders', isLoggedin, products.cancel_order)

router.get('/:id/orders/checkout', isLoggedin, products.checkout)
  

router.get('/:id/edit', isLoggedin, isSeller, products.renderEditForm)

module.exports = router;