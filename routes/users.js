const express = require('express');
const passport = require('passport');
const User = require('../models/user');
const router = express.Router();
const users = require('../controllers/users');

router.route('/register')
    .get(users.renderRegister)
    .post(users.register)

router.route('/login')
    .get(users.renderLogin)
    .post(passport.authenticate('local', {failureFlash: true, failureRedirect: '/login', keepSessionInfo: true}), users.login)

router.get('/logout', users.logout)

router.get('/users/:id/sold_products', users.sold_products)

router.get('/users/:id/cart', users.cart)

router.get('/users/:id/orders', users.orders)


module.exports = router;