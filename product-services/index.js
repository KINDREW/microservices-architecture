const express = require('express');
const mongoose = require('mongoose');
const amqp = require('amqplib/callback_api');
const Consul = require('consul');
const { initTracer } = require('./tracing');
const { CircuitBreaker, CircuitBreakerError } = require('opossum');
const productRoutes = require('./routes/productRoutes');
const { getProducts } = require('./controllers/productController');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3002;
const consul = new Consul({ host: process.env.CONSUL_HOST || 'localhost', port: process.env.CONSUL_PORT || 8500 });

app.use(express.json());
initTracer();

// Circuit Breaker Setup
const breakerOptions = {
    timeout: 5000,
    errorThresholdPercentage: 50,
    resetTimeout: 30000
};
const productServiceBreaker = new CircuitBreaker(async () => {
    return await getProducts();
}, breakerOptions);

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

amqp.connect(process.env.RABBITMQ_URL, (error0, connection) => {
    if (error0) {
        console.error('RabbitMQ connection error:', error0);
        process.exit(1);
    }
    connection.createChannel((error1, channel) => {
        if (error1) {
            console.error('RabbitMQ channel creation error:', error1);
            process.exit(1);
        }

        const queue = 'productQueue';
        channel.assertQueue(queue, { durable: false });

        channel.consume(queue, (msg) => {
            if (msg !== null) {
                console.log(" [x] Received %s", msg.content.toString());
                channel.ack(msg);
            }
        });

        app.use('/products', productRoutes);

        app.get('/products', async (req, res) => {
            try {
                const result = await productServiceBreaker.fire(req);
                res.json(result);
            } catch (error) {
                if (error instanceof CircuitBreakerError) {
                    console.error('Circuit breaker error:', error);
                    res.status(503).json({ message: 'Service unavailable' });
                } else {
                    console.error('Error fetching products:', error);
                    res.status(500).json({ message: 'Internal server error' });
                }
            }
        });

        app.listen(port, () => {
            console.log(`Product service running on port ${port}`);

            // Register service with Consul
            consul.agent.service.register({
                id: 'product-service',
                name: 'product-service',
                address: 'localhost',
                port: port,
                tags: ['products'],
                check: {
                    http: `http://localhost:${port}/products`,
                    interval: '10s'
                }
            }, (err) => {
                if (err) {
                    console.error('Error registering service with Consul:', err);
                    process.exit(1);
                }
            });

            // Handle graceful shutdown
            process.on('SIGINT', () => {
                consul.agent.service.deregister('product-service', (err) => {
                    if (err) {
                        console.error('Error deregistering service from Consul:', err);
                    }
                    process.exit(0);
                });
            });
        });
    });
});
