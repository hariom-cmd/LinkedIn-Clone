import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Image, Modal, Form } from 'react-bootstrap';
import { FaThumbsUp, FaComment, FaShare } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [currentPost, setCurrentPost] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [profilePic, setProfilePic] = useState("https://randomuser.me/api/portraits/men/99.jpg");
  const [suggestedConnections, setSuggestedConnections] = useState([
    {
      id: 1,
      name: "Alex Johnson",
      title: "Front-end Developer",
      profilePic: "https://randomuser.me/api/portraits/men/45.jpg",
    },
    {
      id: 2,
      name: "Sarah Wilson",
      title: "Product Manager",
      profilePic: "https://randomuser.me/api/portraits/women/45.jpg",
    }
  ]);
  const [myConnections, setMyConnections] = useState([]);
  const navigate = useNavigate();
  
  // Current user ID (would come from auth in a real app)
  const currentUserId = 999;
  
  // Fetch user data and posts
  useEffect(() => {
    // Fetch posts
    fetch('/posts.json')
      .then(response => response.json())
      .then(data => {
        // Load comments from localStorage for each post
        const postsWithSavedComments = data.map(post => {
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
      })
      .catch(error => console.error('Error fetching posts:', error));
      
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
      
    // Load connections from localStorage
    const storedConnections = localStorage.getItem('connections');
    if (storedConnections) {
      setMyConnections(JSON.parse(storedConnections));
      
      // Remove already connected people from suggestions
      const connectedIds = JSON.parse(storedConnections).map(conn => conn.id);
      setSuggestedConnections(prev => 
        prev.filter(conn => !connectedIds.includes(conn.id))
      );
    }
  }, [currentUserId]);

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
    saveToLocalStorage(postId, updatedPosts.find(p => p.id === postId).likes);
  };

  // Save likes to localStorage
  const saveToLocalStorage = (postId, likeCount) => {
    localStorage.setItem(`post_${postId}_likes`, likeCount);
  };

  // Open comment modal
  const handleCommentClick = (post) => {
    setCurrentPost(post);
    setShowCommentModal(true);
  };
  
  // Navigate to user profile
  const handleProfileClick = (userId) => {
    navigate(`/profile/${userId}`);
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
        profilePic: profilePic // Use the fetched profile picture
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

  // Handle connecting with a suggested person
  const handleConnect = (connection) => {
    // Check if the connection already exists in myConnections
    if (myConnections.some(conn => conn.id === connection.id)) {
      return; // Connection already exists, don't add again
    }
    
    // Remove from suggestions
    setSuggestedConnections(prev => 
      prev.filter(conn => conn.id !== connection.id)
    );
    
    // Add to connections with connected flag
    const newConnection = {
      ...connection,
      connected: true
    };
    
    const updatedConnections = [...myConnections, newConnection];
    setMyConnections(updatedConnections);
    
    // Save to localStorage
    localStorage.setItem('connections', JSON.stringify(updatedConnections));
  };
  
  // Handle dismissing a suggested connection
  const handleDismiss = (connectionId) => {
    setSuggestedConnections(prev => 
      prev.filter(conn => conn.id !== connectionId)
    );
  };

  // Format date to readable format
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <Container className="home-container py-4">
      <Row>
        {/* Left sidebar */}
        <Col lg={3} className="d-none d-lg-block">
          <Card className="profile-card mb-3">
            <div className="profile-background"></div>
            <div className="profile-info text-center">
              <Image 
                src={profilePic} 
                roundedCircle 
                className="profile-pic mb-2" 
              />
              <h5>Your Name</h5>
              <p className="text-muted">Software Developer</p>
            </div>
            <hr />
            <div className="profile-stats p-3">
              <div className="d-flex justify-content-between">
                <span>Profile views</span>
                <span className="text-primary">42</span>
              </div>
              <div className="d-flex justify-content-between mt-2">
                <span>Post impressions</span>
                <span className="text-primary">128</span>
              </div>
            </div>
          </Card>
        </Col>

        {/* Main content - Posts feed */}
        <Col lg={6} md={8} sm={12}>
          {posts.map(post => (
            <Card key={post.id} className="post-card mb-3">
              <Card.Body>
                {/* Post header with user info */}
                <div className="d-flex align-items-center mb-3">
                  <Image 
                    src={post.user.profilePic} 
                    roundedCircle 
                    className="post-profile-pic me-2 clickable-profile"
                    onClick={() => handleProfileClick(post.user.id)} 
                  />
                  <div className="clickable-profile" onClick={() => handleProfileClick(post.user.id)}>
                    <h6 className="mb-0">{post.user.name}</h6>
                    <small className="text-muted">{post.user.title}</small>
                    <div>
                      <small className="text-muted">{formatDate(post.timestamp)}</small>
                    </div>
                  </div>
                </div>
                
                {/* Post content */}
                <Card.Text>{post.content}</Card.Text>
                
                {/* Post image if available */}
                {post.image && (
                  <div className="post-image-container mb-3">
                    <img 
                      src={post.image} 
                      alt="Post content" 
                      className="post-image img-fluid rounded" 
                    />
                  </div>
                )}
                
                {/* Likes counter */}
                {post.likes > 0 && (
                  <div className="likes-counter mb-2">
                    <small>
                      <FaThumbsUp className="text-primary me-1" size={14} />
                      {post.likes}
                    </small>
                  </div>
                )}
                
                <hr />
                
                {/* Action buttons */}
                <div className="post-actions d-flex justify-content-between">
                  <Button 
                    variant="light" 
                    className="d-flex align-items-center" 
                    onClick={() => handleLike(post.id)}
                  >
                    <FaThumbsUp className="me-2" /> Like
                  </Button>
                  
                  <Button 
                    variant="light" 
                    className="d-flex align-items-center"
                    onClick={() => handleCommentClick(post)}
                  >
                    <FaComment className="me-2" /> Comment
                  </Button>
                  
                  <Button 
                    variant="light" 
                    className="d-flex align-items-center"
                  >
                    <FaShare className="me-2" /> Share
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
          ))}
        </Col>

        {/* Right sidebar */}
        <Col lg={3} md={4} className="d-none d-md-block">
          <Card className="news-card mb-3">
            <Card.Body>
              <h5 className="mb-3">LinkedIn News</h5>
              <ul className="news-list ps-3">
                <li className="mb-2">Tech industry continues to grow despite challenges</li>
                <li className="mb-2">Remote work remains popular in post-pandemic world</li>
                <li className="mb-2">New study reveals top skills employers look for in 2023</li>
                <li className="mb-2">Startup funding reaches new highs in Q2</li>
                <li className="mb-2">AI integration becoming standard across industries</li>
              </ul>
            </Card.Body>
          </Card>
          
          <Card>
            <Card.Body>
              <h5 className="mb-3">Suggested Connections</h5>
              {suggestedConnections.length > 0 ? (
                suggestedConnections.map(connection => (
                  <div key={connection.id} className="suggested-connection mb-3">
                    <div className="d-flex align-items-center">
                      <Image 
                        src={connection.profilePic} 
                        roundedCircle 
                        width={50} 
                        height={50} 
                        className="me-2"
                      />
                      <div>
                        <h6 className="mb-0">{connection.name}</h6>
                        <small className="text-muted">{connection.title}</small>
                        <div className="mt-2">
                          <Button 
                            size="sm" 
                            variant="outline-primary" 
                            className="me-2"
                            onClick={() => handleConnect(connection)}
                          >
                            Connect
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline-secondary"
                            onClick={() => handleDismiss(connection.id)}
                          >
                            Dismiss
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted my-4">No suggested connections at this time.</p>
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
    </Container>
  );
};

export default Home; 