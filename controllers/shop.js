const fs = require('fs');
const path = require('path');

const io = require('../socket');

const Item = require('../models/item');
const User = require('../models/user');

const { validationResult } = require('express-validator');

exports.getItems = async (req, res, next) => {
    const { skip, limit } = req.query;

    try {
        const totalItems = await Item.find().countDocuments();
        const items = await Item.find().skip(skip).limit(limit);
        res.status(200).json({
            message: 'Fetched items successfully.',
            items,
            totalItems,
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.getMyItems = async (req, res, next) => {
    const userId = req.userId;

    try {
        const items = await Item.find({ creator: userId });
        res.status(200).json({
            message: 'Fetched items successfully.',
            items,
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
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

    let creator;
    const userId = req.userId;
    const { title, description } = req.body;
    const image = req.file.path.replace('\\', '/');
    const item = new Item({
        title,
        description,
        image,
        creator: userId,
    });

    item.save()
        .then(() => {
            return User.findById(userId);
        })
        .then(user => {
            creator = user;
            user.items.push(item);
            return user.save();
        })
        .then(result => {
            io.getIo().emit('items', { action: 'create', item });

            res.status(201).json({
                message: 'Item created successfully!',
                item,
                creator: { id: creator._id, name: creator.name },
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

    Item.findById(itemId)
        .then(item => {
            if (!item) {
                const error = new Error('Could not find item.');
                error.statusCode = 404;
                throw error;
            }

            if (item.creator.toString() !== req.userId) {
                const error = new Error(
                    'The item does not belong to this user.'
                );
                error.statusCode = 403;
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
            io.getIo().emit('items', { action: 'update', item: result });

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
    let itemToDelete;
    const { itemId } = req.params;

    Item.findByIdAndDelete(itemId)
        .then(item => {
            if (!item) {
                const error = new Error('Could not find post.');
                error.statusCode = 404;
                throw error;
            }

            if (item.creator.toString() !== req.userId) {
                const error = new Error(
                    'The item does not belong to this user.'
                );
                error.statusCode = 403;
                throw error;
            }

            itemToDelete = item;
            clearImage(item.image);

            return User.findById(req.userId);
        })
        .then(user => {
            user.items.pull(itemId);
            return user.save();
        })
        .then(() => {
            res.status(200).json({
                message: 'Successfully deleted the item.',
                item: itemToDelete,
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
