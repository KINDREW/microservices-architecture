const Product = require('../models/Product');
const { CircuitBreakerError } = require('opossum');

exports.createProduct = async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.status(201).json(product);
    } catch (err) {
        console.error('Error creating product:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getProducts = async () => {
    try {
        const products = await Product.find();
        return products;
    } catch (err) {
        throw new CircuitBreakerError('Error fetching products', err);
    }
};
