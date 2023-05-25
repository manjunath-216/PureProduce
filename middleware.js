const ExpressError = require('./utils/ExpressError');
const Product = require('./models/product');

module.exports.isLoggedin = (req, res, next) => {
    if(!req.isAuthenticated()){
        req.flash('error', 'you must be signed in');
        return res.redirect('/login');
    }
    else{
        next();
    }
}

module.exports.isSeller = async (req, res, next) => {
    const {id} = req.params;
    const product = await Product.findById(id);
    if(!product.vendor.equals(req.user._id)){
        req.flash('error', 'You do not have permission to do that');
        return res.redirect(`/campgrounds/${id}`)
    }
    else{
        next();
    }
}
