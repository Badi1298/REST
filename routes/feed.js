const express = require('express');

const feedController = require('../controllers/feed');

const router = express.Router();

// GET /feed/posts
router.get('/posts', (req, res) => {
    res.status(200).json({
        posts: [{ title: 'First Post', content: 'This is the first post!' }],
    });
});

router.post('/post', (req, res) => {
    const { title, content } = req.body;

    res.status(201).json({
        message: 'Post created successfully!',
        post: { id: new Date().toISOString(), title, content },
    });
});

module.exports = router;
