import React, { useState, useEffect } from 'react';
import { Navbar, Container, Nav, Form, FormControl, Button, Image } from 'react-bootstrap';
import { FaHome, FaUserFriends, FaBriefcase, FaComments, FaBell, FaSearch } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

const LinkedInNavbar = ({ onLogout }) => {
  const navigate = useNavigate();
  const [profilePic, setProfilePic] = useState("https://randomuser.me/api/portraits/men/99.jpg");
  
  // In a real app, we would get the current user ID from auth state
  // For now, we'll use a hardcoded ID for the current user
  const currentUserId = 101;
  
  useEffect(() => {
    // Fetch user data to get the profile picture
    const fetchUserData = async () => {
      try {
        const userResponse = await fetch('/users.json');
        const userData = await userResponse.json();
        const currentUser = userData.find(u => u.id === currentUserId) || userData[0];
        if (currentUser && currentUser.profilePic) {
          setProfilePic(currentUser.profilePic);
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
      }
    };
    
    fetchUserData();
  }, [currentUserId]);
  
  const handleProfileClick = () => {
    navigate(`/profile/${currentUserId}`);
  };
  
  return (
    <Navbar bg="white" expand="lg" className="linkedin-navbar shadow-sm py-1 sticky-top">
      <Container>
        {/* Logo */}
        <Navbar.Brand as={Link} to="/home" className="me-2">
          <h2 className="text-primary fw-bold m-0">in</h2>
        </Navbar.Brand>
        
        {/* Search Bar */}
        <Form className="d-flex search-container mx-2 flex-grow-1">
          <div className="position-relative w-100">
            <FormControl
              type="search"
              placeholder="Search"
              className="search-input"
              aria-label="Search"
            />
          </div>
        </Form>
        
        {/* Main Navigation */}
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/home" className="nav-icon-link text-center mx-1">
              <FaHome size={20} />
              <div className="nav-text">Home</div>
            </Nav.Link>
            <Nav.Link as={Link} to="/network" className="nav-icon-link text-center mx-1">
              <FaUserFriends size={20} />
              <div className="nav-text">My Network</div>
            </Nav.Link>
            <Nav.Link as={Link} to="/jobs" className="nav-icon-link text-center mx-1">
              <FaBriefcase size={20} />
              <div className="nav-text">Jobs</div>
            </Nav.Link>
            <Nav.Link as={Link} to="/messaging" className="nav-icon-link text-center mx-1">
              <FaComments size={20} />
              <div className="nav-text">Messaging</div>
            </Nav.Link>
            <Nav.Link as={Link} to="/notifications" className="nav-icon-link text-center mx-1">
              <FaBell size={20} />
              <div className="nav-text">Notifications</div>
            </Nav.Link>
            <Nav.Link onClick={handleProfileClick} className="nav-icon-link text-center mx-1">
              <Image 
                src={profilePic} 
                roundedCircle 
                width={24} 
                height={24} 
                className="mb-1" 
              />
              <div className="nav-text">Me</div>
            </Nav.Link>
            <Button 
              variant="outline-danger" 
              size="sm" 
              className="ms-2 mt-1" 
              onClick={onLogout}
            >
              Logout
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default LinkedInNavbar; 