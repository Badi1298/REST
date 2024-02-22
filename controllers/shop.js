const fs = require('fs');
const path = require('path');

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

exports.updateItem = (req, res, next) => {
    const errors = validationResult(req);
    const { itemId } = req.params;

    if (!errors.isEmpty()) {
        const error = new Error('Invalid data.');
        error.statusCode = 422;
        throw error;
    }

    const { title, description } = req.body;
    let { image } = req.body;

    if (req.file) {
        image = req.file.path.replace('\\', '/');
    }

    if (!image) {
        const error = new Error('No image provided.');
        error.statusCode = 422;
        throw error;
    }

    Item.findByIdAndUpdate(itemId)
        .then(item => {
            if (!item) {
                const error = new Error('Could not find item.');
                error.statusCode = 404;
                throw error;
            }

            if (image !== item.image) {
                clearImage(item.image);
            }

            item.title = title;
            item.description = description;
            item.image = image;

            return item.save();
        })
        .then(result => {
            return res.status(200).json({
                message: 'Item updated successfully',
                item: result,
            });
        })
        .catch(err => {
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

            clearImage(item.image);

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

const clearImage = filePath => {
    const imagePath = path.join(__dirname, '..', filePath);
    fs.unlink(imagePath, err => {
        if (err) throw err;
    });
};
