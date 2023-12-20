// utility.js

// Fetches data from each endpoint in sequence
export async function synchronousCall() {
  const endpoints = [
    'http://localhost:8080/api/users',
    'http://localhost:8080/api/cart',
    'http://localhost:8080/api/join'
  ];

  let results = {};
  try {
    for (const endpoint of endpoints) {
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log(`Response from ${endpoint}:`, data);

      // Store data in a structured way
      if (endpoint.includes('users')) {
        results.users = data;
      } else if (endpoint.includes('cart')) {
        results.carts = data;
      } else if (endpoint.includes('join')) {
        results.joinInfo = data;
      }
    }
    return results;
  } catch (error) {
    console.error('Error in synchronous call:', error);
    throw error;
  }
}

export async function asynchronousCall() {
  const endpoints = [
    'http://localhost:8080/api/users',
    'http://localhost:8080/api/cart',
    'http://localhost:8080/api/join'
  ];

  try {
    const promises = endpoints.map(endpoint => fetch(endpoint).then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    }));

    const [users, carts, joinInfo] = await Promise.all(promises);
    return { users, carts, joinInfo };
  } catch (error) {
    console.error('Error in asynchronous call:', error);
    // Handle or rethrow error as needed
    throw error;
  }
}

