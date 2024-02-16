const express = require('express');
const { body, validationResult } = require('express-validator');

const shopController = require('../controllers/shop');

const Item = require('../models/item');

const router = express.Router();

router.get('/items', (req, res) => {
    res.status(200).json([
        {
            title: 'First Item',
            description: 'This is the first item!',
            imageUrl: 'image/interior.jpg',
        },
    ]);
});

router.post(
    '/item',
    [
        body('title')
            .trim()
            .isLength({ min: 5 })
            .withMessage('Minimum 5 characters length.'),
        body('description')
            .trim()
            .isLength({ min: 5 })
            .withMessage('Minimum 5 characters length.'),
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res
                .status(422)
                .json({ message: 'Invalid data.', errors: errors.array() });
        }

        const { title, description, imageUrl, creator } = req.body;
        const item = new Item({
            title,
            description,
            imageUrl,
            creator,
        });
        item.save()
            .then(item => {
                console.log(item);
                res.status(201).json({
                    message: 'Item created successfully!',
                    item,
                });
            })
            .catch(err => console.log(err));
    }
);

module.exports = router;
