const express = require('express');
const { body } = require('express-validator');

const shopController = require('../controllers/shop');

const router = express.Router();

router.get('/items', shopController.getItems);

router.get('/item/:itemId', shopController.getItem);

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
    shopController.createItem
);

router.patch(
    '/item/:itemId',
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
    shopController.updateItem
);

router.delete('/items/:itemId', shopController.deleteItem);

module.exports = router;
