const fs = require('fs');

const Item = require('../models/item');
const { validationResult } = require('express-validator');

exports.getItems = (req, res, next) => {
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

exports.getItem = (req, res, next) => {
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

exports.createItem = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Invalid data.');
        error.statusCode = 422;
        throw error;
    }

    if (!req.file) {
        const error = new Error('No image provided');
        error.statusCode = 422;
        throw error;
    }

    const { title, description, creator } = req.body;
    const image = req.file.path.replace('\\', '/');
    const item = new Item({
        title,
        description,
        image,
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
            console.log(err);
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

exports.deleteItem = (req, res, next) => {
    const { itemId } = req.params;

    Item.findByIdAndDelete(itemId)
        .then(item => {
            if (!item) {
                const error = new Error();
                error.statusCode = 404;
                throw error;
            }

            fs.unlink(item.image, err => {
                if (err) throw err;
            });

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
