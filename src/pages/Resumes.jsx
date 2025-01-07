import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Resumes() {
  const [resumes, setResumes] = useState([]);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');

  // For searching
  const [searchTitle, setSearchTitle] = useState('');
  const [searchId, setSearchId] = useState(''); // Added for search by ID


  // For analyzing a single resume
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [analysisJobTitle, setAnalysisJobTitle] = useState('');
  const [analysisJobDesc, setAnalysisJobDesc] = useState('');
  const [analysisResult, setAnalysisResult] = useState('');

  // For best match
  const [bestMatchJobTitle, setBestMatchJobTitle] = useState('');
  const [bestMatchJobDesc, setBestMatchJobDesc] = useState('');
  const [bestMatchResult, setBestMatchResult] = useState(null);

  const token = localStorage.getItem('token');

  const fetchResumes = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/resumes', {
        headers: { Authorization: token },
        params: { skip: 0, limit: 10 },
      });
      setResumes(res.data);
    } catch (error) {
      console.error('Error fetching resumes:', error);
    }
  };

  const handleSearchById = async (e) => {
    e.preventDefault();
    if (!searchId) return;

    try {
      const res = await axios.get(`http://127.0.0.1:8000/resumes/${searchId}`, {
        headers: { Authorization: token },
      });
      setResumes([res.data]); // Display only the found resume
    } catch (err) {
      console.error('Search by ID error:', err);
      alert('Resume not found or you are unauthorized.');
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert('Please select a resume file.');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);

      await axios.post('http://127.0.0.1:8000/resumes/upload', formData, {
        headers: {
          Authorization: token,
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('Resume uploaded!');
      setFile(null);
      setTitle('');
      fetchResumes();
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  const handleDownload = async (resumeId) => {
    try {
      // First get a pre-signed URL from the backend
      const res = await axios.get(`http://127.0.0.1:8000/resumes/${resumeId}/download`, {
        headers: { Authorization: token },
      });
      if (res.data.presigned_url) {
        // Open in new tab or trigger download
        window.open(res.data.presigned_url, '_blank');
      }
    } catch (err) {
      console.error('Failed to get download URL:', err);
    }
  };

  const handleDelete = async (resumeId) => {
    if (!window.confirm('Are you sure you want to delete this resume?')) return;
    try {
      await axios.delete(`http://127.0.0.1:8000/resumes/${resumeId}`, {
        headers: { Authorization: token },
      });
      alert('Resume deleted successfully.');
      fetchResumes();
    } catch (err) {
      console.error('Failed to delete resume:', err);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTitle) return;

    try {
      const res = await axios.get('http://127.0.0.1:8000/resumes/search', {
        headers: { Authorization: token },
        params: {
          title: searchTitle,
          skip: 0,
          limit: 10,
        },
      });
      if (typeof res.data === 'string') {
        // "No matches found"
        alert(res.data);
      } else {
        setResumes(res.data);
      }
    } catch (err) {
      console.error('Search error:', err);
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!selectedResumeId || !analysisJobTitle || !analysisJobDesc) return;

    try {
      const formData = new FormData();
      formData.append('job_title', analysisJobTitle);
      formData.append('job_description', analysisJobDesc);

      const res = await axios.post(
        `http://127.0.0.1:8000/resumes/${selectedResumeId}/analyze`,
        formData,
        { headers: { Authorization: token } }
      );
      setAnalysisResult(res.data.analysis);
    } catch (err) {
      console.error('Analyze error:', err);
    }
  };

  const handleBestMatch = async (e) => {
    e.preventDefault();
    if (!bestMatchJobTitle || !bestMatchJobDesc) return;

    try {
      const formData = new FormData();
      formData.append('job_title', bestMatchJobTitle);
      formData.append('job_description', bestMatchJobDesc);

      const res = await axios.post('http://127.0.0.1:8000/resumes/best-match', formData, {
        headers: { Authorization: token },
      });
      setBestMatchResult(res.data);
    } catch (err) {
      console.error('Best match error:', err);
    }
  };

  return (
    <div>
      <h2>My Resumes</h2>

      {/* Upload Form */}
      <form onSubmit={handleUpload} className="my-3">
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
        <button className="btn btn-primary" type="submit">
          Upload
        </button>
      </form>

      {/* Search Resumes by Title */}

      {/* Search Resumes by ID */}
      <form onSubmit={handleSearchById} className="my-3">
        <div className="mb-3">
          <label>Search by Resume ID:</label>
          <input
            className="form-control"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            placeholder="e.g. 648bdfef76193a001c5b5432"
          />
        </div>
        <button className="btn btn-secondary" type="submit">
          Search by ID
        </button>
      </form>

      <form onSubmit={handleSearch} className="my-4">
        <div className="mb-3">
          <label>Search by Title:</label>
          <input
            className="form-control"
            value={searchTitle}
            onChange={(e) => setSearchTitle(e.target.value)}
            placeholder="e.g. Developer"
          />
        </div>
        <button className="btn btn-secondary" type="submit">
          Search
        </button>
      </form>

      {/* Resumes List */}
      <ul className="list-group">
        {resumes.map((resume) => (
          <li className="list-group-item d-flex justify-content-between" key={resume._id}>
            <div>
              <strong>{resume.title}</strong> (ID: {resume._id})
            </div>
            <div>
              <button
                className="btn btn-sm btn-info me-2"
                onClick={() => handleDownload(resume._id)}
              >
                Download
              </button>
              <button
                className="btn btn-sm btn-danger"
                onClick={() => handleDelete(resume._id)}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* Analyze a Single Resume */}
      <div className="my-5">
        <h4>Analyze a Single Resume</h4>
        <form onSubmit={handleAnalyze}>
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
          <button className="btn btn-warning" type="submit">
            Analyze
          </button>
        </form>
        {analysisResult && (
          <div className="alert alert-info mt-3">
            <strong>Analysis Result:</strong>
            <p>{analysisResult}</p>
          </div>
        )}
      </div>

      {/* Best-Match Resume */}
      <div className="my-5">
        <h4>Find Best Match Resume</h4>
        <form onSubmit={handleBestMatch}>
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
          <button className="btn btn-success" type="submit">
            Find Best Match
          </button>
        </form>

        {bestMatchResult && (
          <div className="alert alert-success mt-3">
            <h5>Best Resume:</h5>
            <p>ID: {bestMatchResult.best_resume.id}</p>
            <p>Title: {bestMatchResult.best_resume.title}</p>
            <p>Score: {bestMatchResult.best_resume.score}</p>
            <a
              href={bestMatchResult.best_resume.s3_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open Resume in S3
            </a>

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
    </div>
  );
}

export default Resumes;
