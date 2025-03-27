import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Modal, Image } from 'react-bootstrap';
import { FaBookmark, FaSearch, FaMapMarkerAlt } from 'react-icons/fa';
import './Jobs.css';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch jobs from the JSON file. After fetching the data, it updates both jobs and filteredJobs using setJobs and setFilteredJobs.
  useEffect(() => {
    fetch('/jobs.json')
      .then(response => response.json())
      .then(data => {
        setJobs(data);
        setFilteredJobs(data);
      })
      .catch(error => console.error('Error fetching jobs:', error));
  }, []);

  // Handle search input changes
  const handleSearchChange = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    // Filter jobs based on search term (title or location)
    const filtered = jobs.filter(job => 
      job.title.toLowerCase().includes(term) || 
      job.location.toLowerCase().includes(term) ||
      job.company.toLowerCase().includes(term)
    );
    
    setFilteredJobs(filtered);
  };

  // Open job description modal
  const openJobDetails = (job) => {
    setSelectedJob(job);
    setShowModal(true);
  };

  // Close job description modal
  const closeModal = () => {
    setShowModal(false);
  };

  // Saves the job ID to local storage to persist the saved jobs even after a page refresh.
  const saveJob = (jobId, event) => {
    event.stopPropagation(); // Prevent card click event from firing
    
    // Get saved jobs from localStorage or initialize empty array
    const savedJobs = JSON.parse(localStorage.getItem('savedJobs') || '[]');
    
    // Check if job is already saved
    if (!savedJobs.includes(jobId)) {
      // Add job to saved jobs
      savedJobs.push(jobId);
      localStorage.setItem('savedJobs', JSON.stringify(savedJobs)); // Converts the updated array back into a string so it can be stored in localStorage.
      alert('Job saved successfully!');
    } else {
      alert('This job is already saved!');
    }
  };

  return (
    <Container className="py-4">
      <h1 className="mb-4">Job Listings</h1>
      
      {/* Search bar */}
      <Form className="mb-4">
        <div className="position-relative">
          <Form.Control
            type="text"
            placeholder="Search by title, company, or location"
            value={searchTerm}
            onChange={handleSearchChange}
            className="job-search-input"
            />
            {/* <FaSearch className="position-absolute search-icon" /> */}
        </div>
      </Form>
      
      {/* Job listings */}
      <Row>
        {filteredJobs.length > 0 ? (
          filteredJobs.map(job => (
            <Col md={6} lg={4} key={job.id} className="mb-4">
              <Card 
                className="job-card h-100 shadow-sm" 
                onClick={() => openJobDetails(job)}
              >
                <Card.Body>
                  <div className="d-flex align-items-center mb-3">
                    <Image 
                      src={job.logo} 
                      alt={`${job.company} logo`} 
                      className="company-logo me-3" 
                    />
                    <div>
                      <h5 className="company-name mb-0">{job.company}</h5>
                    </div>
                  </div>
                  <h4 className="job-title">{job.title}</h4>
                  <p className="location mb-3">
                    <FaMapMarkerAlt className="me-1" />
                    {job.location}
                  </p>
                  <div className="d-flex justify-content-between align-items-center mt-auto">
                    <small className="text-muted">Posted: {job.posted}</small>
                    <Button 
                      variant="outline-primary" 
                      size="sm" 
                      onClick={(e) => saveJob(job.id, e)}
                      className="save-job-btn"
                    >
                      <FaBookmark className="me-1" />
                      Save Job
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))
        ) : (
          <Col className="text-center py-5">
            <h4>No jobs found matching your search criteria.</h4>
          </Col>
        )}
      </Row>
      
      {/* Job details modal */}
      <Modal show={showModal} onHide={closeModal} size="lg">
        {selectedJob && (
          <>
            <Modal.Header closeButton>
              <Modal.Title>{selectedJob.title} at {selectedJob.company}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="d-flex align-items-center mb-4">
                <Image 
                  src={selectedJob.logo} 
                  alt={`${selectedJob.company} logo`} 
                  className="company-logo-lg me-3" 
                />
                <div>
                  <h5 className="company-name mb-1">{selectedJob.company}</h5>
                  <p className="location mb-0">
                    <FaMapMarkerAlt className="me-1" />
                    {selectedJob.location}
                  </p>
                </div>
              </div>
              
              <h5>Job Description</h5>
              <p>{selectedJob.description}</p>
              
              <h5>Requirements</h5>
              <ul>
                {selectedJob.requirements.map((req, index) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
              
              <p className="text-muted">Posted: {selectedJob.posted}</p>
            </Modal.Body>
            <Modal.Footer>
              <Button 
                variant="outline-primary" 
                onClick={(e) => saveJob(selectedJob.id, e)}
              >
                <FaBookmark className="me-1" />
                Save Job
              </Button>
              <Button variant="primary">Apply Now</Button>
            </Modal.Footer>
          </>
        )}
      </Modal>
    </Container>
  );
};

export default Jobs; 