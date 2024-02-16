const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const shopRoutes = require('./routes/shop');

const mongoURI =
    'mongodb+srv://Badi:Noopgoogle123@cluster0.tgabpku.mongodb.net/eCommerce?retryWrites=true&w=majority';

const app = express();

app.use(bodyParser.json());

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

mongoose
    .connect(mongoURI)
    .then(app.listen(8080))
    .catch(err => console.log(err));
