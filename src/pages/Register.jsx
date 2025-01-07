import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      // Adjust the URL/endpoint accordingly
      const response = await axios.post('http://127.0.0.1:8000/users/register', {
        name,
        email,
        password
      });
      // You may receive { token } or something similar
      localStorage.setItem('token', 'Bearer ' + response.data.token);
      navigate('/dashboard');
    } catch (err) {
      console.error('Registration error:', err);
      alert('Registration failed.');
    }
  };

  return (
    <div className="d-flex justify-content-center">
      <form onSubmit={handleRegister} className="w-50">
        <h2 className="text-center my-3">Register</h2>
        <div className="mb-3">
          <label>Name:</label>
          <input
            className="form-control"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
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
        <button className="btn btn-success w-100" type="submit">
          Register
        </button>
      </form>
    </div>
  );
}

export default Register;
