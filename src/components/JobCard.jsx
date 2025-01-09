// JobCard.jsx
import React, { useState } from "react";
import axios from "axios";
import { FiDownload, FiExternalLink } from "react-icons/fi";
import { Modal, Button, Spinner, Alert } from "react-bootstrap";

function JobCard({ job, onClose }) {
  const token = localStorage.getItem("token");
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  const handleDownloadResume = async (resumeId) => {
    setIsDownloading(true);
    setDownloadError("");
    try {
      const res = await axios.get(
        `http://127.0.0.1:8000/resumes/${resumeId}/download`,
        {
          headers: { Authorization: token },
        }
      );
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

  if (!job) return null;

  return (
    <Modal show={!!job} onHide={onClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {job.job_title} at {job.company_name || "N/A"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          <strong>Job Description:</strong>
        </p>
        <p>{job.job_description || "No description provided."}</p>

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
              <strong>Recommended Resume ID:</strong> {job.best_resume_id}
            </Alert>
            {downloadError && <Alert variant="danger">{downloadError}</Alert>}
            <Button
              variant="primary"
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
