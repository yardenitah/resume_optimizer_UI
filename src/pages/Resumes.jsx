import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance"; // Use custom axios instance
import {
  FaCopy,
  FaDownload,
  FaTrash,
  FaFileAlt,
  FaCheck,
  FaSearch,
  FaPlus,
  FaTimes,
} from "react-icons/fa";
import { Modal, Button, Form, Spinner, Alert } from "react-bootstrap";
import "./style/Resumes.css";

function Resumes() {
  const [resumes, setResumes] = useState([]);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [copiedId, setCopiedId] = useState(null); // Track which ID was copied

  // For searching
  const [searchTitle, setSearchTitle] = useState("");
  const [searchId, setSearchId] = useState("");

  // ============================
  // For analyzing a single resume
  // ============================
  // (CHANGED) We keep TWO states:
  // 1) The typedResumeId: whatever user typed/pasted in the input
  // 2) The selectedResumeId: the valid resume ID we store after a successful lookup
  const [typedResumeId, setTypedResumeId] = useState("");
  const [selectedResumeId, setSelectedResumeId] = useState("");

  const [analysisJobTitle, setAnalysisJobTitle] = useState("");
  const [analysisJobDesc, setAnalysisJobDesc] = useState("");
  const [analysisResult, setAnalysisResult] = useState("");

  // For best match
  const [bestMatchJobTitle, setBestMatchJobTitle] = useState("");
  const [bestMatchJobDesc, setBestMatchJobDesc] = useState("");
  const [bestMatchResult, setBestMatchResult] = useState(null);

  // Loading States
  const [isBestMatchLoading, setIsBestMatchLoading] = useState(false);
  const [isAnalyzeLoading, setIsAnalyzeLoading] = useState(false);

  // State to control the visibility of the upload form
  const [isUploadVisible, setIsUploadVisible] = useState(false);

  // Associated Jobs Modal
  const [showAssociatedJobsModal, setShowAssociatedJobsModal] = useState(false);
  const [currentResumeId, setCurrentResumeId] = useState("");
  const [currentResumeTitle, setCurrentResumeTitle] = useState("");
  const [associatedJobs, setAssociatedJobs] = useState([]);
  const [newJobId, setNewJobId] = useState("");
  const [loadingAssociatedJobs, setLoadingAssociatedJobs] = useState(false);
  const [addingJob, setAddingJob] = useState(false);
  const [associatedJobsError, setAssociatedJobsError] = useState("");
  const [addJobSuccess, setAddJobSuccess] = useState("");
  const [removingJobId, setRemovingJobId] = useState(null);
  const [removeJobError, setRemoveJobError] = useState("");

  // ============================
  // Fetch all resumes on mount
  // ============================
  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const res = await axiosInstance.get("/resumes", {
        params: { skip: 0, limit: 10 },
      });
      setResumes(res.data);
    } catch (error) {
      console.error("Error fetching resumes:", error);
      alert("Failed to fetch resumes.");
    }
  };

  const handleSearchById = async (e) => {
    e.preventDefault();
    if (!searchId) return;

    try {
      const res = await axiosInstance.get(`/resumes/${searchId}`);
      setResumes([res.data]); // Display only that resume
    } catch (err) {
      console.error("Search by ID error:", err);
      alert("Resume not found or unauthorized.");
    }
  };

  // ============================
  // Upload a Resume
  // ============================
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a resume file.");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title);

      await axiosInstance.post("/resumes/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Resume uploaded!");
      setFile(null);
      setTitle("");
      setIsUploadVisible(false);
      fetchResumes();
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload resume.");
    }
  };

  // ============================
  // Download a Resume
  // ============================
  const handleDownload = async (resumeId) => {
    try {
      const res = await axiosInstance.get(`/resumes/${resumeId}/download`);
      if (res.data.presigned_url) {
        window.open(res.data.presigned_url, "_blank");
      }
    } catch (err) {
      console.error("Failed to get download URL:", err);
      alert("Failed to download resume.");
    }
  };

  // ============================
  // Delete a Resume
  // ============================
  const handleDelete = async (resumeId) => {
    if (!window.confirm("Are you sure you want to delete this resume?")) return;
    try {
      await axiosInstance.delete(`/resumes/${resumeId}`);
      alert("Resume deleted.");
      fetchResumes();
    } catch (err) {
      console.error("Failed to delete resume:", err);
      alert("Failed to delete resume.");
    }
  };

  // ============================
  // Copy Resume ID
  // ============================
  const handleCopy = (resumeId) => {
    navigator.clipboard
      .writeText(resumeId)
      .then(() => {
        setCopiedId(resumeId);
        setTimeout(() => setCopiedId(null), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy ID:", err);
        alert("Failed to copy ID.");
      });
  };

  // ============================
  // Search Resumes by Title
  // ============================
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTitle) return;

    try {
      const res = await axiosInstance.get("/resumes/search", {
        params: { title: searchTitle, skip: 0, limit: 10 },
      });
      if (typeof res.data === "string") {
        alert(res.data); // e.g. "No matches found"
      } else {
        setResumes(res.data);
      }
    } catch (err) {
      console.error("Search error:", err);
      alert("Search failed.");
    }
  };

  // ============================
  // Helper: format analysis text
  // ============================
  function formatAnalysisResult(analysisText) {
    if (!analysisText) return "";
    return analysisText
      .replace("1)", "1)\n")
      .replace("2)", "2)\n")
      .replace("3)", "3)\n");
  }

  // ============================
  // (NEW) onBlur: Fetch resume by typedResumeId
  // ============================
  const handleResumeIdBlur = async () => {
    // If user left it empty or same as before, do nothing
    if (!typedResumeId.trim()) return;

    try {
      // Attempt to GET /resumes/<typedResumeId>
      const res = await axiosInstance.get(`/resumes/${typedResumeId.trim()}`);
      if (res.data && res.data._id) {
        // (CHANGED) If found:
        // 1) store the actual ID in selectedResumeId
        setSelectedResumeId(res.data._id);

        // 2) replace the input text with the resume's title
        setTypedResumeId(res.data.title);
      }
    } catch (err) {
      // If fetch failed or user is unauthorized
      console.error("Error fetching resume by ID:", err);
      alert("Invalid resume ID or unauthorized user.");
    }
  };

  // ============================
  // Analyze a Single Resume
  // ============================
  const handleAnalyze = async (e) => {
    e.preventDefault();

    // We do NOT use typedResumeId for the endpoint, because typedResumeId may now hold the resume title
    // Instead, we use the stored selectedResumeId
    if (!selectedResumeId || !analysisJobTitle || !analysisJobDesc) {
      alert("Make sure you have a valid Resume ID and job info.");
      return;
    }

    try {
      setIsAnalyzeLoading(true);
      const formData = new FormData();
      formData.append("job_title", analysisJobTitle);
      formData.append("job_description", analysisJobDesc);

      const res = await axiosInstance.post(
        `/resumes/${selectedResumeId}/analyze`,
        formData
      );

      const formatted = formatAnalysisResult(res.data.analysis);
      setAnalysisResult(formatted);
    } catch (err) {
      console.error("Analyze error:", err);
      alert("Analysis failed.");
    } finally {
      setIsAnalyzeLoading(false);
    }
  };

  // ============================
  // Best Match
  // ============================
  const handleBestMatch = async (e) => {
    e.preventDefault();
    if (!bestMatchJobTitle || !bestMatchJobDesc) return;

    try {
      setIsBestMatchLoading(true);
      const formData = new FormData();
      formData.append("job_title", bestMatchJobTitle);
      formData.append("job_description", bestMatchJobDesc);

      const res = await axiosInstance.post("/resumes/best-match", formData);
      setBestMatchResult(res.data);
    } catch (err) {
      console.error("Best match error:", err);
      alert("Best match failed.");
    } finally {
      setIsBestMatchLoading(false);
    }
  };

  // ============================
  // Clear All
  // ============================
  const handleClearAll = () => {
    setSearchTitle("");
    setSearchId("");
    setTypedResumeId("");
    setSelectedResumeId("");
    setAnalysisJobTitle("");
    setAnalysisJobDesc("");
    setBestMatchJobTitle("");
    setBestMatchJobDesc("");
    setAnalysisResult("");
    setBestMatchResult(null);
    fetchResumes();
  };

  // ============================
  // Associated Jobs
  // ============================
  const handleViewAssociatedJobs = async (resumeId, resumeTitle) => {
    setCurrentResumeId(resumeId);
    setCurrentResumeTitle(resumeTitle);
    setShowAssociatedJobsModal(true);
    setAssociatedJobs([]);
    setAssociatedJobsError("");
    setAddJobSuccess("");
    setNewJobId("");
    setLoadingAssociatedJobs(true);

    try {
      const res = await axiosInstance.get(`/resumes/${resumeId}/jobs/details`);
      setAssociatedJobs(res.data);
    } catch (error) {
      console.error("Error fetching associated jobs:", error);
      setAssociatedJobsError("Failed to fetch associated jobs.");
    } finally {
      setLoadingAssociatedJobs(false);
    }
  };

  const handleAddJobToResume = async (e) => {
    e.preventDefault();
    if (!newJobId.trim()) {
      setAssociatedJobsError("Please enter a valid Job ID.");
      return;
    }

    setAddingJob(true);
    setAssociatedJobsError("");
    setAddJobSuccess("");

    try {
      const formData = new FormData();
      formData.append("job_id", newJobId.trim());

      await axiosInstance.post(`/resumes/${currentResumeId}/add_job`, formData);
      setAddJobSuccess("Job added successfully.");
      setNewJobId("");

      // Refresh
      const updatedJobsRes = await axiosInstance.get(
        `/resumes/${currentResumeId}/jobs/details`
      );
      setAssociatedJobs(updatedJobsRes.data);
    } catch (error) {
      console.error("Error adding job to resume:", error);
      setAssociatedJobsError(
        error.response?.data?.detail || "Failed to add job to resume."
      );
    } finally {
      setAddingJob(false);
    }
  };

  const handleRemoveJobFromResume = async (jobId) => {
    if (!window.confirm("Remove this job from the resume?")) return;
    setRemovingJobId(jobId);
    setRemoveJobError("");

    try {
      const formData = new FormData();
      formData.append("job_id", jobId);

      await axiosInstance.post(
        `/resumes/${currentResumeId}/remove_job`,
        formData
      );
      alert("Job removed successfully.");

      // Refresh
      const updatedJobsRes = await axiosInstance.get(
        `/resumes/${currentResumeId}/jobs/details`
      );
      setAssociatedJobs(updatedJobsRes.data);
    } catch (error) {
      console.error("Error removing job from resume:", error);
      setRemoveJobError(
        error.response?.data?.detail || "Failed to remove job from resume."
      );
    } finally {
      setRemovingJobId(null);
    }
  };

  const handleCloseAssociatedJobsModal = () => {
    setShowAssociatedJobsModal(false);
    setCurrentResumeId("");
    setCurrentResumeTitle("");
    setAssociatedJobs([]);
    setNewJobId("");
    setAssociatedJobsError("");
    setAddJobSuccess("");
    setRemoveJobError("");
  };

  // ============================
  // RENDER
  // ============================
  return (
    <div className="resumes-container">
      <h2>My Resumes</h2>

      {/* Resumes List and Controls */}
      <div className="resume-list-wrapper">
        {/* Search by Title */}
        <div className="resume-controls">
          <form onSubmit={handleSearch} className="search-resume-form">
            <FaSearch className="search-icon" />
            <input
              type="text"
              className="search-input"
              value={searchTitle}
              onChange={(e) => setSearchTitle(e.target.value)}
              placeholder="Search by Title"
            />
            {searchTitle && (
              <FaTimes
                className="clear-icon"
                onClick={() => {
                  setSearchTitle("");
                  fetchResumes();
                }}
                title="Clear Search"
              />
            )}
            <button type="submit" className="search-button">
              Search
            </button>
          </form>
        </div>

        {/* Resumes List */}
        <ul className="list-group resumes-list">
          {resumes.map((resume) => (
            <li
              className="list-group-item d-flex justify-content-between align-items-center"
              key={resume._id}
            >
              <div className="resume-info">
                <FaFileAlt
                  className="me-2 text-primary clickable-icon"
                  onClick={() =>
                    handleViewAssociatedJobs(resume._id, resume.title)
                  }
                  title="View Associated Jobs"
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleViewAssociatedJobs(resume._id, resume.title);
                    }
                  }}
                />
                <strong>{resume.title}</strong>
              </div>
              <div className="resume-actions">
                <button
                  className="btn btn-sm btn-info me-2"
                  onClick={() => handleDownload(resume._id)}
                  title="Download"
                >
                  <FaDownload />
                </button>
                <button
                  className="btn btn-sm btn-secondary me-2"
                  onClick={() => handleCopy(resume._id)}
                  title="Copy ID"
                >
                  {copiedId === resume._id ? <FaCheck /> : <FaCopy />}
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(resume._id)}
                  title="Delete"
                >
                  <FaTrash />
                </button>
              </div>
            </li>
          ))}
        </ul>

        {/* Add Resume Button */}
        <div className="add-resume-container">
          <button
            className="btn btn-primary add-resume-button"
            onClick={() => setIsUploadVisible(!isUploadVisible)}
          >
            <FaPlus className="me-2" /> Add Resume
          </button>
        </div>

        {/* Upload Form */}
        {isUploadVisible && (
          <form onSubmit={handleUpload} className="upload-form">
            <div className="mb-3">
              <label>Resume Title:</label>
              <input
                className="form-control"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. My Resume #1"
                required
              />
            </div>
            <div className="mb-3">
              <label>File (PDF or DOCX):</label>
              <input
                className="form-control"
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                accept=".pdf,.docx"
                required
              />
            </div>
            <div className="upload-buttons">
              <button className="btn btn-success" type="submit">
                Upload
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsUploadVisible(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Additional Functionalities */}
      <div className="additional-functions">
        {/* Best-Match Resume */}
        <div className="best-match-section">
          <h4>Find Best Match Resume</h4>
          <form onSubmit={handleBestMatch} className="best-match-form">
            <div className="mb-3">
              <label>Job Title:</label>
              <input
                className="form-control"
                value={bestMatchJobTitle}
                onChange={(e) => setBestMatchJobTitle(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label>Job Description:</label>
              <textarea
                className="form-control"
                value={bestMatchJobDesc}
                onChange={(e) => setBestMatchJobDesc(e.target.value)}
                required
              />
            </div>
            <div className="best-match-buttons">
              <button
                className="btn btn-success"
                type="submit"
                disabled={isBestMatchLoading}
              >
                {isBestMatchLoading ? (
                  <>
                    <Spinner
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                    />{" "}
                    Finding...
                  </>
                ) : (
                  "Find Best Match"
                )}
              </button>
              <FaTimes
                className="reset-icon"
                onClick={handleClearAll}
                title="Reset All Fields"
              />
            </div>
          </form>

          {/* Show Best-Match Results */}
          {bestMatchResult && (
            <div className="alert alert-success mt-3">
              <h5>Best Resume:</h5>
              <p>ID: {bestMatchResult.best_resume.id}</p>
              <p>Title: {bestMatchResult.best_resume.title}</p>
              <p>Score: {bestMatchResult.best_resume.score}</p>
              <button
                className="btn btn-sm btn-info me-2"
                onClick={() => handleDownload(bestMatchResult.best_resume.id)}
              >
                <FaDownload /> Download
              </button>

              <hr />

              <h5>All Resumes with Scores:</h5>
              {bestMatchResult.all_resumes.map((r) => (
                <div key={r.id}>
                  Resume ID: {r.id}, Title: {r.title}, Score: {r.score}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Analyze a Single Resume */}
        <div className="analyze-resume-section">
          <h4>Analyze a Single Resume</h4>
          <form onSubmit={handleAnalyze} className="analyze-resume-form">
            <div className="mb-3">
              <label>Resume:</label>
              {/* (CHANGED) We bind typedResumeId and call handleResumeIdBlur onBlur */}
              <input
                className="form-control"
                value={typedResumeId}
                onChange={(e) => setTypedResumeId(e.target.value)}
                onBlur={handleResumeIdBlur} // <--- (NEW)
                placeholder="Paste resume here"
                required
              />
              <small className="text-muted">
                Paste the resume ID here, then click or tab out.
                <br />
                We'll fetch the title and show it in this field if valid.
              </small>
            </div>

            <div className="mb-3">
              <label>Job Title:</label>
              <input
                className="form-control"
                value={analysisJobTitle}
                onChange={(e) => setAnalysisJobTitle(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label>Job Description:</label>
              <textarea
                className="form-control"
                value={analysisJobDesc}
                onChange={(e) => setAnalysisJobDesc(e.target.value)}
                required
              />
            </div>
            <div className="analyze-buttons">
              <button
                className="btn btn-warning"
                type="submit"
                disabled={isAnalyzeLoading}
              >
                {isAnalyzeLoading ? (
                  <>
                    <Spinner
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                    />{" "}
                    Analyzing...
                  </>
                ) : (
                  "Analyze Resume"
                )}
              </button>
              <FaTimes
                className="reset-icon"
                onClick={handleClearAll}
                title="Reset All Fields"
              />
            </div>
          </form>

          {/* Show Analysis Result */}
          {analysisResult && (
            <div className="alert alert-info mt-3">
              <strong>Analysis Result:</strong>
              <p>{analysisResult}</p>
            </div>
          )}
        </div>
      </div>

      {/* Associated Jobs Modal */}
      <Modal
        show={showAssociatedJobsModal}
        onHide={handleCloseAssociatedJobsModal}
        size="lg"
        centered
        aria-labelledby="associated-jobs-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title id="associated-jobs-modal">
            {currentResumeTitle
              ? `Associated Jobs for "${currentResumeTitle}" Resume`
              : `Associated Jobs for Resume`}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loadingAssociatedJobs && (
            <div className="text-center my-3">
              <Spinner animation="border" role="status" />
              <span className="ms-2">Loading associated jobs...</span>
            </div>
          )}

          {associatedJobsError && (
            <Alert
              variant="danger"
              onClose={() => setAssociatedJobsError("")}
              dismissible
            >
              {associatedJobsError}
            </Alert>
          )}

          {removeJobError && (
            <Alert
              variant="danger"
              onClose={() => setRemoveJobError("")}
              dismissible
            >
              {removeJobError}
            </Alert>
          )}

          {addJobSuccess && (
            <Alert
              variant="success"
              onClose={() => setAddJobSuccess("")}
              dismissible
            >
              {addJobSuccess}
            </Alert>
          )}

          {!loadingAssociatedJobs && associatedJobs.length > 0 && (
            <ul className="list-group associated-jobs-list mb-4">
              {associatedJobs.map((job) => (
                <li
                  className="list-group-item d-flex justify-content-between align-items-center"
                  key={job._id}
                >
                  <div>
                    <strong>{job.job_title}</strong> at{" "}
                    {job.company_name || "N/A"}
                    <br />
                    <a
                      href={job.job_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`View details for job ${job.job_title}`}
                    >
                      View Job
                    </a>
                  </div>
                  <div>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleRemoveJobFromResume(job._id)}
                      title="Remove Job"
                      disabled={removingJobId === job._id}
                    >
                      {removingJobId === job._id ? (
                        <Spinner animation="border" size="sm" />
                      ) : (
                        <FaTrash />
                      )}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {!loadingAssociatedJobs && associatedJobs.length === 0 && (
            <p>No jobs associated with this resume.</p>
          )}

          <Form
            onSubmit={handleAddJobToResume}
            className="associated-jobs-form"
          >
            <Form.Group controlId="formAddJobId" className="mb-3">
              <Form.Label>Add Job by ID</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Job ID to associate"
                value={newJobId}
                onChange={(e) => setNewJobId(e.target.value)}
                required
                aria-required="true"
              />
              <Form.Text className="text-muted">
                Paste a Job ID from your job list to associate it with this
                resume.
              </Form.Text>
            </Form.Group>
            <Button variant="primary" type="submit" disabled={addingJob}>
              {addingJob ? (
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
                "Add Job"
              )}
            </Button>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseAssociatedJobsModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Resumes;
