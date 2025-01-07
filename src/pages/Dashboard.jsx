import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Example call to a protected endpoint
    axios
      .get('http://localhost:8000/users/me', {
        headers: { Authorization: token },
      })
      .then((response) => {
        setUser(response.data.user);
      })
      .catch((error) => {
        console.error('Failed to fetch user info:', error);
      });
  }, []);

  return (
    <div>
      <h2>Dashboard</h2>
      {user ? (
        <div>
          <p>Welcome, {user.name}!</p>
          <p>Your email: {user.email}</p>
          <p>Admin user: {user.is_admin ? 'Yes' : 'No'}</p>
        </div>
      ) : (
        <p>Loading user info...</p>
      )}
    </div>
  );
}

export default Dashboard;
