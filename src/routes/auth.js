const express = require('express');
const router = express.Router();
const { check,body } = require('express-validator');

const authController = require('../controller/auth');

const userModel = require('../models/user');

router.get('/login', authController.getLogin)
router.post('/login', [
    check('email', "Masukan e-mail yang valid").isEmail().normalizeEmail().withMessage("Masukan e-mail yang valid")
], authController.postLogin)

router.get('/signup', authController.getSignUp)
router.post('/signup',[ 
    check('email').isEmail().withMessage('Masukan e-mail yang valid')
    .normalizeEmail().custom(async (value, {req}) => {
        const cekUser = await userModel.findOne({email: value}).then(e=>e).catch(e=>console.log(e))
        if (cekUser) {
            return Promise.reject('Data email sudah terdaftar');
        }
        return true;
    }), 
    body('password', 'password minimal 4 karakter').trim().isLength({min: 4}).isAlphanumeric(),
    body('password2').custom((value, {req}) => {
        if (value !== req.body.password) {
            throw new Error('Password tidak sama');
        }
        return true;
    })
],
    authController.postSignUp);

router.post('/logout', authController.postLogout)

router.get('/reset_password', authController.getResetPassword)
router.post('/reset_password', authController.postResetPassword)
router.get('/reset_password/:token', authController.getNewPassword)
router.post('/new_password', authController.postNewPassword)

module.exports = router;