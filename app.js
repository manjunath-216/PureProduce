if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}
const express = require('express');
const app = express();
const ejsMate = require('ejs-mate');
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));
//models
const User = require('./models/user');
//routes
const productRoutes = require('./routes/products');
const userRoutes = require('./routes/users');
//utils
const ExpressError = require('./utils/ExpressError');
const categories = require('./utils/categories');
//session
const session = require('express-session');
const flash = require('connect-flash')
//passport
const passport = require('passport');
const LocalStrategy = require('passport-local');
const MongoStore = require('connect-mongo');

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/ecommerce';
//const dbUrl = 'mongodb://localhost:27017/ecommerce';
console.log(dbUrl);
mongoose.connect(dbUrl)
    .then(() => {
        console.log('Database Connected');
    })
    .catch((err) => {
        console.log(err);
    })

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('ejs', ejsMate);

app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, '/public')))

const secret = process.env.SECRET || 'mySecretCode';
const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret
    }
});

store.on("error", function(e){
    console.log('session store error');
})

const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true,
    }
}

app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    if(!['/login', '/register'].includes(req.originalUrl)){
        req.session.returnTo = req.originalUrl;
    }
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currentUser = req.user;
    next();
})

//routes

app.use('/products', productRoutes);
app.use('/', userRoutes);

app.get('/', (req, res) => {
    res.render('home', {categories});
})

app.get('/whyus', (req, res) => {
    res.render('whyus');
})

app.get('/payment_success', (req, res) => {
    res.render('products/payment_success.ejs');
})

app.use('*', (req, res, next) => {
    next(new ExpressError('Error 404: Page Not Found', 404));
})

app.use((err, req, res, next) => {
    if(!err.message) err.message = 'Something Went Wrong';
    if(!err.statusCode) err.statusCode = 500;
    res.status(err.statusCode).render('error', {err});
})

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`listening on port ${port}`);
})