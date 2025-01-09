// src/components/Jobs.jsx
import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance"; // Use the custom axios instance
import JobCard from "../components/JobCard.jsx";

import {
  FaInfoCircle,
  FaTrash,
  FaPlus,
  FaSearch,
  FaTimes,
  FaLinkedin, // Import LinkedIn icon
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

function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  // For LinkedIn search
  const [linkedinUsername, setLinkedinUsername] = useState("");
  const [linkedinPassword, setLinkedinPassword] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("No Filter");
  const [jobTitles, setJobTitles] = useState("");
  const [maxJobs, setMaxJobs] = useState(10);

  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCompany, setFilterCompany] = useState("");

  // Loading and Error States
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // LinkedIn Search Status States
  const [linkedinLoading, setLinkedinLoading] = useState(false);
  const [linkedinSuccess, setLinkedinSuccess] = useState(false);

  // Delete All Confirmation Modal
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);

  // **Added State for Job Link**
  const [jobLink, setJobLink] = useState("");

  // Function to fetch all jobs
  const fetchJobs = async () => {
    try {
      const response = await axiosInstance.get("/jobs");
      setJobs(response.data);
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
      setError("Unable to retrieve jobs. Please try again later.");
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // Function to search jobs by title
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

  // Handle Search Button Click
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim() === "" && filterCompany.trim() === "") {
      // If both search term and filter are empty, fetch all jobs
      fetchJobs();
    } else {
      // Perform server-side search and client-side filter
      if (searchTerm.trim() !== "") {
        searchJobsByTitle(searchTerm.trim());
      }
      // Client-side filter will be applied in the rendering logic
    }
  };

  const handleSaveJob = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("job_title", jobTitle);
      formData.append("company_name", companyName);
      formData.append("job_description", jobDescription);
      formData.append("job_link", jobLink); // Append Job Link if needed

      await axiosInstance.post("/jobs/save", formData, {
        headers: {
          // 'Content-Type': 'multipart/form-data', // Let Axios set this automatically
        },
      });

      alert("Job saved successfully!");
      setJobTitle("");
      setCompanyName("");
      setJobDescription("");
      setJobLink(""); // Clear Job Link
      fetchJobs();
    } catch (err) {
      console.error("Failed to save job:", err);
      setError(
        err.response?.data?.detail ||
          "Failed to save job. Please ensure all required fields are filled correctly."
      );
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleLinkedInSearch = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!linkedinUsername || !linkedinPassword || !jobTitles || !maxJobs) {
      alert("Please fill in all required fields.");
      return;
    }

    const jobTitlesArray = jobTitles
      .split(",")
      .map((title) => title.trim())
      .filter((title) => title);
    const experienceLevelValue =
      experienceLevel === "No Filter"
        ? "no filter"
        : experienceLevel.toLowerCase();

    setLinkedinLoading(true);
    setLinkedinSuccess(false);
    setError("");

    try {
      const formData = new FormData();
      formData.append("linkedin_username", linkedinUsername);
      formData.append("linkedin_password", linkedinPassword);
      formData.append("maxNumberOfJobsTosearch", maxJobs);
      formData.append("experience_level", experienceLevelValue);

      jobTitlesArray.forEach((title) => formData.append("job_titles", title));

      await axiosInstance.post("/jobs/linkedin/search", formData, {
        headers: {
          // 'Content-Type': 'multipart/form-data', // Removed to let Axios set it correctly
        },
      });

      setLinkedinSuccess(true);
      alert("LinkedIn jobs searched & saved successfully!");
      // Clear LinkedIn search fields
      setLinkedinUsername("");
      setLinkedinPassword("");
      setExperienceLevel("No Filter");
      setJobTitles("");
      setMaxJobs(10);
      fetchJobs();
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

  // Tooltip for Delete All Button
  const renderDeleteAllTooltip = (props) => (
    <Tooltip id="button-tooltip" {...props}>
      Permanently delete all your saved jobs. This action cannot be undone.
    </Tooltip>
  );

  return (
    <div className="jobs-container">
      <h2>My Saved Jobs</h2>

      {/* Alert for Errors */}
      {error && (
        <Alert variant="danger" onClose={() => setError("")} dismissible>
          <FaInfoCircle className="me-2" />
          {error}
        </Alert>
      )}

      {/* Loading Spinner */}
      {isLoading && (
        <div className="text-center my-3">
          <Spinner animation="border" role="status" />
          <span className="ms-2">Loading...</span>
        </div>
      )}

      {/* Job List and Integrated Search */}
      <div className="job-list-wrapper">
        {/* Search and Filter */}
        <Card className="mb-4">
          <Card.Body>
            <Form onSubmit={handleSearch}>
              <Row className="align-items-end">
                <Col xs="12" md="4" className="mb-3">
                  <Form.Label htmlFor="searchJobTitle">
                    <strong>Search by Job Title</strong>
                  </Form.Label>
                  <InputGroup>
                    <InputGroup.Text>
                      <FaSearch />
                    </InputGroup.Text>
                    <Form.Control
                      id="searchJobTitle"
                      type="text"
                      placeholder="e.g., Software Engineer"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      aria-label="Search by Job Title"
                    />
                  </InputGroup>
                  <Form.Text className="text-muted">
                    Enter the job title you are looking for.
                  </Form.Text>
                </Col>

                <Col xs="12" md="4" className="mb-3">
                  <Form.Label htmlFor="filterCompany">
                    <strong>Filter by Company Name</strong>
                  </Form.Label>
                  <Form.Control
                    id="filterCompany"
                    type="text"
                    placeholder="e.g., Google"
                    value={filterCompany}
                    onChange={(e) => setFilterCompany(e.target.value)}
                    aria-label="Filter by Company Name"
                  />
                  <Form.Text className="text-muted">
                    Narrow down jobs by specifying the company name.
                  </Form.Text>
                </Col>

                <Col xs="12" md="4" className="mb-3 d-flex">
                  <Button
                    variant="primary"
                    type="submit"
                    className="me-2 flex-grow-1"
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
                    className="flex-grow-1"
                  >
                    <FaTimes className="me-1" />
                    Clear
                  </Button>
                </Col>
              </Row>
            </Form>
          </Card.Body>
        </Card>

        {/* Job List */}
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
                  <div className="job-info">
                    <FaInfoCircle className="me-2 text-primary" />{" "}
                    {/* Job Icon */}
                    <strong>{job.job_title}</strong> at{" "}
                    {job.company_name || "N/A"} (ID: {job._id})
                  </div>
                  <div className="job-actions">
                    <OverlayTrigger
                      placement="top"
                      overlay={<Tooltip>View Details</Tooltip>}
                    >
                      <Button
                        variant="info"
                        size="sm"
                        className="me-2"
                        onClick={() => setSelectedJob(job)}
                        aria-label={`View details for ${job.job_title}`}
                      >
                        <FaInfoCircle />
                      </Button>
                    </OverlayTrigger>
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

        {/* Delete All Jobs Button */}
        {jobs.length > 0 && (
          <div className="d-flex justify-content-end mt-3">
            <OverlayTrigger placement="top" overlay={renderDeleteAllTooltip}>
              <Button
                variant="danger"
                onClick={() => setShowDeleteAllModal(true)}
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
          <FaLinkedin className="me-2 text-primary" />
          <FaSearch className="me-2" />
          Search & Save Jobs from LinkedIn
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleLinkedInSearch}>
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

            {/* Informational Alert */}
            {linkedinLoading && (
              <Alert variant="info" className="mt-3">
                This action may take several minutes. Please wait...
              </Alert>
            )}

            {/* Success Alert */}
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

      {/* Save Job Form */}
      <Card className="mt-5 mb-4">
        <Card.Header as="h5">
          <FaPlus className="me-2" />
          Save a New Job
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSaveJob}>
            <Row>
              <Col xs="12" md="6" className="mb-3">
                <Form.Group controlId="formJobTitle">
                  <Form.Label>
                    Job Title <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter the job title (e.g., Frontend Developer)"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    required
                    aria-required="true"
                    aria-label="Job Title"
                  />
                  <Form.Text className="text-muted">
                    Provide a clear and specific job title.
                  </Form.Text>
                </Form.Group>
              </Col>

              <Col xs="12" md="6" className="mb-3">
                <Form.Group controlId="formCompanyName">
                  <Form.Label>Company Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter the company name (e.g., OpenAI)"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    aria-label="Company Name"
                  />
                  <Form.Text className="text-muted">
                    Optional: Specify the company offering the job.
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            {/* Optional Job Link Field */}
            <Row>
              <Col xs="12" className="mb-3">
                <Form.Group controlId="formJobLink">
                  <Form.Label>Job Link</Form.Label>
                  <Form.Control
                    type="url"
                    placeholder="Enter the job link (e.g., https://www.linkedin.com/jobs/view/12345)"
                    value={jobLink}
                    onChange={(e) => setJobLink(e.target.value)}
                    aria-label="Job Link"
                  />
                  <Form.Text className="text-muted">
                    Optional: Provide a link to the job posting.
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col xs="12">
                <Form.Group controlId="formJobDescription" className="mb-3">
                  <Form.Label>
                    Job Description <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Provide a brief description of the job responsibilities and requirements."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    required
                    aria-required="true"
                    aria-label="Job Description"
                  />
                  <Form.Text className="text-muted">
                    Include key details to help you remember the job.
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

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
          </Form>
        </Card.Body>
      </Card>

      {/* Delete All Jobs Confirmation Modal */}
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
