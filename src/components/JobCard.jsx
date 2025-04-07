// my-app/src/components/JobCard.jsx
import React, { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import { FiDownload, FiExternalLink } from "react-icons/fi";
import { Modal, Button, Spinner, Alert } from "react-bootstrap";
import "./style/JobCard.css";

function JobCard({ job, onClose }) {
  const token = localStorage.getItem("token");

  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  // NEW: store the recommended resume title
  const [recommendedResumeTitle, setRecommendedResumeTitle] = useState("");

  // States for adding job to resume
  const [isAddingToResume, setIsAddingToResume] = useState(false);
  const [addToResumeError, setAddToResumeError] = useState("");
  const [addToResumeSuccess, setAddToResumeSuccess] = useState("");

  // to manage toggle mode and fetched points
  const [showPoints, setShowPoints] = useState(false);
  const [importantPoints, setImportantPoints] = useState([]);
  const [isLoadingPoints, setIsLoadingPoints] = useState(false);

  // Fetch the recommended resume title if best_resume_id is present
  useEffect(() => {
    const fetchRecommendedResumeTitle = async (resumeId) => {
      try {
        const response = await axiosInstance.get(`/resumes/${resumeId}`, {
          headers: { Authorization: token },
        });
        // Assuming the response data contains { title: "Resume Title", ... }
        setRecommendedResumeTitle(response.data.title);
      } catch (err) {
        console.error("Failed to fetch recommended resume title:", err);
      }
    };

    if (job?.best_resume_id) {
      fetchRecommendedResumeTitle(job.best_resume_id);
    }
  }, [job?.best_resume_id, token]);

  const handleToggleImportantPoints = async () => {
    if (!showPoints && importantPoints.length === 0) {
      setIsLoadingPoints(true);
      try {
        const res = await axiosInstance.get(`/jobs/jobpoint/${job._id}`, {
          headers: { Authorization: token },
        });
        setImportantPoints(res.data.important_points);
      } catch (err) {
        console.error("Failed to fetch important points:", err);
        alert("Unable to load important points.");
      } finally {
        setIsLoadingPoints(false);
      }
    }
    setShowPoints((prev) => !prev);
  };

  const handleDownloadResume = async (resumeId) => {
    setIsDownloading(true);
    setDownloadError("");
    try {
      const res = await axiosInstance.get(`/resumes/${resumeId}/download`, {
        headers: { Authorization: token },
      });
      if (res.data.presigned_url) {
        window.open(res.data.presigned_url, "_blank");
      } else {
        setDownloadError("Failed to fetch the download link for the resume.");
      }
    } catch (err) {
      console.error("Failed to download the resume:", err);
      setDownloadError("Error occurred while downloading the resume.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleAddJobToResume = async () => {
    if (!job.best_resume_id) {
      alert("No recommended resume found for this job.");
      return;
    }
    setIsAddingToResume(true);
    setAddToResumeError("");
    setAddToResumeSuccess("");

    try {
      const formData = new FormData();
      formData.append("job_id", job._id);

      await axiosInstance.post(
        `/resumes/${job.best_resume_id}/add_job`,
        formData,
        {
          headers: { Authorization: token },
        }
      );

      setAddToResumeSuccess("Job successfully added to recommended resume!");
    } catch (error) {
      console.error("Error adding job to resume:", error);
      setAddToResumeError("Failed to add job to recommended resume.");
    } finally {
      setIsAddingToResume(false);
    }
  };

  if (!job) return null;

  return (
    <Modal show={!!job} onHide={onClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {job.job_title} at {job.company_name || "N/A"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="mb-3">
          <div className="d-flex justify-content-between align-items-center">
            <strong>
              {showPoints ? "Important Points" : "Job Description"}:
            </strong>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={handleToggleImportantPoints}
            >
              {showPoints ? "Show Description" : "Show Important Points"}
            </Button>
          </div>
          {isLoadingPoints ? (
            <Spinner animation="border" size="sm" className="mt-2" />
          ) : showPoints ? (
            <div className="important-points-container mt-2">
              {importantPoints.length > 0 ? (
                importantPoints.map((point, index) => (
                  <div className="important-point-item" key={index}>
                    <span className="icon">📌</span>
                    <span>{point}</span>
                  </div>
                ))
              ) : (
                <div className="important-point-item text-muted">
                  <span className="icon">ℹ️</span>
                  <span>No important points available.</span>
                </div>
              )}
            </div>
          ) : (
            <p className="mt-2">
              {job.job_description || "No description provided."}
            </p>
          )}
        </div>

        {job.job_link && (
          <p>
            <strong>Job Link:</strong>{" "}
            <a href={job.job_link} target="_blank" rel="noopener noreferrer">
              <FiExternalLink /> View Job
            </a>
          </p>
        )}

        {job.best_resume_id ? (
          <div className="mt-4">
            <Alert variant="success">
              <strong>Recommended Resume:</strong>{" "}
              {recommendedResumeTitle || "(Loading Title...)"}
            </Alert>

            {downloadError && <Alert variant="danger">{downloadError}</Alert>}
            {addToResumeError && (
              <Alert variant="danger">{addToResumeError}</Alert>
            )}
            {addToResumeSuccess && (
              <Alert variant="success">{addToResumeSuccess}</Alert>
            )}

            <Button
              variant="primary"
              className="me-3"
              onClick={() => handleDownloadResume(job.best_resume_id)}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                  />{" "}
                  Downloading...
                </>
              ) : (
                <>
                  <FiDownload className="me-2" />
                  Download Recommended Resume
                </>
              )}
            </Button>

            <Button
              variant="success"
              onClick={handleAddJobToResume}
              disabled={isAddingToResume}
            >
              {isAddingToResume ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                  />{" "}
                  Adding...
                </>
              ) : (
                "Add This Job to Recommended Resume"
              )}
            </Button>
          </div>
        ) : (
          <Alert variant="warning" className="mt-4">
            <strong>No recommended resume found.</strong>
          </Alert>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default JobCard;
