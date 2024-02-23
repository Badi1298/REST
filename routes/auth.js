const express = require('express');
const { body } = require('express-validator');

const User = require('../models/user');
const authController = require('../controllers/auth');

const router = express.Router();

router.put(
    '/signup',
    [
        body('email')
            .isEmail()
            .withMessage('Please enter a valid email.')
            .custom(async value => {
                const user = await User.findOne({ email: value });
                if (user) {
                    throw new Error('E-mail already in use');
                }
            })
            .normalizeEmail(),
        body('name').trim().not().isEmpty(),
        body('password').trim().isLength({ min: 5 }),
        body('confirmPassword')
            .trim()
            .custom((value, { req }) => {
                return value === req.body.password;
            })
            .withMessage('Passwords do not match.'),
    ],
    authController.signup
);

module.exports = router;
