const Order = require('../models/Order');
const { CircuitBreakerError } = require('opossum');

exports.createOrder = async (req, res) => {
    try {
        const order = new Order(req.body);
        await order.save();
        res.status(201).json(order);
    } catch (err) {
        console.error('Error creating order:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getOrders = async () => {
    try {
        const orders = await Order.find();
        return orders;
    } catch (err) {
        throw new CircuitBreakerError('Error fetching orders', err);
    }
};
