import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './style/Navbar.css'

function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Fetch user info on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    axios
      .get('http://127.0.0.1:8000/users/me', {
        headers: { Authorization: token },
      })
      .then((res) => {
        setUser(res.data.user);
      })
      .catch(() => {
        // Handle errors (e.g., invalid token) by logging out the user
        localStorage.removeItem('token');
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const token = localStorage.getItem('token');

  return (
    <nav className="navbar navbar-expand-lg">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">
          Resume Optimizer
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarToggler"
          aria-controls="navbarToggler"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="navbarToggler">
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
            {token ? (
              <>
                <li className="nav-item"  style={{ paddingTop: '8px' }}>
                  <span className="navbar-text me-3">
                    Hello, {user?.name || 'User'}
                  </span>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/dashboard">
                    Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/resumes">
                    Resumes
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/jobs">
                    Jobs
                  </Link>
                </li>
                {user?.is_admin && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/admin">
                      Admin
                    </Link>
                  </li>
                )}
                <li className="nav-item">
                  <button className="btn btn-outline-light" onClick={handleLogout}>
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/register">
                    Register
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">
                    Login
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
