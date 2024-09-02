const express = require('express');
const axios = require('axios');
const { getServiceUrl } = require('./serviceDiscovery');
const { authenticateJWT } = require('./authMiddleware');
const { CircuitBreaker, CircuitBreakerError } = require('opossum');
const { initTracer } = require('./tracing');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
initTracer();

// Circuit Breaker Setup
const breakerOptions = {
    timeout: 5000, // How long to wait for a service call to respond
    errorThresholdPercentage: 50, // Error percentage to trigger open state
    resetTimeout: 30000 // Time to wait before transitioning to half-open state
};

// Create Circuit Breakers for each service
const userServiceBreaker = new CircuitBreaker(createProxyHandler('user-service'), breakerOptions);
const orderServiceBreaker = new CircuitBreaker(createProxyHandler('order-service'), breakerOptions);
const productServiceBreaker = new CircuitBreaker(createProxyHandler('product-service'), breakerOptions);

// Route handlers with authentication and circuit breaking
app.use('/users', authenticateJWT, async (req, res) => {
    try {
        const result = await userServiceBreaker.fire(req);
        res.status(result.status).send(result.data);
    } catch (err) {
        if (err instanceof CircuitBreakerError) {
            res.status(503).json({ error: 'Service unavailable' });
        } else {
            res.status(500).json({ error: 'Failed to fetch users' });
        }
    }
});

app.use('/orders', authenticateJWT, async (req, res) => {
    try {
        const result = await orderServiceBreaker.fire(req);
        res.status(result.status).send(result.data);
    } catch (err) {
        if (err instanceof CircuitBreakerError) {
            res.status(503).json({ error: 'Service unavailable' });
        } else {
            res.status(500).json({ error: 'Failed to fetch orders' });
        }
    }
});

app.use('/products', authenticateJWT, async (req, res) => {
    try {
        const result = await productServiceBreaker.fire(req);
        res.status(result.status).send(result.data);
    } catch (err) {
        if (err instanceof CircuitBreakerError) {
            res.status(503).json({ error: 'Service unavailable' });
        } else {
            res.status(500).json({ error: 'Failed to fetch products' });
        }
    }
});

// Start server
app.listen(port, () => {
    console.log(`API Gateway running on port ${port}`);
});
