import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Image, Toast } from 'react-bootstrap';
import { FaUserPlus } from 'react-icons/fa';
import './Network.css';

const Network = () => {
  // In a real app, this data would come from an API
  const [suggestedConnections, setSuggestedConnections] = useState([
    {
      id: 1,
      name: "Jane Smith",
      title: "Software Engineer at Google",
      profilePic: "https://randomuser.me/api/portraits/women/32.jpg",
      connected: false
    },
    {
      id: 2,
      name: "Michael Johnson",
      title: "Product Manager at Amazon",
      profilePic: "https://randomuser.me/api/portraits/men/42.jpg",
      connected: false
    },
    {
      id: 3,
      name: "Emily Davis",
      title: "UX Designer at Apple",
      profilePic: "https://randomuser.me/api/portraits/women/43.jpg",
      connected: false
    },
    {
      id: 4,
      name: "Robert Wilson",
      title: "Data Scientist at Microsoft",
      profilePic: "https://randomuser.me/api/portraits/men/55.jpg",
      connected: false
    },
    {
      id: 5,
      name: "Sarah Taylor",
      title: "Marketing Manager at Netflix",
      profilePic: "https://randomuser.me/api/portraits/women/67.jpg",
      connected: false
    },
    {
      id: 6,
      name: "Hariom Saini",
      title: "Android Developer",
      profilePic: "https://randomuser.me/api/portraits/men/69.jpg",
      connected: false
    },
  ]);

  const [myConnections, setMyConnections] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // On component mount, load connections from localStorage
  useEffect(() => {
    const storedConnections = localStorage.getItem('connections');
    if (storedConnections) {
      setMyConnections(JSON.parse(storedConnections));
    }
  }, []);

  // Handle the connect button click
  const handleConnect = (connection) => {
    // Check if the connection already exists in myConnections
    if (myConnections.some(conn => conn.id === connection.id)) {
      return; // Connection already exists, don't add again
    }
    
    // Update suggested connections list
    setSuggestedConnections(suggestedConnections.filter(c => c.id !== connection.id));
    
    // Add to my connections
    const updatedConnections = [...myConnections, {...connection, connected: true}];
    setMyConnections(updatedConnections);
    
    // Save to localStorage
    localStorage.setItem('connections', JSON.stringify(updatedConnections));
    
    // Show success toast
    setToastMessage(`Connection request sent to ${connection.name}`);
    setShowToast(true);
  };

  // Handle dismissing a suggested connection
  const handleDismiss = (connectionId) => {
    // Remove the connection from suggestions
    setSuggestedConnections(suggestedConnections.filter(c => c.id !== connectionId));
  };

  // Handle removing a connection
  const handleRemoveConnection = (connectionId) => {
    // Remove from my connections
    const updatedConnections = myConnections.filter(conn => conn.id !== connectionId);
    setMyConnections(updatedConnections);
    
    // Save to localStorage
    localStorage.setItem('connections', JSON.stringify(updatedConnections));
  };

  return (
    <Container className="py-4">
      <Row>
        {/* Sidebar - People You May Know */}
        <Col md={4} lg={3} className="mb-4">
          <Card className="shadow-sm">
            <Card.Header className="bg-white">
              <h5 className="mb-0">People You May Know</h5>
            </Card.Header>
            <Card.Body className="p-0">
              {suggestedConnections.map(connection => (
                <div key={connection.id} className="connection-item p-3 border-bottom">
                  <div className="d-flex align-items-center">
                    <Image 
                      src={connection.profilePic} 
                      roundedCircle 
                      width={50} 
                      height={50} 
                      className="me-3"
                    />
                    <div className="connection-info flex-grow-1">
                      <h6 className="mb-0">{connection.name}</h6>
                      <small className="text-muted">{connection.title}</small>
                    </div>
                    <div>
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        className="me-2"
                        onClick={() => handleConnect(connection)}
                      >
                        Connect
                      </Button>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => handleDismiss(connection.id)}
                      >
                        Dismiss
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>
        
        {/* Main Content - My Connections */}
        <Col md={8} lg={9}>
          <Card className="shadow-sm">
            <Card.Header className="bg-white">
              <h5 className="mb-0">My Connections</h5>
            </Card.Header>
            <Card.Body>
              {myConnections.length === 0 ? (
                <p className="text-center text-muted my-4">You don't have any connections yet. Connect with people you may know to expand your network.</p>
              ) : (
                <Row xs={1} md={2} lg={3} className="g-4">
                  {myConnections.map(connection => (
                    <Col key={connection.id}>
                      <Card className="h-100 connection-card">
                        <Card.Body className="text-center">
                          <Image 
                            src={connection.profilePic} 
                            roundedCircle 
                            width={80} 
                            height={80} 
                            className="mb-3"
                          />
                          <Card.Title>{connection.name}</Card.Title>
                          <Card.Text className="text-muted small">
                            {connection.title}
                          </Card.Text>
                          <div className="mt-3 d-flex justify-content-center gap-2">
                            <Button variant="primary" size="sm">Message</Button>
                            <Button 
                              variant="outline-secondary" 
                              size="sm"
                              onClick={() => handleRemoveConnection(connection.id)}
                            >
                              Dismiss
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Toast notification */}
      <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: '9999' }}>
        <Toast 
          show={showToast} 
          onClose={() => setShowToast(false)} 
          delay={3000} 
          autohide
          bg="success"
          text="white"
        >
          <Toast.Header closeButton>
            <FaUserPlus className="me-2" />
            <strong className="me-auto">New Connection</strong>
          </Toast.Header>
          <Toast.Body>{toastMessage}</Toast.Body>
        </Toast>
      </div>
    </Container>
  );
};

export default Network; 