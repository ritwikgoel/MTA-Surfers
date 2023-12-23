const fetch = require('node-fetch');


async function synchronousCallWithLogging() {
  const endpoints = [
    'http://localhost:8080/api/users',
    'http://localhost:8080/api/cart',
    'http://localhost:8080/api/join'
  ];

  for (const endpoint of endpoints) {
    console.log(`Requesting from ${endpoint}`);
    const response = await fetch(endpoint);
    const data = await response.json();
    console.log(`Response from ${endpoint}:`, data);
  }
  console.log("All synchronous requests are complete.");
}

synchronousCallWithLogging(); 


async function asynchronousCallWithLogging() {
  const endpoints = [
    'http://localhost:8080/api/users',
    'http://localhost:8080/api/cart',
    'http://localhost:8080/api/join'
  ];

  for (let i = 0; i < 10; i++) {
    console.log(`Iteration ${i + 1}`);

    // Mapping each endpoint to a fetch request
    const promises = endpoints.map(endpoint =>
      fetch(endpoint).then(response => response.json())
    );

    // Waiting for all promises to resolve
    const responses = await Promise.all(promises);

    responses.forEach((data, index) => {
      console.log(`Response from ${endpoints[index]} in iteration ${i + 1}:`, data);
    });

    console.log(`Completed iteration ${i + 1}`);
  }
}

asynchronousCallWithLogging();
