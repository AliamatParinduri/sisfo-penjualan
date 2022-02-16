const express = require('express');
const app = express();
const port = process.env.port || '3000';

const session = require('express-session');
const csrf = require('csurf');

const mongoDB_Uri = "mongodb://127.0.0.1:27017/shop";
const mongoDBStore = require('connect-mongodb-session')(session);
const store = new mongoDBStore({
    uri: mongoDB_Uri,
    collection: 'sessions'
});

const csrfProtection = csrf();

const mongoose = require('mongoose');
mongoose.connect(mongoDB_Uri);

const path = require('path');
const bodyParser = require('body-parser');
const flash = require('connect-flash');

const authRoutes = require('./src/routes/auth');
const adminRoutes = require('./src/routes/admin');
const shopRoutes = require('./src/routes/shop');

const rootDir = require('./src/util/path');

const userModel = require('./src/models/user');
const { errorNotFound } = require('./src/controller/error');

app.set('view engine', 'ejs');
app.set('views', 'src/views');

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

app.use(express.static(path.join(rootDir, "src", "public")))

app.use(session({secret: 'aliamat parinduri', resave: false, saveUninitialized: false, store: store}))
app.use(csrfProtection);
app.use(flash());

app.use(async (req,res,next) => {
    if (req.session.user) {
        const user = await userModel.findById(req.session.user._id);
        if (user) {
            req.user = user;
        }
    }
    next();
})

app.use((req,res,next) => {
    let messageError = req.flash('error');
    messageError = messageError.length > 0 ? messageError[0] : null;

    res.locals.errorMessage = messageError 
    res.locals.isAuthenticated = req.session.isLoggedIn 
    res.locals.csrfToken = req.csrfToken();
    next();
})

app.use('/admin', adminRoutes.router);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorNotFound)

app.listen(port, async () => {
    console.log(`server running in http://localhost:${port}`)
});