const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { validationResult } = require('express-validator');

const User = require('../models/user');

exports.signup = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Invalid data.');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }

    const { email, name, password } = req.body;

    bcrypt
        .hash(password, 12)
        .then(hashedPassword => {
            const user = new User({
                email,
                name,
                password: hashedPassword,
            });
            return user.save();
        })
        .then(result => {
            res.status(201).json({
                message: 'User Created!',
                userId: result._id,
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

exports.login = (req, res, next) => {
    let loadedUser;
    const { email, password } = req.body;

    User.findOne({ email })
        .then(user => {
            if (!user) {
                const error = new Error(
                    'A user with this email could not be found.'
                );
                error.statusCode = 401;
                throw error;
            }

            loadedUser = user;
            return bcrypt.compare(password, user.password);
        })
        .then(isEqual => {
            if (!isEqual) {
                const error = new Error('Wrong password.');
                error.statusCode = 401;
                throw error;
            }

            const token = jwt.sign(
                {
                    userId: loadedUser._id.toString(),
                    email: loadedUser.email,
                },
                'shhhhh',
                { expiresIn: '1h' }
            );

            res.status(200).json({ userId: loadedUser._id.toString(), token });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

exports.me = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId);
        res.status(200).json({
            message: 'Succesfully fetched user data.',
            user,
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};
