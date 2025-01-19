import React, { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import { FiDownload, FiExternalLink } from "react-icons/fi";
import { Modal, Button, Spinner, Alert } from "react-bootstrap";

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
              {/* Display the recommended resume's title instead of ID */}
              <strong>Recommended Resume:</strong>{" "}
              {recommendedResumeTitle || "(Loading Title...)"}
            </Alert>

            {/* Show errors/success for the "Add to Resume" action */}
            {downloadError && <Alert variant="danger">{downloadError}</Alert>}
            {addToResumeError && (
              <Alert variant="danger">{addToResumeError}</Alert>
            )}
            {addToResumeSuccess && (
              <Alert variant="success">{addToResumeSuccess}</Alert>
            )}

            {/* Download Recommended Resume Button */}
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

            {/* Add This Job to Recommended Resume Button */}
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
