import React from "react";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="text-center">
      <h1>Welcome to Resume Optimizer</h1>
      <p className="lead">
        Optimize your resume and find jobs that match your skills quickly and
        easily!
      </p>

      {/* CTA or Feature Highlights */}
      <div className="mt-4">
        <h3>What can you do here?</h3>
        <ul style={{ listStyleType: "none" }}>
          <li>✓ Upload and organize multiple resumes</li>
          <li>✓ Analyze how well each resume matches a job description</li>
          <li>✓ Discover the best-matching resume for any given role</li>
          <li>✓ Track and manage job openings</li>
        </ul>
      </div>

      {/* Quick Link for Signed-Out Users (optional) */}
      <div className="mt-4">
        <Link to="/register" className="btn btn-primary me-3">
          Get Started
        </Link>
        <Link to="/jobs" className="btn btn-outline-secondary">
          Browse Jobs
        </Link>
      </div>
    </div>
  );
}

export default Home;
