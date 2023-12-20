// Component.jsx

import React, { useEffect, useState } from 'react';
import { synchronousCall, asynchronousCall } from './utility';

function SomeComponent() {
  const [data, setData] = useState({ users: null, carts: null, joinInfo: null });

  useEffect(() => {
    // Choose either synchronousCall or asynchronousCall
    synchronousCall()
      .then(data => setData(data))
      .catch(error => {
        // Handle error here
        console.error('Error fetching data:', error);
      });
  }, []);

  return (
    <div>
      {/* Render your UI based on the data */}
    </div>
  );
}

export default SomeComponent;

