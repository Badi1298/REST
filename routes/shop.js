const express = require('express');
const { body } = require('express-validator');

const shopController = require('../controllers/shop');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/items', shopController.getItems);

router.get('/item/:itemId', shopController.getItem);

router.post(
    '/item',
    isAuth,
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
    isAuth,
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

router.delete('/items/:itemId', isAuth, shopController.deleteItem);

module.exports = router;
