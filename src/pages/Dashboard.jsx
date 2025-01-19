import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { Link } from "react-router-dom";
import { Card, Button, Spinner, Alert } from "react-bootstrap";
import "./style/Dashboard.css";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [resumeCount, setResumeCount] = useState(0);
  const [jobCount, setJobCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true); // NEW
  const [error, setError] = useState(""); // NEW

  useEffect(() => {
    async function fetchData() {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setIsLoading(false);
          return;
        }

        // Fetch user info
        const userRes = await axiosInstance.get("/users/me");
        setUser(userRes.data.user);

        // Fetch total resumes
        const resumesRes = await axiosInstance.get("/resumes", {
          params: { skip: 0, limit: 999 },
        });
        setResumeCount(resumesRes.data.length);

        // Fetch total jobs
        const jobsRes = await axiosInstance.get("/jobs", {
          params: { skip: 0, limit: 999 },
        });
        setJobCount(jobsRes.data.length);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError("Error loading dashboard data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="text-center mt-4">
        <Spinner animation="border" role="status" />
        <span className="ms-2">Loading Dashboard...</span>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">Dashboard</h2>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {user ? (
        <div className="text-center mb-5">
          <h5 className="mb-2">Welcome, {user.name}!</h5>
          <p className="mb-1">Email: {user.email}</p>
        </div>
      ) : (
        <p className="text-center">
          You are not logged in or your session has expired.
        </p>
      )}

      <div className="row g-4">
        {/* Resumes Card */}
        <div className="col-sm-6">
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>Your Resumes</Card.Title>
              <Card.Text>
                You have <strong>{resumeCount}</strong> uploaded resume
                {resumeCount !== 1 ? "s" : ""}.
              </Card.Text>
              <Link to="/resumes" className="btn btn-primary">
                Manage Resumes
              </Link>
            </Card.Body>
          </Card>
        </div>

        {/* Jobs Card */}
        <div className="col-sm-6">
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title>Your Jobs</Card.Title>
              <Card.Text>
                You have <strong>{jobCount}</strong> saved job
                {jobCount !== 1 ? "s" : ""}.
              </Card.Text>
              <Link to="/jobs" className="btn btn-primary">
                View Jobs
              </Link>
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Admin Panel Card (only if user is admin) */}
      {user?.is_admin && (
        <div className="row mt-4">
          <div className="col-sm-12">
            <Card className="shadow-sm">
              <Card.Body>
                <Card.Title>Admin Panel</Card.Title>
                <Card.Text>
                  As an admin, you can manage all users and data in the system.
                </Card.Text>
                <Link to="/admin" className="btn btn-danger">
                  Go to Admin Panel
                </Link>
              </Card.Body>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
