import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Tabs, Tab, Spinner, Badge } from 'react-bootstrap';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('events');
  const [eventOptions, setEventOptions] = useState([]);

  // --- Event Upload State ---
  const [eventData, setEventData] = useState({ EventName: '', Date: '', Colleges: '' });
  const [eventImage, setEventImage] = useState(null);
  const [eventLoading, setEventLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);

  // --- Gallery Upload State ---
  const [galleryImage, setGalleryImage] = useState(null);
  const [galleryLoading, setGalleryLoading] = useState(false);

  // --- Donation Desk State ---
  const [donationDeskData, setDonationDeskData] = useState({
    RollNumber: '', PhoneNumber: '',
    EventDate: new Date().toISOString().split('T')[0],
    SelectedEventId: '', SelectedEventName: '',
  });
  const [donationLookup, setDonationLookup] = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  // --- Staff State ---
  const [staffData, setStaffData] = useState({
    StaffName: '', StaffId: '', CollegeName: '', MobileNumber: '', Email: '',
    EventDate: new Date().toISOString().split('T')[0], Venue: '', BloodGroup: '',
  });
  const [staffLoading, setStaffLoading] = useState(false);

  // --- Guest Management State ---
  const [guestManagementData, setGuestManagementData] = useState({
    Name: '', TypeOfDonor: 'Guest', MobileNumber: '',
    EventDate: new Date().toISOString().split('T')[0], Venue: '', BloodGroup: '',
  });
  const [guestManagementLoading, setGuestManagementLoading] = useState(false);

  // --- Volunteer State ---
  const [volunteerData, setVolunteerData] = useState({
    Name: '', TypeOfVolunteer: '', Id: '',
    PhoneNumber: '', Branch: '', LinkedInProfile: '',
  });
  const [volunteerLoading, setVolunteerLoading] = useState(false);
  const [volunteers, setVolunteers] = useState([]);
  const [volunteersListLoading, setVolunteersListLoading] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/events`);
        setEventOptions(response.data || []);
      } catch (error) {
        console.error('Error fetching event options:', error);
      }
    };
    fetchEvents();
  }, []);

  // Fetch volunteers when tab is opened
  useEffect(() => {
    if (activeTab === 'volunteers') {
      fetchVolunteers();
    }
  }, [activeTab]);

  const fetchVolunteers = async () => {
    setVolunteersListLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/volunteers`);
      setVolunteers(response.data || []);
    } catch (error) {
      console.error('Error fetching volunteers:', error);
    } finally {
      setVolunteersListLoading(false);
    }
  };

  // --- Delete Event Handler ---
  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    setDeleteLoading(eventId);
    try {
      await axios.delete(`${API_BASE_URL}/event/${eventId}`);
      setEventOptions(prev => prev.filter(e => e._id !== eventId));
      toast.success('Event deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete event.');
    } finally {
      setDeleteLoading(null);
    }
  };

  // --- Event Handlers ---
  const handleEventChange = (e) => {
    const { name, value } = e.target;
    setEventData({ ...eventData, [name]: value });
  };

  const handleEventFileChange = (e) => setEventImage(e.target.files[0]);

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
    const collegesArray = eventData.Colleges.split(',').map(c => c.trim()).filter(c => c !== '');
    formData.append('Colleges', JSON.stringify(collegesArray));
    formData.append('eventImage', eventImage);
    try {
      const response = await axios.post(`${API_BASE_URL}/create-event`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.status === 200 || response.status === 201) {
        toast.success('Event uploaded successfully!');
        setEventData({ EventName: '', Date: '', Colleges: '' });
        setEventImage(null);
        document.getElementById('eventImageInput').value = '';
        const updated = await axios.get(`${API_BASE_URL}/events`);
        setEventOptions(updated.data || []);
      }
    } catch (error) {
      toast.error('Failed to upload event. Please try again.');
    } finally {
      setEventLoading(false);
    }
  };

  // --- Gallery Handlers ---
  const handleGalleryFileChange = (e) => setGalleryImage(e.target.files[0]);

  const handleGallerySubmit = async (e) => {
    e.preventDefault();
    if (!galleryImage) { toast.warning('Please select an image to upload.'); return; }
    setGalleryLoading(true);
    const formData = new FormData();
    formData.append('galleryImage', galleryImage);
    try {
      const response = await axios.post(`${API_BASE_URL}/upload-gallery`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.status === 200 || response.status === 201) {
        toast.success('Gallery image uploaded successfully!');
        setGalleryImage(null);
        document.getElementById('galleryImageInput').value = '';
      }
    } catch (error) {
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setGalleryLoading(false);
    }
  };

  // --- Donation Desk Handlers ---
  const handleDonationDeskChange = (e) => {
    const { name, value } = e.target;
    setDonationDeskData((prev) => ({ ...prev, [name]: value }));
  };

  const resetDonationDesk = () => {
    setDonationDeskData({
      RollNumber: '', PhoneNumber: '',
      EventDate: new Date().toISOString().split('T')[0],
      SelectedEventId: '', SelectedEventName: '',
    });
    setDonationLookup(null);
  };

  const handleDonorLookup = async (e) => {
    e.preventDefault();
    if (!donationDeskData.RollNumber || !donationDeskData.EventDate) {
      toast.warning('Enter roll number and event date first.');
      return;
    }
    setLookupLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/registrations/search`, {
        params: { rollno: donationDeskData.RollNumber, eventDate: donationDeskData.EventDate },
      });
      setDonationLookup(response.data);
      setDonationDeskData((prev) => ({
        ...prev,
        SelectedEventId: response.data.data?.SelectedEventId || prev.SelectedEventId,
        SelectedEventName: response.data.data?.SelectedEventName || prev.SelectedEventName,
      }));
      if (response.data.donated) {
        toast.info('This donor is already marked as donated.');
      } else {
        toast.success('Registration found. You can confirm donation now.');
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setDonationLookup({ found: false, message: error.response.data?.message });
        toast.info('No registration found. You can still confirm and create it here.');
      } else {
        toast.error('Unable to check donor right now.');
      }
    } finally {
      setLookupLoading(false);
    }
  };

  const handleConfirmDonation = async (e) => {
    e.preventDefault();
    if (!donationDeskData.RollNumber || !donationDeskData.EventDate) {
      toast.warning('Enter roll number and event date first.');
      return;
    }
    if (!donationLookup?.found && !donationDeskData.PhoneNumber) {
      toast.warning('Phone number is required when registering a new donor at the desk.');
      return;
    }
    setConfirmLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/registrations/confirm-donation`, donationDeskData);
      setDonationLookup({ found: true, donated: true, data: response.data.data });
      setDonationDeskData((prev) => ({
        ...prev,
        SelectedEventId: response.data.data?.SelectedEventId || prev.SelectedEventId,
        SelectedEventName: response.data.data?.SelectedEventName || prev.SelectedEventName,
      }));
      toast.success(response.data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to confirm donation.');
    } finally {
      setConfirmLoading(false);
    }
  };

  // --- Staff Handlers ---
  const handleStaffChange = (e) => {
    const { name, value } = e.target;
    if (name === 'Venue') {
      const selectedEvent = eventOptions.find((event) => event.EventName === value);
      setStaffData((prev) => ({
        ...prev, Venue: value,
        EventDate: selectedEvent?.Date ? new Date(selectedEvent.Date).toISOString().split('T')[0] : prev.EventDate,
      }));
      return;
    }
    setStaffData((prev) => ({ ...prev, [name]: value }));
  };

  const resetStaffForm = () => setStaffData({
    StaffName: '', StaffId: '', CollegeName: '', MobileNumber: '',
    EventDate: new Date().toISOString().split('T')[0], Venue: '', BloodGroup: '',
  });

  const handleStaffSubmit = async (e) => {
    e.preventDefault();
    setStaffLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/add-staff`, staffData);
      toast.success(response.data.message || 'Staff donor added successfully.');
      resetStaffForm();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add staff donor.');
    } finally {
      setStaffLoading(false);
    }
  };

  // --- Guest Management Handlers ---
  const handleGuestManagementChange = (e) => {
    const { name, value } = e.target;
    if (name === 'Venue') {
      const selectedEvent = eventOptions.find((event) => event.EventName === value);
      setGuestManagementData((prev) => ({
        ...prev, Venue: value,
        EventDate: selectedEvent?.Date ? new Date(selectedEvent.Date).toISOString().split('T')[0] : prev.EventDate,
      }));
      return;
    }
    setGuestManagementData((prev) => ({ ...prev, [name]: value }));
  };

  const resetGuestManagementForm = () => setGuestManagementData({
    Name: '', TypeOfDonor: 'Guest', MobileNumber: '',
    EventDate: new Date().toISOString().split('T')[0], Venue: '', BloodGroup: '',
  });

  const handleGuestManagementSubmit = async (e) => {
    e.preventDefault();
    setGuestManagementLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/add-guest-management`, guestManagementData);
      toast.success(response.data.message || 'Guest/Management donor added successfully.');
      resetGuestManagementForm();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add guest/management donor.');
    } finally {
      setGuestManagementLoading(false);
    }
  };

  // --- Volunteer Handlers ---
  const handleVolunteerChange = (e) => {
    const { name, value } = e.target;
    setVolunteerData((prev) => ({ ...prev, [name]: value }));
  };

  const resetVolunteerForm = () => setVolunteerData({
    Name: '', TypeOfVolunteer: '', Id: '',
    PhoneNumber: '', Branch: '', LinkedInProfile: '',
  });

  const handleVolunteerSubmit = async (e) => {
    e.preventDefault();
    setVolunteerLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/add-volunteer`, volunteerData);
      toast.success(response.data.message || 'Volunteer added successfully.');
      resetVolunteerForm();
      fetchVolunteers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add volunteer.');
    } finally {
      setVolunteerLoading(false);
    }
  };

  const handleLogout = () => {
    toast.info('Logged out successfully.');
    navigate('/');
  };

  return (
    <div className="admin-dashboard bg-light min-vh-100 pb-5">
      {/* Admin Navbar */}
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
                              <Form.Control type="text" placeholder="e.g., Mega Blood Drive 2026" name="EventName" value={eventData.EventName} onChange={handleEventChange} required />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label className="fw-semibold">Event Date</Form.Label>
                              <Form.Control type="date" name="Date" value={eventData.Date} onChange={handleEventChange} required />
                            </Form.Group>
                          </Col>
                        </Row>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-semibold">Participating Colleges/Venues</Form.Label>
                          <Form.Control type="text" placeholder="e.g., AEC, ACET, ACOE (comma separated)" name="Colleges" value={eventData.Colleges} onChange={handleEventChange} required />
                          <Form.Text className="text-muted">Separate multiple colleges with a comma.</Form.Text>
                        </Form.Group>
                        <Form.Group className="mb-4">
                          <Form.Label className="fw-semibold">Event Banner/Image</Form.Label>
                          <Form.Control type="file" id="eventImageInput" accept="image/jpeg, image/png, image/jpg" onChange={handleEventFileChange} required />
                        </Form.Group>
                        <Button variant="danger" type="submit" disabled={eventLoading} className="px-4 fw-bold">
                          {eventLoading ? <Spinner size="sm" animation="border" className="me-2" /> : null}
                          {eventLoading ? 'Uploading...' : 'Publish Event'}
                        </Button>
                      </Form>

                      {/* Existing Events List */}
                      {eventOptions.length > 0 && (
                        <div className="mt-4">
                          <h6 className="fw-bold mb-3 text-dark">Existing Events</h6>
                          {eventOptions.map(event => (
                            <Card key={event._id} className="mb-2 border-0 bg-light">
                              <Card.Body className="py-2 px-3 d-flex justify-content-between align-items-center">
                                <div>
                                  <strong>{event.EventName}</strong>
                                  <span className="text-muted ms-2 small">{new Date(event.Date).toLocaleDateString()}</span>
                                </div>
                                <Button variant="outline-danger" size="sm" disabled={deleteLoading === event._id} onClick={() => handleDeleteEvent(event._id)}>
                                  {deleteLoading === event._id ? <Spinner size="sm" animation="border" /> : 'Delete'}
                                </Button>
                              </Card.Body>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  </Tab>

                  {/* --- GALLERY UPLOAD TAB --- */}
                  <Tab eventKey="gallery" title="Upload to Gallery">
                    <div className="pt-3">
                      <h5 className="fw-bold mb-4 text-dark">Add Image to Wall of Life Savers</h5>
                      <Form onSubmit={handleGallerySubmit}>
                        <Form.Group className="mb-4">
                          <Form.Label className="fw-semibold">Select Photo</Form.Label>
                          <Form.Control type="file" id="galleryImageInput" accept="image/jpeg, image/png, image/jpg" onChange={handleGalleryFileChange} required />
                          <Form.Text className="text-muted">Upload high-quality images from previous donation camps. Max size 10MB.</Form.Text>
                        </Form.Group>
                        <Button variant="danger" type="submit" disabled={galleryLoading} className="px-4 fw-bold">
                          {galleryLoading ? <Spinner size="sm" animation="border" className="me-2" /> : null}
                          {galleryLoading ? 'Uploading...' : 'Add to Gallery'}
                        </Button>
                      </Form>
                    </div>
                  </Tab>

                  {/* --- DONATION DESK TAB --- */}
                  <Tab eventKey="donation-desk" title="Donation Desk">
                    <div className="pt-3">
                      <h5 className="fw-bold mb-2 text-dark">Confirm Completed Donation</h5>
                      <p className="text-muted mb-4">Search by roll number. If the donor was already registered outside, just confirm donation. If not, enter the phone number here and the system will register and confirm in one step.</p>
                      <Form onSubmit={handleDonorLookup}>
                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label className="fw-semibold">Roll Number</Form.Label>
                              <Form.Control type="text" name="RollNumber" placeholder="Enter donor roll number" value={donationDeskData.RollNumber} onChange={handleDonationDeskChange} required />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label className="fw-semibold">Event Date</Form.Label>
                              <Form.Control type="date" name="EventDate" value={donationDeskData.EventDate} onChange={handleDonationDeskChange} required />
                            </Form.Group>
                          </Col>
                        </Row>
                        <Form.Group className="mb-4">
                          <Form.Label className="fw-semibold">Phone Number</Form.Label>
                          <Form.Control type="tel" name="PhoneNumber" placeholder="Only needed if the donor was not registered outside" value={donationDeskData.PhoneNumber} onChange={handleDonationDeskChange} />
                          <Form.Text className="text-muted">Leave this empty if the donor is already registered.</Form.Text>
                        </Form.Group>
                        <div className="d-flex flex-wrap gap-2 mb-4">
                          <Button variant="outline-dark" type="submit" disabled={lookupLoading}>
                            {lookupLoading ? <Spinner size="sm" animation="border" className="me-2" /> : null}
                            {lookupLoading ? 'Checking...' : 'Check Donor'}
                          </Button>
                          <Button variant="danger" type="button" disabled={confirmLoading} onClick={handleConfirmDonation}>
                            {confirmLoading ? <Spinner size="sm" animation="border" className="me-2" /> : null}
                            {confirmLoading ? 'Confirming...' : 'Mark as Donated'}
                          </Button>
                          <Button variant="light" type="button" className="border" onClick={resetDonationDesk}>Reset</Button>
                        </div>
                      </Form>
                      {donationLookup ? (
                        <Card className="border-0 bg-light">
                          <Card.Body>
                            <h6 className="fw-bold mb-3">Desk Result</h6>
                            {donationLookup.found ? (
                              <>
                                <p className="mb-2"><strong>Name:</strong> {donationLookup.data?.studentname || 'N/A'}</p>
                                <p className="mb-2"><strong>Roll Number:</strong> {donationLookup.data?.rollno || donationDeskData.RollNumber}</p>
                                <p className="mb-2"><strong>College:</strong> {donationLookup.data?.college || 'N/A'}</p>
                                <p className="mb-0"><strong>Status:</strong>{' '}{donationLookup.donated ? 'Donation already confirmed' : 'Registered, waiting for donation confirmation'}</p>
                              </>
                            ) : (
                              <p className="mb-0 text-muted">{donationLookup.message || 'No donor found for this event date.'}</p>
                            )}
                          </Card.Body>
                        </Card>
                      ) : null}
                    </div>
                  </Tab>

                  {/* --- MANUAL DONOR ENTRY TAB --- */}
                  <Tab eventKey="manual-donor-entry" title="Manual Donor Entry">
                    <div className="pt-3">
                      <h5 className="fw-bold mb-2 text-dark">Add Staff and Guest/Management Donors</h5>
                      <p className="text-muted mb-4">Use this tab for donors who are not part of the student registration flow.</p>
                      <Row className="g-4">
                        <Col md={6}>
                          <Card className="border-0 bg-light h-100">
                            <Card.Body>
                              <h6 className="fw-bold mb-3">Staff Donor</h6>
                              <Form onSubmit={handleStaffSubmit}>
                                <Form.Group className="mb-3">
                                  <Form.Label className="fw-semibold">Staff Name</Form.Label>
                                  <Form.Control type="text" name="StaffName" value={staffData.StaffName} onChange={handleStaffChange} required />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                  <Form.Label className="fw-semibold">Staff ID</Form.Label>
                                  <Form.Control type="text" name="StaffId" value={staffData.StaffId} onChange={handleStaffChange} required />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                <Form.Label className="fw-semibold">College / Organization</Form.Label>
                                  <Form.Select name="CollegeName" value={staffData.CollegeName} onChange={handleStaffChange} required>
                                    <option value="">Select a college</option>
                                    <option value="Aditya University">Aditya University</option>
                                    <option value="Aditya College of Engineering & Technology">Aditya College of Engineering & Technology</option>
                                    <option value="Aditya College of Pharmacy">Aditya College of Pharmacy</option>
                                    <option value="Aditya Polytechnic College">Aditya Polytechnic College</option>
                                  </Form.Select>
                                </Form.Group>
                                <Form.Group className="mb-3">
                                  <Form.Label className="fw-semibold">Mobile Number</Form.Label>
                                  <Form.Control type="tel" name="MobileNumber" value={staffData.MobileNumber} onChange={handleStaffChange} required />
                                </Form.Group>
                                <Row>
                                  <Col sm={6}>
                                    <Form.Group className="mb-3">
                                      <Form.Label className="fw-semibold">Event Date</Form.Label>
                                      <Form.Control type="date" name="EventDate" value={staffData.EventDate} required readOnly disabled />
                                      <Form.Text className="text-muted">Auto-filled from the selected event.</Form.Text>
                                    </Form.Group>
                                  </Col>
                                  <Col sm={6}>
                                    <Form.Group className="mb-3">
                                      <Form.Label className="fw-semibold">Blood Group</Form.Label>
                                      <Form.Control type="text" name="BloodGroup" placeholder="Optional" value={staffData.BloodGroup} onChange={handleStaffChange} />
                                    </Form.Group>
                                  </Col>
                                </Row>
                                <Form.Group className="mb-4">
                                  <Form.Label className="fw-semibold">Venue / Event Name</Form.Label>
                                  <Form.Select name="Venue" value={staffData.Venue} onChange={handleStaffChange} required>
                                    <option value="">Select an event</option>
                                    {eventOptions.map((event) => (
                                      <option key={event._id} value={event.EventName}>{event.EventName} ({new Date(event.Date).toLocaleDateString()})</option>
                                    ))}
                                  </Form.Select>
                                </Form.Group>
                                <div className="d-flex flex-wrap gap-2">
                                  <Button variant="danger" type="submit" disabled={staffLoading}>
                                    {staffLoading ? <Spinner size="sm" animation="border" className="me-2" /> : null}
                                    {staffLoading ? 'Saving...' : 'Add Staff Donor'}
                                  </Button>
                                  <Button variant="light" type="button" className="border" onClick={resetStaffForm}>Reset</Button>
                                </div>
                              </Form>
                            </Card.Body>
                          </Card>
                        </Col>
                        <Col md={6}>
                          <Card className="border-0 bg-light h-100">
                            <Card.Body>
                              <h6 className="fw-bold mb-3">Guest / Management Donor</h6>
                              <Form onSubmit={handleGuestManagementSubmit}>
                                <Form.Group className="mb-3">
                                  <Form.Label className="fw-semibold">Donor Name</Form.Label>
                                  <Form.Control type="text" name="Name" value={guestManagementData.Name} onChange={handleGuestManagementChange} required />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                  <Form.Label className="fw-semibold">Donor Type</Form.Label>
                                  <Form.Select name="TypeOfDonor" value={guestManagementData.TypeOfDonor} onChange={handleGuestManagementChange} required>
                                    <option value="Guest">Guest</option>
                                    <option value="Management">Management</option>
                                  </Form.Select>
                                </Form.Group>
                                <Form.Group className="mb-3">
                                  <Form.Label className="fw-semibold">Mobile Number</Form.Label>
                                  <Form.Control type="tel" name="MobileNumber" value={guestManagementData.MobileNumber} onChange={handleGuestManagementChange} required />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                  <Form.Label className="fw-semibold">Email</Form.Label>
                                  <Form.Control type="email" name="Email" placeholder="Optional" value={guestManagementData.Email} onChange={handleGuestManagementChange} />
                                </Form.Group>
                                <Row>
                                  <Col sm={6}>
                                    <Form.Group className="mb-3">
                                      <Form.Label className="fw-semibold">Event Date</Form.Label>
                                      <Form.Control type="date" name="EventDate" value={guestManagementData.EventDate} required readOnly disabled />
                                      <Form.Text className="text-muted">Auto-filled from the selected event.</Form.Text>
                                    </Form.Group>
                                  </Col>
                                  <Col sm={6}>
                                    <Form.Group className="mb-3">
                                      <Form.Label className="fw-semibold">Blood Group</Form.Label>
                                      <Form.Control type="text" name="BloodGroup" placeholder="Optional" value={guestManagementData.BloodGroup} onChange={handleGuestManagementChange} />
                                    </Form.Group>
                                  </Col>
                                </Row>
                                <Form.Group className="mb-4">
                                  <Form.Label className="fw-semibold">Venue / Event Name</Form.Label>
                                  <Form.Select name="Venue" value={guestManagementData.Venue} onChange={handleGuestManagementChange} required>
                                    <option value="">Select an event</option>
                                    {eventOptions.map((event) => (
                                      <option key={event._id} value={event.EventName}>{event.EventName} ({new Date(event.Date).toLocaleDateString()})</option>
                                    ))}
                                  </Form.Select>
                                </Form.Group>
                                <div className="d-flex flex-wrap gap-2">
                                  <Button variant="danger" type="submit" disabled={guestManagementLoading}>
                                    {guestManagementLoading ? <Spinner size="sm" animation="border" className="me-2" /> : null}
                                    {guestManagementLoading ? 'Saving...' : 'Add Guest / Management'}
                                  </Button>
                                  <Button variant="light" type="button" className="border" onClick={resetGuestManagementForm}>Reset</Button>
                                </div>
                              </Form>
                            </Card.Body>
                          </Card>
                        </Col>
                      </Row>
                    </div>
                  </Tab>

                  {/* --- VOLUNTEERS TAB --- */}
                  <Tab eventKey="volunteers" title="Volunteers">
                    <div className="pt-3">
                      <h5 className="fw-bold mb-2 text-dark">Add Volunteer</h5>
                      <p className="text-muted mb-4">Register volunteers who helped organize the blood donation camps.</p>

                      <Form onSubmit={handleVolunteerSubmit}>
                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label className="fw-semibold">Full Name</Form.Label>
                              <Form.Control type="text" name="Name" placeholder="e.g., Pranoy Raj" value={volunteerData.Name} onChange={handleVolunteerChange} required />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label className="fw-semibold">Type of Volunteer</Form.Label>
                              <Form.Select name="TypeOfVolunteer" value={volunteerData.TypeOfVolunteer} onChange={handleVolunteerChange} required>
                                <option value="">Select type</option>
                                <option value="Coordinator">Coordinator</option>
                                <option value="Helper">Helper</option>
                                <option value="Organizer">Organizer</option>
                                <option value="Medical Staff">Medical Staff</option>
                                <option value="Other">Other</option>
                              </Form.Select>
                            </Form.Group>
                          </Col>
                        </Row>
                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label className="fw-semibold">ID (Roll No / Staff ID)</Form.Label>
                              <Form.Control type="text" name="Id" placeholder="e.g., 22A91A0501" value={volunteerData.Id} onChange={handleVolunteerChange} required />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label className="fw-semibold">Phone Number</Form.Label>
                              <Form.Control type="tel" name="PhoneNumber" placeholder="e.g., 9876543210" value={volunteerData.PhoneNumber} onChange={handleVolunteerChange} required />
                            </Form.Group>
                          </Col>
                        </Row>
                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label className="fw-semibold">Branch / Department</Form.Label>
                              <Form.Control type="text" name="Branch" placeholder="e.g., CSE, ECE, MBA" value={volunteerData.Branch} onChange={handleVolunteerChange} required />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label className="fw-semibold">LinkedIn Profile URL</Form.Label>
                              <Form.Control type="url" name="LinkedInProfile" placeholder="https://linkedin.com/in/username" value={volunteerData.LinkedInProfile} onChange={handleVolunteerChange} required />
                            </Form.Group>
                          </Col>
                        </Row>
                        <div className="d-flex flex-wrap gap-2 mb-4">
                          <Button variant="danger" type="submit" disabled={volunteerLoading} className="px-4 fw-bold">
                            {volunteerLoading ? <Spinner size="sm" animation="border" className="me-2" /> : null}
                            {volunteerLoading ? 'Saving...' : 'Add Volunteer'}
                          </Button>
                          <Button variant="light" type="button" className="border" onClick={resetVolunteerForm}>Reset</Button>
                        </div>
                      </Form>

                      {/* Volunteers List */}
                      <div className="mt-2">
                        <h6 className="fw-bold mb-3 text-dark">
                          Registered Volunteers
                          {volunteersListLoading && <Spinner size="sm" animation="border" className="ms-2" />}
                        </h6>
                        {volunteers.length === 0 && !volunteersListLoading ? (
                          <p className="text-muted">No volunteers added yet.</p>
                        ) : (
                          volunteers.map(v => (
                            <Card key={v._id} className="mb-2 border-0 bg-light">
                              <Card.Body className="py-2 px-3">
                                <div className="d-flex justify-content-between align-items-center">
                                  <div>
                                    <strong>{v.Name}</strong>
                                    <Badge bg="secondary" className="ms-2">{v.TypeOfVolunteer}</Badge>
                                  </div>
                                  <a href={v.LinkedInProfile} target="_blank" rel="noreferrer">
                                    <Button variant="outline-primary" size="sm">LinkedIn</Button>
                                  </a>
                                </div>
                                <div className="mt-1 small text-muted">
                                  {v.Id} &bull; {v.Branch} &bull; {v.PhoneNumber}
                                </div>
                              </Card.Body>
                            </Card>
                          ))
                        )}
                      </div>
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