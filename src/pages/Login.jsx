import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

 const handleLogin = async (e) => {
  e.preventDefault(); // Prevent form submission

  try {
    const { data } = await axios.post('http://127.0.0.1:8000/users/login', { email, password });
    localStorage.setItem('token', `Bearer ${data.access_token}`); // Save token
    navigate('/dashboard'); // Redirect on success
  } catch (err) {
    console.error('Login error:', err.response?.data || err.message); // Debugging log
    alert(err.response?.data?.detail || 'Login failed. Please check your credentials.');
  }
};

  
  

  return (
    <div className="d-flex justify-content-center">
      <form onSubmit={handleLogin} className="w-50">
        <h2 className="text-center my-3">Login</h2>
        <div className="mb-3">
          <label>Email:</label>
          <input
            className="form-control"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label>Password:</label>
          <input
            className="form-control"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button className="btn btn-primary w-100" type="submit">
          Login
        </button>
      </form>
    </div>
  );
}

export default Login;
