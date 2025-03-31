import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance"; // Use the custom axios instance
import { Modal, Button } from "react-bootstrap"; // Import from react-bootstrap
import "./style/Navbar.css"; // Custom navbar CSS (optional)
import { Collapse } from "bootstrap";

function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // For Logout Confirmation Modal
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Fetch user info on component mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    axiosInstance
      .get("/users/me", {
        headers: { Authorization: token },
      })
      .then((res) => {
        setUser(res.data.user);
      })
      .catch(() => {
        // Handle errors (e.g., invalid token) by logging out the user
        localStorage.removeItem("token");
      });
  }, []);

  useEffect(() => {
    const collapseElement = document.getElementById("navbarToggler");
    if (collapseElement) {
      new Collapse(collapseElement, {
        toggle: false,
      });
    }
  }, []);

  // Actually perform logout
  const performLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Handle "Logout" button click
  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  // If user confirms logout in modal
  const confirmLogout = () => {
    setShowLogoutModal(false);
    performLogout();
  };

  // If user cancels logout in modal
  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const token = localStorage.getItem("token");

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
        <div className="container-fluid">
          <Link className="navbar-brand fw-bold" to="/">
            Resume Optimizer
          </Link>

          {/* Navbar Toggle */}
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

          {/* Collapsible Menu */}
          <div className="collapse navbar-collapse" id="navbarToggler">
            <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
              {token ? (
                <>
                  {/* Greeting */}
                  <li className="nav-item d-flex align-items-center me-3">
                    <span className="navbar-text">
                      Hello, {user?.name || "User"}
                    </span>
                  </li>

                  {/* Dashboard */}
                  <li className="nav-item">
                    <Link className="nav-link" to="/dashboard">
                      Dashboard
                    </Link>
                  </li>

                  {/* Resumes */}
                  <li className="nav-item">
                    <Link className="nav-link" to="/resumes">
                      Resumes
                    </Link>
                  </li>

                  {/* Jobs */}
                  <li className="nav-item">
                    <Link className="nav-link" to="/jobs">
                      Jobs
                    </Link>
                  </li>

                  {/* Admin (conditional) */}
                  {user?.is_admin && (
                    <li className="nav-item">
                      <Link className="nav-link" to="/admin">
                        Admin
                      </Link>
                    </li>
                  )}

                  {/* Logout */}
                  <li className="nav-item">
                    <button
                      className="btn btn-outline-light ms-3"
                      onClick={handleLogoutClick}
                    >
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

      {/* Logout Confirmation Modal */}
      <Modal
        show={showLogoutModal}
        onHide={cancelLogout}
        centered
        backdrop="static"
        keyboard={false}
        aria-labelledby="logout-confirmation-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title id="logout-confirmation-modal">
            Confirm Logout
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to log out?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={cancelLogout}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmLogout}>
            Logout
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default Navbar;
