// src/components/Register.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance"; // Use the custom axios instance
import { FaRegEye } from "react-icons/fa";
import {
  Form,
  Button,
  Container,
  Row,
  Col,
  InputGroup,
  Alert,
  Spinner,
} from "react-bootstrap";
import "./style/Register.css"; // Ensure this path is correct based on your project structure

function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // State to toggle password visibility for both fields
  const [showPassword, setShowPassword] = useState(false);

  // State for handling loading state
  const [loading, setLoading] = useState(false);

  // State for handling validation errors
  const [error, setError] = useState("");

  // Handle form submission
  const handleRegister = async (e) => {
    e.preventDefault(); // Prevent form from submitting

    // Reset error message
    setError("");

    // Basic validation to check if passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true); // Start loading

    try {
      // Adjust the URL/endpoint accordingly
      const response = await axiosInstance.post("/users/register", {
        name,
        email,
        password,
      });

      // Correctly extract and store the access_token
      localStorage.setItem(
        "token",
        `Bearer ${response.data.token.access_token}`
      );

      // Redirect to dashboard
      navigate("/dashboard");
    } catch (err) {
      console.error("Registration error:", err.response?.data || err.message);
      setError(
        err.response?.data?.detail ||
          "Registration failed. Please check your information."
      );
    } finally {
      setLoading(false); // End loading
    }
  };

  // Toggle password visibility for both Password and Confirm Password fields
  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };

  return (
    <Container className="register-container d-flex justify-content-center align-items-center min-vh-100">
      <Row className="w-100 justify-content-center">
        <Col xs={12} sm={10} md={8} lg={6} xl={5}>
          <Form
            onSubmit={handleRegister}
            className="p-5 border rounded shadow-lg bg-white register-form"
          >
            <h2 className="text-center mb-4">Register</h2>

            {/* Display Error Message */}
            {error && <Alert variant="danger">{error}</Alert>}

            {/* Name Field */}
            <Form.Group className="mb-4" controlId="formName">
              <Form.Label>Name:</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Form.Group>

            {/* Email Field */}
            <Form.Group className="mb-4" controlId="formEmail">
              <Form.Label>Email:</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>

            {/* Password Field with Toggle */}
            <Form.Group
              className="mb-4 position-relative"
              controlId="formPassword"
            >
              <Form.Label>Password:</Form.Label>
              <InputGroup>
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button
                  variant="outline-secondary"
                  onClick={togglePasswordVisibility}
                  aria-label={
                    showPassword ? "Hide passwords" : "Show passwords"
                  }
                  className="password-toggle-btn"
                >
                  <FaRegEye />
                </Button>
              </InputGroup>
            </Form.Group>

            {/* Confirm Password Field */}
            <Form.Group className="mb-4" controlId="formConfirmPassword">
              <Form.Label>Confirm Password:</Form.Label>
              <Form.Control
                type={showPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </Form.Group>

            {/* Submit Button */}
            <Button
              variant="success"
              type="submit"
              className="w-100 btn-lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Registering...
                </>
              ) : (
                "Register"
              )}
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}

export default Register;
