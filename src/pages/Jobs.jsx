import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import JobCard from "../components/JobCard.jsx";
import {
  FaInfoCircle,
  FaTrash,
  FaPlus,
  FaSearch,
  FaTimes,
  FaLinkedin,
  FaCopy,
  FaCheck,
} from "react-icons/fa";
import "./style/Jobs.css";
import {
  Modal,
  Button,
  Form,
  Card,
  Spinner,
  Alert,
  InputGroup,
  Row,
  Col,
  Tooltip,
  OverlayTrigger,
} from "react-bootstrap";

const getDaysAgo = (createdAt) => {
  const jobDate = new Date(createdAt);
  const now = new Date();
  const diffInMs = now - jobDate;
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  if (diffInDays === 0) return "Today";
  if (diffInDays === 1) return "1 day ago";
  return `${diffInDays} days ago`;
};

function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);

  // Fields for manually adding a job (Modal)
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [jobLink, setJobLink] = useState("");

  // LinkedIn search
  const [linkedinUsername, setLinkedinUsername] = useState("");
  const [linkedinPassword, setLinkedinPassword] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("No Filter");
  const [jobTitles, setJobTitles] = useState("");
  const [maxJobs, setMaxJobs] = useState(10);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCompany, setFilterCompany] = useState("");

  // Loading & Error
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // LinkedIn States
  const [linkedinLoading, setLinkedinLoading] = useState(false);
  const [linkedinSuccess, setLinkedinSuccess] = useState(false);

  // Modal States
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [showAddJobModal, setShowAddJobModal] = useState(false);

  // State to track which job ID was copied
  const [copiedJobId, setCopiedJobId] = useState(null);

  // Fetch Jobs
  const fetchJobs = async () => {
    try {
      const response = await axiosInstance.get("/jobs");
      setJobs(response.data);
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
      setError("Unable to retrieve jobs. Please try again later.");
    }
  };

  // Removed localStorage syncing for linkedinLoading to avoid infinite spinner on reload

  useEffect(() => {
    fetchJobs();
  }, []);

  // LinkedIn Search
  const handleLinkedInSearch = async (e) => {
    e.preventDefault();
    if (!linkedinUsername || !linkedinPassword || !jobTitles || !maxJobs) {
      alert("Please fill in all required fields.");
      return;
    }

    setLinkedinLoading(true);
    setLinkedinSuccess(false);
    setError("");

    const jobTitlesArray = jobTitles
      .split(",")
      .map((title) => title.trim())
      .filter(Boolean);
    const experienceLevelValue =
      experienceLevel === "No Filter"
        ? "no filter"
        : experienceLevel.toLowerCase();

    try {
      const formData = new FormData();
      formData.append("linkedin_username", linkedinUsername);
      formData.append("linkedin_password", linkedinPassword);
      formData.append("maxNumberOfJobsTosearch", maxJobs);
      formData.append("experience_level", experienceLevelValue);
      jobTitlesArray.forEach((title) => formData.append("job_titles", title));

      await axiosInstance.post("/jobs/linkedin/search", formData);

      setLinkedinSuccess(true);
      alert("LinkedIn jobs searched & saved successfully!");
      fetchJobs();

      // Clear LinkedIn form fields
      setLinkedinUsername("");
      setLinkedinPassword("");
      setExperienceLevel("No Filter");
      setJobTitles("");
      setMaxJobs(10);
    } catch (err) {
      console.error("Failed to search & save LinkedIn jobs:", err);
      setError(
        err.response?.data?.detail ||
          "LinkedIn search failed. Please check your credentials and try again."
      );
      alert(err.response?.data?.detail || "LinkedIn search failed");
    } finally {
      setLinkedinLoading(false);
    }
  };

  // Search Jobs by Title
  const searchJobsByTitle = async (title) => {
    setIsLoading(true);
    setError("");
    try {
      const response = await axiosInstance.get(
        `/jobs/search?title=${encodeURIComponent(title)}`
      );
      setJobs(response.data);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setJobs([]); // No jobs found
      } else {
        console.error("Failed to search jobs:", err);
        setError("Failed to search jobs. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Search
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim() && !filterCompany.trim()) {
      // If both search term and filter are empty, fetch all
      fetchJobs();
    } else {
      if (searchTerm.trim()) {
        await searchJobsByTitle(searchTerm.trim());
      }
      // The filterCompany will be applied client-side below
    }
  };

  // Save Job (from "Add Job" Modal)
  const handleSaveJob = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("job_title", jobTitle);
      formData.append("company_name", companyName);
      formData.append("job_description", jobDescription);
      formData.append("job_link", jobLink);

      await axiosInstance.post("/jobs/save", formData);
      alert("Job saved successfully!");

      // Clear fields
      setJobTitle("");
      setCompanyName("");
      setJobDescription("");
      setJobLink("");
      fetchJobs();
      setShowAddJobModal(false); // Close modal
    } catch (err) {
      if (err.response?.status === 409) {
        alert("This job already exists.");
      } else {
        console.error("Failed to save job:", err);
        setError(
          err.response?.data?.detail ||
            "Failed to save job. Please ensure all required fields are filled correctly."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Delete Single Job
  const handleDeleteJob = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;
    setIsLoading(true);
    setError("");
    try {
      await axiosInstance.delete(`/jobs/delete/${jobId}`);
      alert("Job deleted successfully.");
      fetchJobs();
    } catch (err) {
      console.error("Failed to delete job:", err);
      setError("Failed to delete job. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Delete All Jobs
  const handleDeleteAllJobs = async () => {
    setShowDeleteAllModal(false);
    setIsLoading(true);
    setError("");
    try {
      await axiosInstance.delete("/jobs/delete");
      alert("All jobs deleted successfully.");
      fetchJobs();
    } catch (err) {
      console.error("Failed to delete all jobs:", err);
      setError("Failed to delete all jobs. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Tooltip for "Delete All"
  const renderDeleteAllTooltip = (props) => (
    <Tooltip id="button-tooltip" {...props}>
      Permanently delete all your saved jobs. This action cannot be undone.
    </Tooltip>
  );

  // Function to handle copying Job ID
  const handleCopyJobId = (jobId) => {
    navigator.clipboard
      .writeText(jobId)
      .then(() => {
        setCopiedJobId(jobId); // Set the copied ID
        setTimeout(() => {
          setCopiedJobId(null); // Reset the copied ID after 2 seconds
        }, 2000);
      })
      .catch((err) => {
        console.error("Failed to copy Job ID:", err);
        alert("Failed to copy Job ID. Please try again.");
      });
  };

  return (
    <div className="jobs-container">
      <h2 className="mb-4">My Saved Jobs</h2>

      {/* Error Alert */}
      {error && (
        <Alert variant="danger" onClose={() => setError("")} dismissible>
          <FaInfoCircle className="me-2" />
          {error}
        </Alert>
      )}

      {/* Global Spinner */}
      {isLoading && (
        <div className="text-center my-3">
          <Spinner animation="border" role="status" />
          <span className="ms-2">Loading...</span>
        </div>
      )}

      {/* Search & Filter */}
      {/* 
        Removed extra space below this Card by controlling margin in CSS.
        Use smaller inputs to make the search bar appear smaller.
      */}
      <Card className="search-filter-card">
        <Card.Header as="h5">
          <FaSearch className="me-2" />
          Search & Filter
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSearch}>
            <Row className="g-3">
              <Col xs="12" md="6">
                <Form.Group controlId="searchJobTitle">
                  <Form.Label>Job Title</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <FaSearch />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="e.g., Software Engineer"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      aria-label="Search by Job Title"
                    />
                  </InputGroup>
                  <Form.Text className="text-muted">
                    Search for a specific job title.
                  </Form.Text>
                </Form.Group>
              </Col>

              <Col xs="12" md="6">
                <Form.Group controlId="filterCompany">
                  <Form.Label>Company Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., Google"
                    value={filterCompany}
                    onChange={(e) => setFilterCompany(e.target.value)}
                    aria-label="Filter by Company Name"
                  />
                  <Form.Text className="text-muted">
                    Filter jobs by specifying the company name.
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            <div className="mt-3 d-flex gap-2">
              <Button
                variant="primary"
                type="submit"
                className="d-flex align-items-center"
              >
                <FaSearch className="me-1" />
                Search
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setSearchTerm("");
                  setFilterCompany("");
                  fetchJobs();
                }}
                className="d-flex align-items-center"
              >
                <FaTimes className="me-1" />
                Clear
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      {/* Job List */}
      <div className="job-list-wrapper">
        <ul className="list-group jobs-list">
          {jobs.length === 0 ? (
            <li className="list-group-item text-center">
              No jobs found. Please add or search for jobs.
            </li>
          ) : (
            jobs
              .filter((job) =>
                filterCompany
                  ? job.company_name
                      .toLowerCase()
                      .includes(filterCompany.toLowerCase())
                  : true
              )
              .map((job) => (
                <li
                  className="list-group-item d-flex justify-content-between align-items-center"
                  key={job._id}
                >
                  <div className="job-info d-flex align-items-center">
                    <div className="job-info d-flex align-items-center flex-wrap">
                      <FaInfoCircle
                        className="me-2 text-primary"
                        style={{ cursor: "pointer" }}
                        onClick={() => setSelectedJob(job)}
                        aria-label={`View details for ${job.job_title}`}
                      />
                      <div>
                        <strong>{job.job_title}</strong>{" "}
                        <span className="text-muted">
                          at {job.company_name || "N/A"}
                        </span>{" "}
                        <span className="job-added-date">
                          📅 Added {getDaysAgo(job.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="job-actions d-flex align-items-center">
                    {/* Copy ID Button */}
                    <Button
                      variant="secondary"
                      size="sm"
                      className="me-2"
                      onClick={() => handleCopyJobId(job._id)}
                      title="Copy Job ID"
                      aria-label={`Copy ID for job ${job.job_title}`}
                    >
                      {copiedJobId === job._id ? <FaCheck /> : <FaCopy />}
                    </Button>
                    {/* Delete Job Button */}
                    <OverlayTrigger
                      placement="top"
                      overlay={<Tooltip>Delete This Job</Tooltip>}
                    >
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteJob(job._id)}
                        aria-label={`Delete job ${job.job_title}`}
                      >
                        <FaTrash />
                      </Button>
                    </OverlayTrigger>
                  </div>
                </li>
              ))
          )}
        </ul>

        {/* Bottom row of buttons with "Add Job" on the left, "Delete All" on the right */}
        {jobs.length > -1 && (
          <div className="job-list-buttons d-flex justify-content-between mt-3">
            {/* Add Job Button */}
            <Button
              variant="success"
              onClick={() => setShowAddJobModal(true)}
              className="d-flex align-items-center"
            >
              <FaPlus className="me-2" />
              Add Job
            </Button>

            {/* Delete All */}
            <OverlayTrigger placement="top" overlay={renderDeleteAllTooltip}>
              <Button
                variant="danger"
                onClick={() => setShowDeleteAllModal(true)}
                className="d-flex align-items-center"
              >
                <FaTrash className="me-2" />
                Delete All Jobs
              </Button>
            </OverlayTrigger>
          </div>
        )}
      </div>

      {/* Job Details Modal */}
      {selectedJob && (
        <JobCard job={selectedJob} onClose={() => setSelectedJob(null)} />
      )}

      {/* LinkedIn Search Form */}
      <Card className="mb-5 mt-5">
        <Card.Header as="h5" className="d-flex align-items-center">
          <FaLinkedin
            className="me-3 text-primary"
            style={{ fontSize: "2.5rem" }}
          />
          <FaSearch className="me-2" />
          Search & Save Jobs from LinkedIn
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleLinkedInSearch}>
            {/* LinkedIn form fields remain unchanged */}
            <Row>
              <Col xs="12" md="6" className="mb-3">
                <Form.Group controlId="formLinkedinUsername">
                  <Form.Label>
                    LinkedIn Email <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter your LinkedIn email address"
                    value={linkedinUsername}
                    onChange={(e) => setLinkedinUsername(e.target.value)}
                    required
                    aria-required="true"
                    aria-label="LinkedIn Email"
                  />
                  <Form.Text className="text-muted">
                    We'll use this email to access your LinkedIn account.
                  </Form.Text>
                </Form.Group>
              </Col>

              <Col xs="12" md="6" className="mb-3">
                <Form.Group controlId="formLinkedinPassword">
                  <Form.Label>
                    LinkedIn Password <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Enter your LinkedIn password"
                    value={linkedinPassword}
                    onChange={(e) => setLinkedinPassword(e.target.value)}
                    required
                    aria-required="true"
                    aria-label="LinkedIn Password"
                  />
                  <Form.Text className="text-muted">
                    We'll securely use this password to perform the job search.
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col xs="12" md="4" className="mb-3">
                <Form.Group controlId="formExperienceLevel">
                  <Form.Label>
                    Experience Level{" "}
                    <span className="text-muted">(Optional)</span>
                  </Form.Label>
                  <Form.Control
                    as="select"
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                    aria-label="Select Experience Level"
                  >
                    <option>No Filter</option>
                    <option>Entry Level</option>
                    <option>Mid-Senior</option>
                  </Form.Control>
                  <Form.Text className="text-muted">
                    Filter jobs based on your experience.
                  </Form.Text>
                </Form.Group>
              </Col>

              <Col xs="12" md="4" className="mb-3">
                <Form.Group controlId="formJobTitles">
                  <Form.Label>
                    Job Titles <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., Software Engineer, Marketing Manager"
                    value={jobTitles}
                    onChange={(e) => setJobTitles(e.target.value)}
                    required
                    aria-required="true"
                    aria-label="Job Titles"
                  />
                  <Form.Text className="text-muted">
                    Enter multiple job titles separated by commas.
                  </Form.Text>
                </Form.Group>
              </Col>

              <Col xs="12" md="4" className="mb-3">
                <Form.Group controlId="formMaxJobs">
                  <Form.Label>
                    Max Number of Jobs{" "}
                    <span className="text-muted">(1 - 25)</span>{" "}
                    <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    max="25"
                    value={maxJobs}
                    onChange={(e) => setMaxJobs(e.target.value)}
                    required
                    aria-required="true"
                    aria-label="Maximum Number of Jobs to Search"
                  />
                  <Form.Text className="text-muted">
                    Set the limit for the number of jobs to retrieve.
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            {/* LinkedIn Loading / Success Alerts */}
            {linkedinLoading && (
              <Alert variant="info" className="mt-3">
                This action may take several minutes. Please wait...
              </Alert>
            )}
            {linkedinSuccess && (
              <Alert variant="success" className="mt-3">
                Operation complete! Jobs have been saved successfully.
              </Alert>
            )}

            <Button variant="success" type="submit" disabled={linkedinLoading}>
              {linkedinLoading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                  />{" "}
                  Searching...
                </>
              ) : (
                "Search & Save Jobs"
              )}
            </Button>
          </Form>
        </Card.Body>
      </Card>

      {/* Add Job Modal */}
      <Modal
        show={showAddJobModal}
        onHide={() => setShowAddJobModal(false)}
        centered
        aria-labelledby="add-job-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title id="add-job-modal">
            <FaPlus className="me-2" />
            Add a New Job
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSaveJob}>
            <Row className="mb-3">
              <Col xs="12" md="6" className="mb-3">
                <Form.Group controlId="formJobTitle">
                  <Form.Label>
                    Job Title <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., Frontend Developer"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    required
                    aria-required="true"
                    aria-label="Job Title"
                  />
                </Form.Group>
              </Col>

              <Col xs="12" md="6" className="mb-3">
                <Form.Group controlId="formCompanyName">
                  <Form.Label>Company Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., Google"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    aria-label="Company Name"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group controlId="formJobLink" className="mb-3">
              <Form.Label>Job Link (Optional)</Form.Label>
              <Form.Control
                type="url"
                placeholder="https://www.linkedin.com/jobs/view/12345"
                value={jobLink}
                onChange={(e) => setJobLink(e.target.value)}
                aria-label="Job Link"
              />
            </Form.Group>

            <Form.Group controlId="formJobDescription" className="mb-3">
              <Form.Label>
                Job Description <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Brief description of responsibilities and requirements."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                required
                aria-required="true"
                aria-label="Job Description"
              />
            </Form.Group>

            <div className="text-end">
              <Button
                variant="secondary"
                onClick={() => setShowAddJobModal(false)}
                className="me-2"
              >
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                    />{" "}
                    Saving...
                  </>
                ) : (
                  "Save Job"
                )}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Delete All Confirmation Modal */}
      <Modal
        show={showDeleteAllModal}
        onHide={() => setShowDeleteAllModal(false)}
        centered
        aria-labelledby="delete-all-jobs-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title id="delete-all-jobs-modal">
            Confirm Delete All Jobs
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Are you sure you want to delete <strong>ALL</strong> your saved
            jobs? This action cannot be undone.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowDeleteAllModal(false)}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteAllJobs}>
            <FaTrash className="me-2" />
            Delete All
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Jobs;
