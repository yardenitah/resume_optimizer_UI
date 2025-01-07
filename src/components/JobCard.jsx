import React from 'react';
import axios from 'axios';
import { FiDownload, FiExternalLink } from 'react-icons/fi'; // Import icons

function JobCard({ job, onClose }) {
  const token = localStorage.getItem('token'); // Retrieve token for authorization

  const handleDownloadResume = async (resumeId) => {
    try {
      // Fetch pre-signed URL for the resume
      const res = await axios.get(`http://127.0.0.1:8000/resumes/${resumeId}/download`, {
        headers: { Authorization: token },
      });
      if (res.data.presigned_url) {
        // Open the pre-signed URL in a new tab
        window.open(res.data.presigned_url, '_blank');
      } else {
        alert('Failed to fetch the download link for the resume.');
      }
    } catch (err) {
      console.error('Failed to download the resume:', err);
      alert('Error occurred while downloading the resume.');
    }
  };

  if (!job) return null;

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <div>
          <strong>{job.job_title}</strong> at {job.company_name || 'N/A'}
        </div>
        {job.job_link && (
          <a
            href={job.job_link}
            target="_blank"
            rel="noopener noreferrer"
            className="d-flex align-items-center text-decoration-none ms-3"
          >
            <FiExternalLink className="me-1" />
            <strong>View Job</strong>
          </a>
        )}
      </div>

      <div className="card-body">
        <p><strong>Job Description:</strong></p>
        <p>{job.job_description || 'No description provided.'}</p>

        {job.best_resume_id ? (
          <div className="mt-4">
            <p className="accentuated">
              <strong>Recommended Resume ID:</strong> {job.best_resume_id}
            </p>
            <button
              className="btn btn-primary btn-sm mt-2 d-flex align-items-center"
              onClick={() => handleDownloadResume(job.best_resume_id)}
            >
              <FiDownload className="me-2" />
              Download Recommended Resume
            </button>
          </div>
        ) : (
          <p><strong>No recommended resume found...</strong></p>
        )}

        <button className="btn btn-secondary mt-3" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

export default JobCard;
