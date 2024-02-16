const express = require('express');

const shopController = require('../controllers/shop');

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

router.post('/post', (req, res) => {
    const { title, content } = req.body;

    res.status(201).json({
        message: 'Post created successfully!',
        post: { id: new Date().toISOString(), title, content },
    });
});

module.exports = router;
