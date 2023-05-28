if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}
const Product = require('../models/product');
const catchAsync = require('../utils/catchAsync')
const categories = require('../utils/categories')
const User = require('../models/user');

const Razorpay = require('razorpay');
const { dashboard } = require('./users');
var instance = new Razorpay({
    key_id: 'rzp_test_BUP7HBUiCiHb4b',
    key_secret: '59DFNxqKfoKFPPjczYe7QnqN',
});

module.exports.renderIndex = catchAsync(async (req, res) => {
    const products = await Product.find();
    res.render('products/index', {products});
})

module.exports.createProduct = catchAsync(async (req, res) => {
    const product = new Product(req.body);
    product.vendor = req.user._id;
    await product.save();
    const user = await User.findById(req.user._id);
    user.sold_products.push(product._id);
    await user.save();
    req.flash('success', 'successfully created your product');
    res.redirect(`/users/${req.user._id}/sold_products`);
})

module.exports.renderNewForm = (req, res) => {
    res.render('products/new', {categories});
}

module.exports.showProduct = catchAsync(async (req, res) => {
    const {id} = req.params;
    const product = await Product.findById(id).populate('vendor');
    if(!product){
        req.flash('error', 'product not found');
        return res.redirect('/products')
    }
    else{
        res.render('products/show', {product});
    }
})

module.exports.renderEditForm = catchAsync(async (req, res) => {
    const {id} = req.params;
    const product = await Product.findById(id);
    if(!product){
        req.flash('error', 'product not found');
        return res.redirect('/products')
    }
    res.render('products/edit', {product, categories});
})

module.exports.updateProduct = catchAsync(async (req, res) => {
    const {id} = req.params;
    await Product.findByIdAndUpdate(id, req.body);
    req.flash('success', 'successfully updated your product');
    res.redirect(`/products/${id}`);
})

module.exports.deleteProduct = catchAsync(async (req, res) => {
    const {id} = req.params;
    const product = await Product.findByIdAndDelete(id);
    await User.findByIdAndUpdate(product.vendor, {$pull : {sold_products : product._id}})
    req.flash('success', 'successfully deleted your product');
    res.redirect(`/users/${req.user._id}/sold_products`);
})

module.exports.add_to_cart = catchAsync(async (req, res) => {
    const {id} = req.params;
    const user = await User.findById(req.user._id);
    if(!user.cart.includes(id)){
        user.cart.push(id);
        await user.save();
    }
    req.flash('success', 'successfully added to cart');
    res.redirect(`/products/${id}`);
    //res.redirect(`/users/${user._id}/cart`);
})

module.exports.remove_from_cart = catchAsync(async (req, res) => {
    const {id} = req.params;
    const user = await User.findById(req.user._id);
    const index = user.cart.indexOf(id);
    user.cart.splice(index, 1);
    await user.save();
    req.flash('success', 'successfully removed product from cart');
    res.redirect(`/products/${id}`);
})

module.exports.checkout = catchAsync(async (req, res) => {
    const {id} = req.params;
    const user = await User.findById(req.user._id);
    const product = await Product.findById(id);
    var options = {
        amount: product.price[0]*100,  // amount in the smallest currency unit
        currency: "INR",
        receipt: "rcp1"
    };
    instance.orders.create(options, function(err, order) {
        if (err) {
            //console.log(err);
        } else {
            //console.log(order);
            res.render('products/checkout', {amount: order.amount, order_id: order.id, user: user, product_id: id});
        }
    });
    
    // user.orders.push(id);
    // await user.save();
    // req.flash('success', 'successfully placed your order');
    // res.redirect(`/products/${id}`);
    //res.redirect(`/users/${user._id}/cart`);
})

module.exports.payVerify = catchAsync(async (req, res) => {
    const user = await User.findById(req.body.user_id);
    body=req.body.razorpay_order_id + "|" + req.body.razorpay_payment_id;
    var crypto = require("crypto");
    var expectedSignature = crypto.createHmac('sha256', '59DFNxqKfoKFPPjczYe7QnqN')
                                    .update(body.toString())
                                    .digest('hex');
                                    //console.log("sig"+req.body.razorpay_signature);
                                    //console.log("sig"+expectedSignature);
    
    if(expectedSignature === req.body.razorpay_signature){
     // console.log("Payment Success");
        user.orders.push(req.body.product_id);
        await user.save();
        const product = await Product.findById(req.body.product_id);
        const vendor =  await User.findById(product.vendor);
        const details = {product: req.body.product_id, buyer: user.username, delivery_address: user.address};
        vendor.dashboard.push(details);
        await vendor.save();
       //console.log(vendor);
        // console.log(`/products/${req.body.product_id}`);
        // req.flash('success', 'successfully placed your order');
        // res.setHeader("Content-Type", "text/html")
        // res.redirect(`/products/${req.body.product_id}`);
        // res.redirect(`/users/${req.body.user_id}/orders`);
        //console.log("Redirected!!")
    }else{
      //console.log("Payment Fail");
    }
})

module.exports.cancel_order = catchAsync(async (req, res) => {
    const {id} = req.params;
    const user = await User.findById(req.user._id);
    const index = user.orders.indexOf(id);
    user.orders.splice(index, 1);
    await user.save();
    const product = await Product.findById(id);
    const vendor = await User.findById(product.vendor);
    vendor.dashboard = vendor.dashboard.filter((item) => !(item.product.equals(id) && user.username === item.buyer));
    await vendor.save();
    //console.log(vendor.dashboard);
    req.flash('success', 'successfully cancelled your order');
    res.redirect(`/products/${id}`);
})

module.exports.delivery_address = catchAsync( async (req, res) => {
    const {id} = req.params;
    res.render('products/delivery_address', {id});
})


