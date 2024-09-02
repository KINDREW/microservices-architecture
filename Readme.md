# Microservices Architecture Project

This project is a microservice-based architecture that consists of multiple services to manage users, products, and orders. Each service is responsible for a specific domain and can be independently developed, deployed, and scaled.


## Architecture Overview

This project is structured around a microservices architecture where each service manages a specific domain:

- **User Service**: Manages user data and user-related operations.
- **Product Service**: Handles product data and product-related operations.
- **Order Service**: Manages orders and order-related operations.

Each service communicates with others using HTTP and AMQP (via RabbitMQ) for messaging. The services are designed to be loosely coupled and independently deployable.

## Services

### User Service

The **User Service** is responsible for managing user-related operations such as creating, retrieving, and storing user data.

- **Port**: `3001`
- **Endpoints**:
  - `POST /users`: Create a new user.
  - `GET /users`: Retrieve all users.

### Product Service

The **Product Service** manages product-related operations, including adding, retrieving, and storing product data.

- **Port**: `3002`
- **Endpoints**:
  - `POST /products`: Create a new product.
  - `GET /products`: Retrieve all products.

### Order Service

The **Order Service** handles order-related operations, such as creating, retrieving, and storing order data.

- **Port**: `3003`
- **Endpoints**:
  - `POST /orders`: Create a new order.
  - `GET /orders`: Retrieve all orders.

## Technologies Used

- **Node.js**: JavaScript runtime for building the services.
- **Express.js**: Web framework for building APIs.
- **MongoDB**: NoSQL database for storing service data.
- **RabbitMQ**: Message broker for asynchronous communication between services.
- **Consul**: Service discovery and configuration tool.
- **Opossum**: Node.js circuit breaker implementation.
- **OpenTelemetry**: Tracing for distributed systems.

## Installation and Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/kindrew/microservices-architecture.git
   cd microservices-architecture
   ```

2. Install dependencies for each service:
   ```bash
   cd user-service
   npm install
   cd ../product-service
   npm install
   cd ../order-service
   npm install
   ```

3. Configure environment variables:
   - Create a `.env` file in each service's directory.
   - Define the necessary environment variables like `PORT`, `MONGODB_URI`, `RABBITMQ_URL`, `CONSUL_HOST`, etc.

4. Start each service:
   ```bash
   cd user-service
   npm start
   cd ../product-service
   npm start
   cd ../order-service
   npm start
   ```

## Service Discovery

This project uses Consul for service discovery. Each service registers itself with Consul, allowing other services to discover it dynamically. Consul also provides health checks to monitor the status of each service.

## Circuit Breaker

Opossum is used to implement a circuit breaker pattern for external service calls. This helps to handle failures gracefully and avoid cascading failures in the system.

## Tracing

OpenTelemetry is integrated into the services to provide distributed tracing, which helps in monitoring and debugging the microservices.


## Contributing

Contributions are welcome! Please open an issue or submit a pull request to contribute to this project.

