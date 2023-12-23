// democalls.js

const fetch = require('node-fetch');

const token = '';

async function fetchData(endpoint) {
    try {
        const response = await fetch(endpoint, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errorDetails = await response.text();
            throw new Error(`HTTP error! Status: ${response.status}. Details: ${errorDetails}`);
        }

        const data = await response.json();
        console.log(`${new Date().toISOString()} - Response from ${endpoint}:`, data);
        return data;
    } catch (error) {
        console.error(`Error fetching from ${endpoint}:`, error);
        throw error;
    }
}

async function demonstrateSynchronous(services) {
    for (const service of services) {
        await fetchData(service);
    }
}

async function demonstrateAsynchronous(services) {
    const promises = services.map(service => fetchData(service));
    await Promise.all(promises);
}

(async function main() {
    const services = ['http://localhost:8080/api/users', 'http://localhost:8080/api/cart', 'http://localhost:8080/api/join'];
    const demoType = process.argv[2];

    try {
        if (demoType === 'sync') {
            console.log("Starting synchronous demonstration:");
            await demonstrateSynchronous(services);
            console.log("Finished synchronous demonstration");
        } else if (demoType === 'async') {
            console.log("Starting asynchronous demonstration:");
            for (let i = 0; i < 10; i++) {
                console.log(`Asynchronous iteration: ${i + 1}`);
                await demonstrateAsynchronous(services);
            }
            console.log("Finished asynchronous demonstration");
        } else {
            console.log("Please specify 'sync' or 'async' as a command line argument.");
        }
    } catch (error) {
        console.error("Error during demonstration:", error);
    }
})();
