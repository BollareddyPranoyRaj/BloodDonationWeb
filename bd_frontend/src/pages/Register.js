import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    RollNumber: '',
    PhoneNumber: '',
    EventDate: ''
  });
  const [loading, setLoading] = useState(false);

  // Use your backend URL port here based on your app.js (7001)
  const API_BASE_URL = 'http://localhost:7001/blooddonationbackend'; 

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.RollNumber || !formData.PhoneNumber || !formData.EventDate) {
      toast.warning('Please fill in all fields.');
      return;
    }

    if (formData.PhoneNumber.length < 10) {
      toast.error('Please enter a valid phone number.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/register`, formData);
      
      if (response.status === 200 || response.status === 201) {
        if (response.data.message === 'Student already exists' || response.data === 'Student is already registered for this event date') {
          toast.info('You are already registered for this event!');
        } else {
          toast.success('Registration successful! Thank you for volunteering to save lives.');
          // Reset form after successful registration
          setFormData({
            RollNumber: '',
            PhoneNumber: '',
            EventDate: ''
          });
          setTimeout(() => navigate('/'), 2000);
        }
      }
    } catch (error) {
      console.error('Registration Error:', error);
      toast.error('Registration failed. Please try again or check your Roll Number.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow-lg border-0 rounded-lg mt-5">
            <Card.Header className="bg-danger text-white text-center py-4 rounded-top">
              <h3 className="mb-0 fw-bold">Donor Registration</h3>
              <p className="mb-0 mt-2 text-white-50">Join the life-saving mission today.</p>
            </Card.Header>
            <Card.Body className="p-4 p-md-5">
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-4" controlId="formRollNumber">
                  <Form.Label className="fw-semibold">Roll Number</Form.Label>
                  <Form.Control 
                    type="text" 
                    placeholder="Enter your university roll number" 
                    name="RollNumber"
                    value={formData.RollNumber}
                    onChange={handleChange}
                    className="py-2"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-4" controlId="formPhoneNumber">
                  <Form.Label className="fw-semibold">Phone Number</Form.Label>
                  <Form.Control 
                    type="tel" 
                    placeholder="Enter your 10-digit mobile number" 
                    name="PhoneNumber"
                    value={formData.PhoneNumber}
                    onChange={handleChange}
                    className="py-2"
                    maxLength="10"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-5" controlId="formEventDate">
                  <Form.Label className="fw-semibold">Select Event Date</Form.Label>
                  <Form.Control 
                    type="date" 
                    name="EventDate"
                    value={formData.EventDate}
                    onChange={handleChange}
                    className="py-2"
                    required
                  />
                </Form.Group>

                <div className="d-grid gap-2">
                  <Button 
                    variant="danger" 
                    type="submit" 
                    size="lg" 
                    className="fw-bold py-2 rounded-pill shadow-sm"
                    disabled={loading}
                  >
                    {loading ? 'Registering...' : 'Register Now'}
                  </Button>
                  <Button 
                    variant="light" 
                    onClick={() => navigate('/')} 
                    className="fw-semibold py-2 rounded-pill mt-2 text-muted"
                  >
                    Cancel
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;