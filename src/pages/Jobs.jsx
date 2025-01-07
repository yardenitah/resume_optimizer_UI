import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobDescription, setJobDescription] = useState('');

  // For LinkedIn search
  const [linkedinUsername, setLinkedinUsername] = useState('');
  const [linkedinPassword, setLinkedinPassword] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('No Filter'); // Default is "No Filter"
  const [jobTitles, setJobTitles] = useState(''); // Comma-separated string
  const [maxJobs, setMaxJobs] = useState(10);

  const token = localStorage.getItem('token');

  const fetchJobs = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/jobs', {
        headers: { Authorization: token },
      });
      setJobs(response.data);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleSaveJob = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        'http://127.0.0.1:8000/jobs/save',
        {
          job_title: jobTitle,
          company_name: companyName,
          job_description: jobDescription,
        },
        { headers: { Authorization: token } }
      );
      alert('Job saved!');
      setJobTitle('');
      setCompanyName('');
      setJobDescription('');
      fetchJobs();
    } catch (err) {
      console.error('Failed to save job:', err);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;
    try {
      await axios.delete(`http://127.0.0.1:8000/jobs/delete/${jobId}`, {
        headers: { Authorization: token },
      });
      alert('Job deleted successfully.');
      fetchJobs();
    } catch (err) {
      console.error('Failed to delete job:', err);
    }
  };

  const handleDeleteAllJobs = async () => {
    if (!window.confirm('Are you sure you want to delete ALL your jobs?')) return;
    try {
      await axios.delete('http://127.0.0.1:8000/jobs/delete', {
        headers: { Authorization: token },
      });
      alert('All jobs deleted successfully.');
      fetchJobs();
    } catch (err) {
      console.error('Failed to delete all jobs:', err);
    }
  };

  const handleLinkedInSearch = async (e) => {
    e.preventDefault();

    const jobTitlesArray = jobTitles.split(',').map((title) => title.trim());
    const experienceLevelValue = experienceLevel === 'No Filter' ? 'no filter' : experienceLevel.toLowerCase();

    try {
      const formData = new FormData();
      formData.append('linkedin_username', linkedinUsername);
      formData.append('linkedin_password', linkedinPassword);
      formData.append('maxNumberOfJobsTosearch', maxJobs);
      formData.append('experience_level', experienceLevelValue);

      jobTitlesArray.forEach((title) => formData.append('job_titles', title));

      await axios.post('http://127.0.0.1:8000/jobs/linkedin/search', formData, {
        headers: {
          Authorization: token,
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('LinkedIn jobs searched & saved!');
      fetchJobs();
    } catch (err) {
      console.error('Failed to search & save LinkedIn jobs:', err);
      alert(err.response?.data?.detail || 'LinkedIn search failed');
    }
  };

  return (
    <div>
      <h2>My Saved Jobs</h2>

      <form onSubmit={handleSaveJob} className="my-3">
        <div className="mb-3">
          <label>Job Title:</label>
          <input
            className="form-control"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label>Company Name:</label>
          <input
            className="form-control"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label>Job Description:</label>
          <textarea
            className="form-control"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            required
          />
        </div>
        <button className="btn btn-primary" type="submit">
          Save Job
        </button>
      </form>

      <button className="btn btn-danger mb-3" onClick={handleDeleteAllJobs}>
        Delete All My Jobs
      </button>

      <ul className="list-group">
        {jobs.map((job) => (
          <li className="list-group-item d-flex justify-content-between" key={job._id}>
            <div>
              <strong>{job.job_title}</strong> at {job.company_name} <br />
              <em>{job.job_description?.substring(0, 80)}...</em>
            </div>
            <button
              className="btn btn-sm btn-danger"
              onClick={() => handleDeleteJob(job._id)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>

      {/* LinkedIn Search Form */}
      <hr />
      <h4>Search & Save Jobs from LinkedIn</h4>
      <form onSubmit={handleLinkedInSearch}>
        <div className="mb-3">
          <label>LinkedIn Email:</label>
          <input
            className="form-control"
            value={linkedinUsername}
            onChange={(e) => setLinkedinUsername(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label>LinkedIn Password:</label>
          <input
            className="form-control"
            type="password"
            value={linkedinPassword}
            onChange={(e) => setLinkedinPassword(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label>Experience Level:</label>
          <select
            className="form-control"
            value={experienceLevel}
            onChange={(e) => setExperienceLevel(e.target.value)}
          >
            <option value="No Filter">No Filter</option>
            <option value="Entry Level">Entry Level</option>
            <option value="Mid-Senior">Mid-Senior</option>
          </select>
        </div>
        <div className="mb-3">
          <label>Job Titles (comma-separated):</label>
          <input
            className="form-control"
            value={jobTitles}
            onChange={(e) => setJobTitles(e.target.value)}
            placeholder="Software Engineer, Marketing Manager"
          />
        </div>
        <div className="mb-3">
          <label>Max Number of Jobs to Search:</label>
          <input
            className="form-control"
            type="number"
            value={maxJobs}
            onChange={(e) => setMaxJobs(e.target.value)}
          />
        </div>
        <button className="btn btn-success" type="submit">
          Search & Save
        </button>
      </form>
    </div>
  );
}

export default Jobs;
