import React, { useEffect, useState } from 'react';

function MyComponent() {
  const [data, setData] = useState({ users: null, carts: null, joinInfo: null });
  
  async function synchronousCall() {
    const endpoints = [
      'http://localhost:8080/api/users',
      'http://localhost:8080/api/cart',
      'http://localhost:8080/api/join'
    ];

    try {
      for (const endpoint of endpoints) {
        const response = await fetch(endpoint);
        const responseData = await response.json();
        console.log(`Response from ${endpoint}:`, responseData);
    
        if (endpoint.includes('users')) setData(prev => ({ ...prev, users: responseData }));
        if (endpoint.includes('cart')) setData(prev => ({ ...prev, carts: responseData }));
        if (endpoint.includes('join')) setData(prev => ({ ...prev, joinInfo: responseData }));
      }
    } catch (error) {
      console.error('Error in synchronous call:', error);
     
    }
  }

  async function asynchronousCall() {
    const endpoints = [
      'http://localhost:8080/api/users',
      'http://localhost:8080/api/cart',
      'http://localhost:8080/api/join'
    ];

    try {
      const promises = endpoints.map(endpoint => fetch(endpoint).then(response => response.json()));
      const [users, carts, joinInfo] = await Promise.all(promises);
      setData({ users, carts, joinInfo });
    } catch (error) {
      console.error('Error in asynchronous call:', error);
      // Handle errors appropriately
    }
  }

  useEffect(() => {
    // Replace 'synchronousCall' with 'asynchronousCall' to test the other function
    synchronousCall();
  }, []);

  return (
    <div>
      {/* Render your UI based on the data */}
    </div>
  );
}

export default MyComponent;

