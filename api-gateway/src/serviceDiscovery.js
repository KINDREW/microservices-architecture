const Consul = require('consul');
const consul = new Consul({
    host: 'localhost',
    port: 8500,
    promisify: true
});

let serviceCache = {};

const getServiceUrl = async (serviceName) => {
    if (serviceCache[serviceName]) {
        return serviceCache[serviceName];
    }
    try {
        const services = await consul.catalog.service.list();
        const service = services[serviceName];
        if (service && service.length > 0) {
            const url = `http://${service[0].ServiceAddress}:${service[0].ServicePort}`;
            serviceCache[serviceName] = url;
            return url;
        } else {
            throw new Error('Service not found');
        }
    } catch (err) {
        console.error('Error getting service URL from Consul:', err);
        throw err;
    }
};

module.exports = { getServiceUrl };
