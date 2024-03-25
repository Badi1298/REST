const path = require('path');

const { buildSchema } = require('graphql');
const { createHandler } = require('graphql-http/lib/use/express');

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const User = require('./models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const validator = require('validator');

const mongoURI =
    'mongodb+srv://Badi:Noopgoogle123@cluster0.tgabpku.mongodb.net/eCommerce?retryWrites=true&w=majority';

// Construct a schema, using GraphQL schema language
const schema = buildSchema(`
    type AuthData {
        token: String!
        userId: String!
    }

    type RootQuery {
        login(email: String!, password: String!): AuthData!
    }

    type Item {
        _id: ID!
        title: String!
        description: String!
        image: String!
        creator: User!
        createdAt: String!
        updatedAt: String!
    }

    type User {
        _id: ID!
        name: String!
        email: String!
        password: String
        status: String!
        items: [Item!]!
        createdAt: String!
        updatedAt: String!
    }

    input UserInputData {
        email: String!
        name: String!
        password: String!
    }

    type RootMutation {
        createUser(userInput: UserInputData): User!
    }

    schema {
        query: RootQuery
        mutation: RootMutation
    }
`);

// The root provides a resolver function for each API endpoint
const root = {
    login: async ({ email, password }) => {
        const user = await User.findOne({ email });

        if (!user) {
            const error = new Error('User not found.');
            error.code = 401;
            throw error;
        }

        const isEqual = await bcrypt.compare(password, user.password);

        if (!isEqual) {
            const error = new Error('Password is incorrect.');
            error.code = 401;
            throw error;
        }

        const token = jwt.sign(
            {
                userId: user._id.toString(),
                email: user.email,
            },
            'shhhhh',
            { expiresIn: '1h' }
        );

        return { token, userId: user._id.toString() };
    },

    createUser: async ({ userInput }, req) => {
        const errors = [];
        if (!validator.isEmail(userInput.email)) {
            errors.push({ message: 'Email is invalid.' });
        }

        if (
            validator.isEmpty(userInput.password) ||
            !validator.isLength(userInput.password, { min: 5 })
        ) {
            errors.push({ message: 'Password too short.' });
        }

        if (errors.length > 0) {
            const error = new Error('Invalid input.');
            error.data = errors;
            error.code = 422;
            throw error;
        }

        const existingUser = await User.findOne({ email: userInput.email });
        if (existingUser) {
            const error = new Error('User exists already');
            throw error;
        }

        const hashedPassword = await bcrypt.hash(userInput.password, 12);
        const user = new User({
            email: userInput.email,
            name: userInput.name,
            password: hashedPassword,
        });

        const createdUser = await user.save();
        return { ...createdUser._doc, _id: createdUser._id.toString() };
    },
};

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

    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }

    next();
});

// Create and use the GraphQL handler.
app.all(
    '/graphql',
    createHandler({
        schema: schema,
        rootValue: root,
        formatError(err) {
            if (!err.originalError) return err;

            const data = err.originalError.data;
            const message = err.message || 'An error occured.';
            const code = err.originalError.code;

            return { message, data, status: code };
        },
    })
);

app.use((error, req, res, next) => {
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({ message, data });
});

mongoose
    .connect(mongoURI)
    .then(result => {
        app.listen(8080);
    })
    .catch(err => console.log(err));
