import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const AdminLogin = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Using the custom port and routing prefix from your app.js
  const API_BASE_URL = 'http://localhost:7001/blooddonationbackend';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({
      ...credentials,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!credentials.username || !credentials.password) {
      toast.warning('Please enter both username and password.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/login`, credentials);

      if (response.status === 200) {
        toast.success('Login Successful! Welcome Admin.');
        // If you build an Admin Dashboard later, you would navigate there.
        // For now, redirecting to the main dashboard.
        navigate('/dashboard'); 
      }
    } catch (error) {
      console.error('Login Error:', error);
      if (error.response && error.response.status === 401) {
        toast.error('Invalid username or password.');
      } else {
        toast.error('Server error. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page bg-light min-vh-100 d-flex align-items-center py-5">
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={5} xl={4}>
            <Card className="shadow-lg border-0 rounded-lg">
              <Card.Header className="bg-dark text-white text-center py-4 rounded-top">
                <h3 className="mb-0 fw-bold">Admin Portal</h3>
                <p className="mb-0 mt-1 text-white-50">Authorized Personnel Only</p>
              </Card.Header>
              <Card.Body className="p-4 p-md-5">
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-4" controlId="formUsername">
                    <Form.Label className="fw-semibold text-muted">Username</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter admin username"
                      name="username"
                      value={credentials.username}
                      onChange={handleChange}
                      className="py-2 bg-light"
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-4" controlId="formPassword">
                    <Form.Label className="fw-semibold text-muted">Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Enter password"
                      name="password"
                      value={credentials.password}
                      onChange={handleChange}
                      className="py-2 bg-light"
                      required
                    />
                  </Form.Group>

                  <div className="d-grid mt-5">
                    <Button 
                      variant="danger" 
                      type="submit" 
                      size="lg" 
                      className="fw-bold py-2 rounded-pill shadow-sm"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                          Authenticating...
                        </>
                      ) : (
                        'Secure Login'
                      )}
                    </Button>
                    <Button 
                      variant="link" 
                      className="text-muted mt-3 text-decoration-none"
                      onClick={() => navigate('/')}
                    >
                      ← Back to Home
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AdminLogin;