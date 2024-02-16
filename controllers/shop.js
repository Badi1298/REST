const Item = require('../models/item');
const { validationResult } = require('express-validator');

exports.getItems = (req, res) => {
    Item.find()
        .then(items => {
            res.status(200).json({
                message: 'Fetched items successfully.',
                items,
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

exports.getItem = (req, res) => {
    const { itemId } = req.params;
    Item.findById(itemId)
        .then(item => {
            if (!item) {
                const error = new Error('Could not find item.');
                error.statusCode = 404;
                throw error;
            }

            res.status(200).json({ message: 'Item fetched', item });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

exports.createItem = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Invalid data.');
        error.statusCode = 422;
        throw error;
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
            res.status(201).json({
                message: 'Item created successfully!',
                item,
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

exports.deleteItem = (req, res) => {
    const { itemId } = req.params;

    Item.findByIdAndDelete(itemId)
        .then(item => {
            if (!item) {
                const error = new Error();
                error.statusCode = 404;
                throw error;
            }

            res.status(200).json({
                message: 'Successfully deleted the item.',
                item,
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};
