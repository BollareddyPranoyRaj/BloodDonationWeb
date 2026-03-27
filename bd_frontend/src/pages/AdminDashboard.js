import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Tabs, Tab, Spinner, Badge } from 'react-bootstrap';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('events');

  // --- Event Upload State ---
  const [eventData, setEventData] = useState({
    EventName: '',
    Date: '',
    Colleges: '', // Will be split by comma
  });
  const [eventImage, setEventImage] = useState(null);
  const [eventLoading, setEventLoading] = useState(false);

  // --- Gallery Upload State ---
  const [galleryImage, setGalleryImage] = useState(null);
  const [galleryLoading, setGalleryLoading] = useState(false);

  // --- Handlers for Event ---
  const handleEventChange = (e) => {
    const { name, value } = e.target;
    setEventData({ ...eventData, [name]: value });
  };

  const handleEventFileChange = (e) => {
    setEventImage(e.target.files[0]);
  };

  const handleEventSubmit = async (e) => {
    e.preventDefault();
    if (!eventData.EventName || !eventData.Date || !eventData.Colleges || !eventImage) {
      toast.warning('Please fill all fields and select an image.');
      return;
    }

    setEventLoading(true);
    const formData = new FormData();
    formData.append('EventName', eventData.EventName);
    formData.append('Date', eventData.Date);
    
    // Convert comma-separated string to an array, trim whitespace, then stringify for the backend
    const collegesArray = eventData.Colleges.split(',').map(c => c.trim()).filter(c => c !== '');
    formData.append('Colleges', JSON.stringify(collegesArray));
    formData.append('eventImage', eventImage);

    try {
      // Note: Make sure this endpoint matches the route defined in your backend's MyRouter.js
      const response = await axios.post(`${API_BASE_URL}/create-event`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.status === 200 || response.status === 201) {
        toast.success('Event uploaded successfully!');
        setEventData({ EventName: '', Date: '', Colleges: '' });
        setEventImage(null);
        document.getElementById('eventImageInput').value = '';
      }
    } catch (error) {
      console.error('Error uploading event:', error);
      toast.error('Failed to upload event. Please try again.');
    } finally {
      setEventLoading(false);
    }
  };

  // --- Handlers for Gallery ---
  const handleGalleryFileChange = (e) => {
    setGalleryImage(e.target.files[0]);
  };

  const handleGallerySubmit = async (e) => {
    e.preventDefault();
    if (!galleryImage) {
      toast.warning('Please select an image to upload.');
      return;
    }

    setGalleryLoading(true);
    const formData = new FormData();
    formData.append('galleryImage', galleryImage);

    try {
      // Note: Make sure this endpoint matches the route defined in your backend's MyRouter.js
      const response = await axios.post(`${API_BASE_URL}/upload-gallery`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.status === 200 || response.status === 201) {
        toast.success('Gallery image uploaded successfully!');
        setGalleryImage(null);
        document.getElementById('galleryImageInput').value = '';
      }
    } catch (error) {
      console.error('Error uploading gallery image:', error);
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setGalleryLoading(false);
    }
  };

  // --- Logout ---
  const handleLogout = () => {
    toast.info('Logged out successfully.');
    navigate('/');
  };

  return (
    <div className="admin-dashboard bg-light min-vh-100 pb-5">
      {/* Admin Navbar / Header */}
      <div className="bg-dark text-white py-3 mb-4 shadow-sm">
        <Container className="d-flex justify-content-between align-items-center">
          <h4 className="mb-0 fw-bold">Admin Workspace</h4>
          <div>
            <Badge bg="danger" className="me-3 px-3 py-2">Authorized</Badge>
            <Button variant="outline-light" size="sm" onClick={handleLogout}>Logout</Button>
          </div>
        </Container>
      </div>

      <Container>
        <Row className="justify-content-center">
          <Col lg={8}>
            <Card className="border-0 shadow-sm rounded-lg">
              <Card.Body className="p-4">
                <Tabs
                  id="admin-tabs"
                  activeKey={activeTab}
                  onSelect={(k) => setActiveTab(k)}
                  className="mb-4"
                  variant="pills"
                >
                  {/* --- EVENT UPLOAD TAB --- */}
                  <Tab eventKey="events" title="Upload New Event">
                    <div className="pt-3">
                      <h5 className="fw-bold mb-4 text-dark">Add Blood Donation Camp</h5>
                      <Form onSubmit={handleEventSubmit}>
                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label className="fw-semibold">Event Name</Form.Label>
                              <Form.Control 
                                type="text" 
                                placeholder="e.g., Mega Blood Drive 2026" 
                                name="EventName"
                                value={eventData.EventName}
                                onChange={handleEventChange}
                                required
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label className="fw-semibold">Event Date</Form.Label>
                              <Form.Control 
                                type="date" 
                                name="Date"
                                value={eventData.Date}
                                onChange={handleEventChange}
                                required
                              />
                            </Form.Group>
                          </Col>
                        </Row>

                        <Form.Group className="mb-3">
                          <Form.Label className="fw-semibold">Participating Colleges/Venues</Form.Label>
                          <Form.Control 
                            type="text" 
                            placeholder="e.g., AEC, ACET, ACOE (comma separated)" 
                            name="Colleges"
                            value={eventData.Colleges}
                            onChange={handleEventChange}
                            required
                          />
                          <Form.Text className="text-muted">
                            Separate multiple colleges with a comma.
                          </Form.Text>
                        </Form.Group>

                        <Form.Group className="mb-4">
                          <Form.Label className="fw-semibold">Event Banner/Image</Form.Label>
                          <Form.Control 
                            type="file" 
                            id="eventImageInput"
                            accept="image/jpeg, image/png, image/jpg"
                            onChange={handleEventFileChange}
                            required
                          />
                        </Form.Group>

                        <Button 
                          variant="danger" 
                          type="submit" 
                          disabled={eventLoading}
                          className="px-4 fw-bold"
                        >
                          {eventLoading ? <Spinner size="sm" animation="border" className="me-2" /> : null}
                          {eventLoading ? 'Uploading...' : 'Publish Event'}
                        </Button>
                      </Form>
                    </div>
                  </Tab>

                  {/* --- GALLERY UPLOAD TAB --- */}
                  <Tab eventKey="gallery" title="Upload to Gallery">
                    <div className="pt-3">
                      <h5 className="fw-bold mb-4 text-dark">Add Image to Wall of Life Savers</h5>
                      <Form onSubmit={handleGallerySubmit}>
                        <Form.Group className="mb-4">
                          <Form.Label className="fw-semibold">Select Photo</Form.Label>
                          <Form.Control 
                            type="file" 
                            id="galleryImageInput"
                            accept="image/jpeg, image/png, image/jpg"
                            onChange={handleGalleryFileChange}
                            required
                          />
                          <Form.Text className="text-muted">
                            Upload high-quality images from previous donation camps. Max size 10MB.
                          </Form.Text>
                        </Form.Group>

                        <Button 
                          variant="danger" 
                          type="submit" 
                          disabled={galleryLoading}
                          className="px-4 fw-bold"
                        >
                          {galleryLoading ? <Spinner size="sm" animation="border" className="me-2" /> : null}
                          {galleryLoading ? 'Uploading...' : 'Add to Gallery'}
                        </Button>
                      </Form>
                    </div>
                  </Tab>
                </Tabs>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AdminDashboard;
