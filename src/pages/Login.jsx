// src/components/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance"; // Use the custom axios instance
import { FaRegEye } from "react-icons/fa";
import { IoEyeOffOutline } from "react-icons/io5";
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
import "./style/Login.css";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // State to toggle password visibility
  const [showPassword, setShowPassword] = useState(false);

  // State for handling validation errors
  const [error, setError] = useState("");

  // State for handling loading state
  const [loading, setLoading] = useState(false);

  // Handle form submission
  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent form from submitting

    // Reset error message
    setError("");
    setLoading(true);

    try {
      const { data } = await axiosInstance.post("/users/login", {
        email,
        password,
      });

      // Save the token to localStorage
      localStorage.setItem("token", `Bearer ${data.access_token}`);

      // Redirect to dashboard
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);
      setError(
        err.response?.data?.detail ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };

  return (
    <Container className="login-container d-flex justify-content-center align-items-center min-vh-100">
      <Row className="w-100 justify-content-center">
        <Col xs={12} sm={10} md={8} lg={6} xl={5}>
          <Form
            onSubmit={handleLogin}
            className="p-5 border rounded shadow-lg bg-white login-form"
          >
            <h2 className="text-center mb-4">Login</h2>

            {/* Display Error Message */}
            {error && <Alert variant="danger">{error}</Alert>}

            {/* Email Field */}
            <Form.Group className="mb-4" controlId="formEmail">
              <Form.Label>Email:</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter your email"
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
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button
                  variant="outline-secondary"
                  onClick={togglePasswordVisibility}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="password-toggle-btn"
                >
                  {showPassword ? <FaRegEye /> : <IoEyeOffOutline />}
                </Button>
              </InputGroup>
            </Form.Group>

            {/* Submit Button */}
            <Button
              variant="primary"
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
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}

export default Login;
