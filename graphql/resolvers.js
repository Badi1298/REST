// The root provides a resolver function for each API endpoint
const root = {
    hello: () => {
        return 'Hello world!';
    },
};

module.exports = root;
