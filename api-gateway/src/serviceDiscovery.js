const Consul = require('consul');
const consul = new Consul({
    host: process.env.CONSUL_HOST || 'localhost',
    port: process.env.CONSUL_PORT || 8500,
    promisify: true
});

let serviceCache = {};

// Function to retrieve the service URL
const getServiceUrl = async (serviceName) => {
    // Check if service URL is cached
    if (serviceCache[serviceName]) {
        return serviceCache[serviceName];
    }

    try {
        // Get list of services registered with Consul
        const serviceList = await consul.catalog.service.nodes(serviceName);
        const service = serviceList[0];

        if (service) {
            const url = `http://${service.ServiceAddress}:${service.ServicePort}`;
            // Cache the URL for future use
            serviceCache[serviceName] = url;
            return url;
        } else {
            throw new Error(`Service ${serviceName} not found`);
        }
    } catch (err) {
        console.error(`Error retrieving service URL from Consul for ${serviceName}:`, err);
        throw err;
    }
};

// Periodic cache invalidation to account for changes in service addresses
setInterval(() => {
    serviceCache = {};
}, 300000); // Clear cache every 5 minutes

module.exports = { getServiceUrl };
