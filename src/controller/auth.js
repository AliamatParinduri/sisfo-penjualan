const path = require('path');
const rootDir = require('../util/path');

const nodemailer = require('nodemailer');

const userModel = require('../models/user');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const { validationResult } = require('express-validator/check');

// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
port: 465,               // true for 465, false for other ports
host: "smtp.gmail.com",
    auth: {
            user: 'youremail@gmail.com',
            pass: 'yourpassword',
        },
secure: true,
});

const getLogin = (req,res,next) => {
    res.render(path.join(rootDir, 'src', 'views', 'auth', 'login'),{
        pageTitle: 'Login',
        path: '/login',
        oldInput: {
            email: "",
            password: ""
        },
        validationErrors: []
    })
}

const postLogin = async (req,res,next) => {
    const email = req.body.email;
    const password = req.body.password;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).render(path.join(rootDir, 'src', 'views', 'auth', 'login'),{
            pageTitle: 'login',
            path: '/login',
            errorMessage: errors.array()[0].msg,
            oldInput: {email,password},
            validationErrors: [errors.array()[0]]
        });
    }

    const user = await userModel.findOne({email}).then(e=>e).catch(e=>console.log(e));
    
    if (!user) {
        return res.status(422).render(path.join(rootDir, 'src', 'views', 'auth', 'login'),{
            pageTitle: 'login',
            path: '/login',
            errorMessage: "Data tidak ditemukan.",
            oldInput: {email,password},
            validationErrors: [{param: 'email'}]
        });
    }
    const comparedPassword = await bcrypt.compare(password, user.password).then(e=>e).catch(err => console.log(err));

    if (!comparedPassword) {
        return res.status(422).render(path.join(rootDir, 'src', 'views', 'auth', 'login'),{
            pageTitle: 'login',
            path: '/login',
            errorMessage: "Password salah.",
            oldInput: {email,password},
            validationErrors: [{param: 'password'}]
        });
    }

    req.session.user = user;
    req.session.isLoggedIn = true; 
    res.redirect('/');
}

const getSignUp = async (req,res,next) => {
    res.render(path.join(rootDir, 'src', 'views', 'auth', 'signup'),{
        pageTitle: 'signup',
        path: '/signup',
        oldInput: {
            email: "",
            password: "",
            password2: "",
        },
        validationErrors: []
    })
}

const postSignUp = async (req,res,next) => {

    const email = req.body.email;
    const password = req.body.password;
    const password2 = req.body.password2;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).render(path.join(rootDir, 'src', 'views', 'auth', 'signup'),{
            pageTitle: 'signup',
            path: '/signup',
            errorMessage: errors.array()[0].msg,
            oldInput: {email,password,password2},
            validationErrors: [errors.array()[0]]
        });
    }
    
    try {
        const newPassword = await bcrypt.hash(password, 12).then(e=>e).catch(e=>console.log(e))
        userModel.create({
            email: email,
            password: newPassword,
            cart: {
                items: []
            },
        })

        const mailData = {
            from: 'personalia@gmail.com',  // sender address
            to: req.body.email,   // list of receivers
            subject: 'Signup succeeded!',
            // text: text,
            html: `<b>Hey there! </b>
                    <br> This is our first message sent with Nodemailer<br/>`,
        };

        transporter.sendMail(mailData, function (err, info) {
            if(err) {
                return console.log(err)
            }
            // res.status(200).send({message:"Mail send", message_id: info.messageId});
        });

    } catch (err) {
        console.log(err)
    }
    res.redirect('/login')
}

const postLogout = (req,res,next) => {
    req.session.destroy(err=>{
        console.log(err);
        res.redirect('/'); 
    });
}

const getResetPassword = (req,res,next) => {
    res.render(path.join(rootDir, 'src', 'views', 'auth', 'reset_password'),{
        pageTitle: 'reset_password',
        path: '/reset_password',
    })
}

const postResetPassword = (req,res,next) => {
    crypto.randomBytes(32, async (err, buffer) => {
        if (err) return res.redirect('reset');

        const token = buffer.toString('hex');
        const user = await userModel.findOne({email: req.body.email}).then(e =>e).catch(e=>console.log(e));
        
        if (!user) {
            req.flash('error', 'Account Tidak Ditemukan');
            return res.redirect('/reset_password');
        }

        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        user.save();
        
        const mailData = {
            from: 'personalia@gmail.com',  // sender address
            to: req.body.email,   // list of receivers
            subject: 'Password reset!',
            // text: text,
            html: `<p>Kamu telah meminta request reset password</p>
                <p>click <a href="http://localhost:3000/reset_password/${token}">link ini</a> untuk membuat password baru</p>
            `,
        };
        res.redirect('/');
        transporter.sendMail(mailData, function (err, info) {
            if(err) {
                return console.log(err)
            }
        });
    })
};

const getNewPassword = async (req,res,next) => {
    const resetToken = req.params.token;
    const user = await userModel.findOne({resetToken, resetTokenExpiration: {$gt: Date.now()}}).then(e=>e).catch(e=>console.log(e));

    if (user) {
        res.render(path.join(rootDir, 'src', 'views', 'auth', 'new_password'),{
            pageTitle: 'New Password',
            path: '/new_password',
            userId: user._id.toString(),
            userToken: resetToken.toString()
        })
    }
}

const postNewPassword = async (req,res,next) => {
    const password = req.body.password;
    const confirmPassword = req.body.password2;
    const resetToken = req.body.resetToken;
    const _id = req.body._id;
    
    if (password !== confirmPassword) {
        req.flash("error", "Password Tidak Cocok, ");
        return res.redirect(`/reset_password/${resetToken}`);
    }
    const user = await userModel.findOne({resetToken, resetTokenExpiration: {$gt: Date.now()}, _id}).then(e=>e).catch(e=>console.log(e));
    
    if (!user) {
        req.flash("error", "User Tidak Ditemukan");
        return res.redirect('/login');
    }

    const hashPassword = await bcrypt.hash(password,12).then(e=>e).catch(e=>console.log(e));
    user.password = hashPassword;
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    user.save();
    
    res.redirect('/login');
}

module.exports = {getLogin,postLogin,postLogout,getSignUp,postSignUp,getResetPassword,postResetPassword,getNewPassword,postNewPassword}