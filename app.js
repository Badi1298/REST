const path = require('path');

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

const mongoURI =
    'mongodb+srv://Badi:Noopgoogle123@cluster0.tgabpku.mongodb.net/eCommerce?retryWrites=true&w=majority';

const app = express();

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images/');
    },
    filename: (req, file, cb) => {
        cb(null, uuidv4());
    },
});

const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg'
    ) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

app.use(bodyParser.json());
app.use(
    multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
);
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, PATCH, DELETE'
    );
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization'
    );
    next();
});

app.use('/shop', shopRoutes);
app.use('/auth', authRoutes);

app.use((error, req, res, next) => {
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({ message, data });
});

mongoose
    .connect(mongoURI)
    .then(result => {
        const server = app.listen(8080);
        const io = require('./socket').init(server, {
            cors: {
                origin: '*',
                methods: ['GET', 'POST'],
            },
        });
        io.on('connection', socket => {
            console.log('client connected');
        });
    })
    .catch(err => console.log(err));
