import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Image, Modal, Form, Toast } from 'react-bootstrap';
import { FaThumbsUp, FaComment, FaShare, FaPen, FaBriefcase, FaUserPlus } from 'react-icons/fa';
import './UserProfile.css';

const UserProfile = () => {
  const { userId } = useParams(); // Extracted from URL to identify the user whose profile is being viewed.
  const [user, setUser] = useState(null); // Stores user details fetched from an API.
  const [posts, setPosts] = useState([]); // Stores the user's posts.
  const [suggestions, setSuggestions] = useState([]); // List of suggested people to connect with.
  const [loading, setLoading] = useState(true); // Indicates if data is being fetched.
  const [error, setError] = useState(null); // Stores any error messages during data fetching.
  const [editMode, setEditMode] = useState(false); // Tracks whether the user is in profile edit mode.
  const [bio, setBio] = useState(''); // Manage editable profile information.
  const [jobTitle, setJobTitle] = useState(''); // 
  const [showCommentModal, setShowCommentModal] = useState(false); // Controls visibility of the comment modal.
  const [currentPost, setCurrentPost] = useState(null); //Stores the post the user is commenting on.
  const [commentText, setCommentText] = useState(''); // Holds comment input text.
  const [myConnections, setMyConnections] = useState([]); // Stores the user's connections (fetched from localStorage).
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Generate connection suggestions based on the user's industry, skills, and mutual connections
  const generateSuggestions = (userData, currentUser) => {
    // Filter out the current user and existing connections
    const potentialConnections = userData.filter(u => {
      // Skip current user
      if (u.id.toString() === currentUser.id.toString()) return false;
      
      // Skip existing connections
      if (myConnections.some(conn => conn.id === u.id)) return false;
      
      return true;
    });
    
    // Calculate relevance score for each potential connection
    const scoredConnections = potentialConnections.map(person => {
      let score = 0;
      
      // Same industry/company gets more points
      if (person.company === currentUser.company) score += 5;
      
      // Same job title or similar role gets points
      if (person.jobTitle && currentUser.jobTitle && 
          person.jobTitle.toLowerCase().includes(currentUser.jobTitle.toLowerCase())) {
        score += 3;
      }
      
      // Fake mutual connections (in real app would come from backend)
      const mutualCount = Math.floor(Math.random() * 15) + 1;
      score += mutualCount;
      
      return {
        ...person,
        relevanceScore: score,
        mutualConnections: mutualCount
      };
    });
    
    // Sort by relevance score and take top 5
    return scoredConnections
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 5);
  };

  // Fetch user data and posts
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Simulate API call with artificial delay
        setLoading(true);
        
        // Fetch user data
        const userResponse = await fetch('/users.json');
        const userData = await userResponse.json();
        
        // Convert userId to string to ensure comparison works properly
        // Some browsers might pass userId as a string, causing parseInt to fail or work inconsistently
        const userIdStr = userId.toString();
        const foundUser = userData.find(u => u.id.toString() === userIdStr);
        
        if (foundUser) {
          // Check for saved profile data in localStorage
          const savedBio = localStorage.getItem('userBio');
          const savedJobTitle = localStorage.getItem('userJobTitle');
          
          if (savedBio) foundUser.bio = savedBio;
          if (savedJobTitle) foundUser.jobTitle = savedJobTitle;
          
          setUser(foundUser);
          setBio(foundUser.bio);
          setJobTitle(foundUser.jobTitle);
          
          // Fetch posts
          const postsResponse = await fetch('/posts.json');
          const postsData = await postsResponse.json();
          const userPosts = postsData.filter(post => post.user.id === foundUser.id);
          
          // Load comments from localStorage for each post
          const postsWithSavedComments = userPosts.map(post => {
            const savedComments = localStorage.getItem(`post_${post.id}_comments`);
            if (savedComments) {
              return {
                ...post,
                comments: JSON.parse(savedComments)
              };
            }
            return post;
          });
          
          setPosts(postsWithSavedComments);
          
          // Load existing connections from localStorage
          const storedConnections = localStorage.getItem('connections');
          if (storedConnections) {
            setMyConnections(JSON.parse(storedConnections));
          }
          
          // Generate connection suggestions
          const suggestedPeople = generateSuggestions(userData, foundUser);
          setSuggestions(suggestedPeople);
        } else {
          setError("User not found");
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError("Error loading profile");
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [userId]);

  // Handle the connect button click
  const handleConnect = (person) => {
    // Check if the connection already exists in myConnections
    if (myConnections.some(conn => conn.id === person.id)) {
      return; // Connection already exists, don't add again
    }
    
    // Update suggestions list by removing the connected person
    setSuggestions(suggestions.filter(p => p.id !== person.id));
    
    // Create connection object with connected flag
    const newConnection = {
      ...person,
      connected: true
    };
    
    // Add to my connections
    const updatedConnections = [...myConnections, newConnection];
    setMyConnections(updatedConnections);
    
    // Save to localStorage
    localStorage.setItem('connections', JSON.stringify(updatedConnections));
    
    // Show success toast
    setToastMessage(`Connection request sent to ${person.name}`);
    setShowToast(true);
  };

  // Handle dismissing a suggested connection
  const handleDismiss = (personId) => {
    // Remove the person from suggestions
    setSuggestions(suggestions.filter(p => p.id !== personId));
  };

  // Handle like button click
  const handleLike = (postId) => {
    // Update UI immediately
    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        // Create a new post object with increased likes
        return { ...post, likes: post.likes + 1 };
      }
      return post;
    });
    setPosts(updatedPosts);
    
    // Save to localStorage
    localStorage.setItem(`post_${postId}_likes`, updatedPosts.find(p => p.id === postId).likes);
  };

  // Open comment modal
  const handleCommentClick = (post) => {
    setCurrentPost(post);
    setShowCommentModal(true);
  };

  // Handle comment submission
  const handleSubmitComment = (e) => {
    e.preventDefault();
    
    if (!commentText.trim()) return;

    // Create new comment
    const newComment = {
      id: Date.now(),
      user: {
        id: 101, // Assuming current user id
        name: "Current User", // This would come from auth
        profilePic: user.profilePic // Use the same profile pic as the current user
      },
      content: commentText,
      timestamp: new Date().toISOString()
    };

    // Update posts with new comment
    const updatedPosts = posts.map(post => {
      if (post.id === currentPost.id) {
        const updatedComments = [...post.comments, newComment];
        
        // Save comments to localStorage
        localStorage.setItem(`post_${post.id}_comments`, JSON.stringify(updatedComments));
        
        return {
          ...post,
          comments: updatedComments
        };
      }
      return post;
    });

    setPosts(updatedPosts);
    setCommentText('');
    setShowCommentModal(false);
  };

  // Format date to readable format
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Handle save profile changes
  const handleSaveProfile = () => {
    // In a real app, we would send this to the server
    // For now, we'll just update the local state
    setUser({
      ...user,
      bio: bio,
      jobTitle: jobTitle,
      headline: `${jobTitle} at ${user.company}`
    });
    
    // Save to localStorage
    localStorage.setItem('userBio', bio);
    localStorage.setItem('userJobTitle', jobTitle);
    
    setEditMode(false);
  };

  if (loading) return <div className="text-center my-5">Loading...</div>;
  if (error) return <div className="text-center my-5 text-danger">{error}</div>;
  if (!user) return <div className="text-center my-5">User not found</div>;

  return (
    <Container className="profile-container py-4">
      <Row>
        {/* Main content */}
        <Col lg={8}>
          {/* Profile header card */}
          <Card className="mb-4 profile-header-card">
            <div className="profile-background"></div>
            <Card.Body className="pb-0">
              <div className="profile-header-content">
                <Image 
                  src={user.profilePic} 
                  roundedCircle 
                  className="profile-pic" 
                />
                <div className="profile-info mt-3">
                  <div className="d-flex justify-content-between align-items-start">
                    <h3>{user.name}</h3>
                    {!editMode && (
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        onClick={() => setEditMode(true)}
                      >
                        <FaPen /> Edit Profile
                      </Button>
                    )}
                  </div>
                  <p className="text-muted mb-1">{user.headline}</p>
                  <p className="mb-1">{user.connections} connections</p>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* About section */}
          <Card className="mb-4">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <h5 className="card-title">About</h5>
              </div>
              
              {editMode ? (
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>Bio</Form.Label>
                    <Form.Control 
                      as="textarea" 
                      rows={3} 
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Job Title</Form.Label>
                    <Form.Control 
                      type="text" 
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                    />
                  </Form.Group>
                  
                  <div className="d-flex gap-2">
                    <Button 
                      variant="primary" 
                      onClick={handleSaveProfile}
                    >
                      Save
                    </Button>
                    <Button 
                      variant="outline-secondary" 
                      onClick={() => {
                        setEditMode(false);
                        setBio(user.bio);
                        setJobTitle(user.jobTitle);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </Form>
              ) : (
                <div>
                  <p>{user.bio}</p>
                  <div className="d-flex align-items-center mt-3">
                    <FaBriefcase className="me-2 text-muted" />
                    <span>{user.jobTitle} at {user.company}</span>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Posts section */}
          <h5 className="mb-3">Posts</h5>
          
          {posts.length === 0 ? (
            <Card className="mb-4">
              <Card.Body className="text-center py-5">
                <p className="text-muted mb-0">No posts yet</p>
              </Card.Body>
            </Card>
          ) : (
            posts.map(post => (
              <Card key={post.id} className="mb-4 post-card">
                <Card.Body>
                  <div className="d-flex mb-3">
                    <Image 
                      src={post.user.profilePic} 
                      roundedCircle 
                      className="post-profile-pic me-3" 
                    />
                    <div>
                      <h6 className="mb-0">{post.user.name}</h6>
                      <p className="text-muted small mb-0">{post.user.title}</p>
                      <p className="text-muted smaller mb-0">{formatDate(post.timestamp)}</p>
                    </div>
                  </div>
                  
                  <p>{post.content}</p>
                  
                  {post.image && (
                    <Image 
                      src={post.image} 
                      fluid 
                      className="post-image mb-3" 
                    />
                  )}
                  
                  <div className="d-flex justify-content-between post-stats px-2">
                    <div className="d-flex">
                      <span className="me-1">{post.likes}</span>
                      <FaThumbsUp className="text-primary" />
                    </div>
                    <div>
                      <span>{post.comments.length} comments</span>
                    </div>
                  </div>
                  
                  <hr/>
                  
                  <div className="d-flex justify-content-around">
                    <Button 
                      variant="link" 
                      className="post-action-btn" 
                      onClick={() => handleLike(post.id)}
                    >
                      <FaThumbsUp className="me-1" /> Like
                    </Button>
                    <Button 
                      variant="link" 
                      className="post-action-btn"
                      onClick={() => handleCommentClick(post)}
                    >
                      <FaComment className="me-1" /> Comment
                    </Button>
                    <Button 
                      variant="link" 
                      className="post-action-btn"
                    >
                      <FaShare className="me-1" /> Share
                    </Button>
                  </div>
                  
                  {/* Comments Section */}
                  {post.comments && post.comments.length > 0 && (
                    <div className="mt-3 comments-section">
                      <h6 className="text-muted mb-3 small">Comments</h6>
                      {post.comments.map(comment => (
                        <div key={comment.id} className="comment d-flex mb-2">
                          <Image 
                            src={comment.user.profilePic} 
                            roundedCircle 
                            width={32} 
                            height={32}
                            className="me-2 mt-1" 
                          />
                          <div className="comment-content p-2 bg-light rounded">
                            <div className="d-flex justify-content-between">
                              <h6 className="mb-0 small">{comment.user.name}</h6>
                              <small className="text-muted">{formatDate(comment.timestamp)}</small>
                            </div>
                            <p className="mb-0">{comment.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card.Body>
              </Card>
            ))
          )}
        </Col>
        
        {/* Right sidebar */}
        <Col lg={4}>
          <Card className="mb-4">
            <Card.Body>
              <h5 className="suggestion-title">People You May Know</h5>
              {suggestions.length === 0 ? (
                <p className="text-muted text-center my-4">No suggestions available at the moment</p>
              ) : (
                suggestions.map(person => (
                  <div key={person.id} className="suggestion-item">
                    <div className="d-flex">
                      <Image 
                        src={person.profilePic} 
                        roundedCircle 
                        className="suggestion-pic me-3" 
                      />
                      <div>
                        <h6 className="mb-0">{person.name}</h6>
                        <p className="text-muted small mb-1">{person.headline || `${person.jobTitle} at ${person.company}`}</p>
                        <div className="mutual-connections mb-2">
                          <span className="mutual-connections-icon">●</span>
                          <span>{person.mutualConnections} mutual connections</span>
                        </div>
                        {person.company === user.company && (
                          <p className="text-muted small mb-2 bg-light px-2 py-1 rounded d-inline-block">
                            <strong>Works at {person.company}</strong>
                          </p>
                        )}
                        <div className="suggestion-actions">
                          <Button 
                            variant="outline-primary" 
                            size="sm"
                            onClick={() => handleConnect(person)}
                          >
                            Connect
                          </Button>
                          <Button 
                            variant="outline-secondary" 
                            size="sm"
                            onClick={() => handleDismiss(person.id)}
                          >
                            Dismiss
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
              {suggestions.length > 0 && (
                <div className="text-center mt-3">
                  <Button 
                    variant="link" 
                    className="text-decoration-none"
                    onClick={() => {
                      // This would typically load more suggestions
                      alert('This would load more suggestions in a real application');
                    }}
                  >
                    See more
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Comment Modal */}
      <Modal show={showCommentModal} onHide={() => setShowCommentModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add a comment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmitComment}>
            <Form.Group>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
            </Form.Group>
            <div className="d-flex justify-content-end mt-3">
              <Button variant="primary" type="submit">
                Post Comment
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

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

export default UserProfile; 