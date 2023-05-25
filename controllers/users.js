const catchAsync = require("../utils/catchAsync");
const User = require('../models/user');

module.exports.renderRegister = (req, res) => {
    res.render('users/register');
}

module.exports.register = catchAsync(async (req, res) => {
    try{
        const {username, password, user_type, email, mobile, address} = req.body;
        const user = new User({username, user_type, email, mobile, address});
        const registeredUser = await User.register(user, password);
        let redirectUrl = '/';
        if(user_type !== 'vendor' && req.session.returnTo){
            redirectUrl = req.session.returnTo;
        }
        req.login(registeredUser, (err) =>{
            if(err) return next(err);
            req.flash('success', 'Welcome to Pure Produce');
            res.redirect(redirectUrl);
        })
    }
    catch(err){
        req.flash('error', err.message);
        res.redirect('/register');
    }
})


module.exports.renderLogin = (req, res) => {
    res.render('users/login');
}


module.exports.login = (req, res) => {
    let redirectUrl = '/';
    if(req.user.user_type !== 'vendor' && req.session.returnTo){
        redirectUrl = req.session.returnTo;
    }
    req.flash('success', 'successfully logged in');
    return res.redirect(redirectUrl);
}

module.exports.logout = (req, res) => {
    req.logout(function(err) {
        if(err) return next(err);  
        else{
            req.flash('success', 'successfully logged out');
            res.redirect('/');  
        }
    })
}

module.exports.sold_products = catchAsync( async (req, res) => {
    const {id} = req.params;
    const user = await User.findById(id).populate('sold_products');
    res.render('users/sold_products', {user});
})

module.exports.cart = catchAsync( async (req, res) => {
    const {id} = req.params;
    const user = await User.findById(id).populate('cart');
    res.render('users/cart', {user});
})

module.exports.orders = catchAsync( async (req, res) => {
    const {id} = req.params;
    const user = await User.findById(id).populate('orders');
    res.render('users/orders', {user});
})

