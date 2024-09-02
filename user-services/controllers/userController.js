const User = require('../models/User');
const { CircuitBreakerError } = require('opossum');

exports.createUser = async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.status(201).json(user);
    } catch (err) {
        console.error('Error creating user:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getUsers = async () => {
    try {
        const users = await User.find();
        return users;
    } catch (err) {
        throw new CircuitBreakerError('Error fetching users', err);
    }
};
