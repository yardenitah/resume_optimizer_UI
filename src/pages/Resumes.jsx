import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance"; // Use custom axios instance
import {
  FaCopy,
  FaDownload,
  FaTrash,
  FaFileAlt,
  FaCheck,
  FaSearch, // Import search icon
  FaPlus, // Import add icon
  FaTimes, // Import X icon
} from "react-icons/fa"; // Import additional icons
import "./style/Resumes.css";

function Resumes() {
  const [resumes, setResumes] = useState([]);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [copiedId, setCopiedId] = useState(null); // Track which ID was copied

  // For searching
  const [searchTitle, setSearchTitle] = useState("");
  const [searchId, setSearchId] = useState(""); // Added for search by ID

  // For analyzing a single resume
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [analysisJobTitle, setAnalysisJobTitle] = useState("");
  const [analysisJobDesc, setAnalysisJobDesc] = useState("");
  const [analysisResult, setAnalysisResult] = useState("");

  // For best match
  const [bestMatchJobTitle, setBestMatchJobTitle] = useState("");
  const [bestMatchJobDesc, setBestMatchJobDesc] = useState("");
  const [bestMatchResult, setBestMatchResult] = useState(null);

  // State to control the visibility of the upload form
  const [isUploadVisible, setIsUploadVisible] = useState(false);

  const fetchResumes = async () => {
    try {
      const res = await axiosInstance.get("/resumes", {
        params: { skip: 0, limit: 10 },
      });
      setResumes(res.data);
    } catch (error) {
      console.error("Error fetching resumes:", error);
    }
  };

  const handleSearchById = async (e) => {
    e.preventDefault();
    if (!searchId) return;

    try {
      const res = await axiosInstance.get(`/resumes/${searchId}`);
      setResumes([res.data]); // Display only the found resume
    } catch (err) {
      console.error("Search by ID error:", err);
      alert("Resume not found or you are unauthorized.");
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a resume file.");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title);

      await axiosInstance.post("/resumes/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Resume uploaded!");
      setFile(null);
      setTitle("");
      setIsUploadVisible(false); // Hide upload form after successful upload
      fetchResumes();
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload resume.");
    }
  };

  const handleDownload = async (resumeId) => {
    try {
      const res = await axiosInstance.get(`/resumes/${resumeId}/download`);
      if (res.data.presigned_url) {
        window.open(res.data.presigned_url, "_blank");
      }
    } catch (err) {
      console.error("Failed to get download URL:", err);
    }
  };

  const handleDelete = async (resumeId) => {
    if (!window.confirm("Are you sure you want to delete this resume?")) return;
    try {
      await axiosInstance.delete(`/resumes/${resumeId}`);
      alert("Resume deleted successfully.");
      fetchResumes();
    } catch (err) {
      console.error("Failed to delete resume:", err);
    }
  };

  const handleCopy = (resumeId) => {
    navigator.clipboard
      .writeText(resumeId)
      .then(() => {
        setCopiedId(resumeId); // Set the copied ID
        setTimeout(() => {
          setCopiedId(null); // Reset the copied ID after 2 seconds
        }, 2000);
      })
      .catch((err) => {
        console.error("Failed to copy ID:", err);
      });
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTitle) return;
    try {
      const res = await axiosInstance.get("/resumes/search", {
        params: {
          title: searchTitle,
          skip: 0,
          limit: 10,
        },
      });
      if (typeof res.data === "string") {
        alert(res.data); // "No matches found"
      } else {
        setResumes(res.data);
      }
    } catch (err) {
      console.error("Search error:", err);
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!selectedResumeId || !analysisJobTitle || !analysisJobDesc) return;

    try {
      const formData = new FormData();
      formData.append("job_title", analysisJobTitle);
      formData.append("job_description", analysisJobDesc);

      const res = await axiosInstance.post(
        `/resumes/${selectedResumeId}/analyze`,
        formData
      );
      setAnalysisResult(res.data.analysis);
    } catch (err) {
      console.error("Analyze error:", err);
    }
  };

  const handleBestMatch = async (e) => {
    e.preventDefault();
    if (!bestMatchJobTitle || !bestMatchJobDesc) return;

    try {
      const formData = new FormData();
      formData.append("job_title", bestMatchJobTitle);
      formData.append("job_description", bestMatchJobDesc);

      const res = await axiosInstance.post("/resumes/best-match", formData);
      setBestMatchResult(res.data);
    } catch (err) {
      console.error("Best match error:", err);
    }
  };

  const handleClearAll = () => {
    setSearchTitle("");
    setSearchId("");
    setAnalysisJobTitle("");
    setAnalysisJobDesc("");
    setBestMatchJobTitle("");
    setBestMatchJobDesc("");
    setAnalysisResult("");
    setBestMatchResult(null);
    fetchResumes();
  };

  return (
    <div className="resumes-container">
      <h2>My Resumes</h2>

      {/* Resumes List and Controls */}
      <div className="resume-list-wrapper">
        {/* Search Bar */}
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
                <FaFileAlt className="me-2 text-primary" /> {/* Resume Icon */}
                <strong>{resume.title}</strong> (ID: {resume._id})
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
              <button className="btn btn-success" type="submit">
                Find Best Match
              </button>
              <FaTimes
                className="reset-icon"
                onClick={handleClearAll}
                title="Reset All Fields"
              />
            </div>
          </form>

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
              <label>Resume ID:</label>
              <input
                className="form-control"
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
                placeholder="Paste resume _id here"
                required
              />
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
              <button className="btn btn-warning" type="submit">
                Analyze Resume
              </button>
              <FaTimes
                className="reset-icon"
                onClick={handleClearAll}
                title="Reset All Fields"
              />
            </div>
          </form>
          {analysisResult && (
            <div className="alert alert-info mt-3">
              <strong>Analysis Result:</strong>
              <p>{analysisResult}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Resumes;
